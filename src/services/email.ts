import { ClearanceRequest, EmailLog } from '../types';
import { logEmailEvent } from './db';
import {
  REJECTION_TEMPLATES,
  generateTeacherApprovedEmail,
  generateAdminVerifiedEmail,
  generateNewRequestEmail,
  generateTeacherReminderEmail
} from './templates';

export interface SendEmailPayload {
  to: string;
  cc?: string;
  subject: string;
  html: string;
  text?: string;
  triggerType: EmailLog['trigger_type'];
  requestId?: string;
}

export interface SendEmailResponse {
  success: boolean;
  status: 'sent' | 'simulated' | 'failed';
  message: string;
  details?: string;
}

/**
 * Dispatch notification email through the backend Nodemailer Express endpoint.
 * If server is offline or Gmail SMTP credentials are not yet configured in .env,
 * it records a graceful simulated delivery with full audit logging in the client database.
 */
export async function dispatchEmail(payload: SendEmailPayload): Promise<SendEmailResponse> {
  let responseStatus: 'sent' | 'simulated' | 'failed' = 'simulated';
  let message = 'Email recorded';
  let details = '';

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      responseStatus = data.status || (data.simulated ? 'simulated' : 'sent');
      message = data.message || 'Notification sent successfully';
      details = data.details || '';
    } else {
      const err = await res.text();
      responseStatus = 'simulated';
      message = 'Notification recorded in simulation mode: ' + err;
    }
  } catch (e: any) {
    // Graceful offline/preview fallback
    responseStatus = 'simulated';
    message = 'Notification recorded (simulation mode)';
    details = e?.message || 'Network dispatch simulation';
  }

  // Log in local/Supabase audit table
  logEmailEvent({
    request_id: payload.requestId,
    recipient: payload.to,
    cc: payload.cc,
    subject: payload.subject,
    body_html: payload.html,
    trigger_type: payload.triggerType,
    status: responseStatus,
    details: message
  });

  return {
    success: true,
    status: responseStatus,
    message,
    details
  };
}

// 1. Trigger when a student submits a new clearance request
export async function sendNewRequestNotifications(req: ClearanceRequest): Promise<void> {
  // Primary email to Assigned Teacher
  const teacherEmailContent = generateNewRequestEmail(req, false);
  await dispatchEmail({
    to: req.assigned_teacher_email || 'teacher@college.edu',
    subject: teacherEmailContent.subject,
    html: teacherEmailContent.html,
    triggerType: 'new_request',
    requestId: req.id
  });

  // If student chose a teacher other than their default class teacher, CC the class teacher!
  if (req.class_teacher_email && req.class_teacher_id_if_different) {
    const classTeacherEmailContent = generateNewRequestEmail(req, true);
    await dispatchEmail({
      to: req.class_teacher_email,
      cc: req.assigned_teacher_email,
      subject: classTeacherEmailContent.subject,
      html: classTeacherEmailContent.html,
      triggerType: 'new_request',
      requestId: req.id
    });
  }
}

// 2. Trigger when Teacher approves the request
export async function sendTeacherApprovalEmail(req: ClearanceRequest): Promise<void> {
  const content = generateTeacherApprovedEmail(req);
  await dispatchEmail({
    to: req.student.gmail,
    subject: content.subject,
    html: content.html,
    triggerType: 'approved_by_teacher',
    requestId: req.id
  });
}

// 3. Trigger when Teacher or Admin rejects request
export async function sendRejectionEmail(
  req: ClearanceRequest, 
  templateId: string, 
  customNote?: string
): Promise<void> {
  const template = REJECTION_TEMPLATES.find(t => t.id === templateId) || REJECTION_TEMPLATES[0];
  const html = template.generateBody(req, customNote);
  const isOverdue = templateId === 'overdue_rejection' || req.is_overdue;

  const subject = isOverdue
    ? `[REJECTED: OVERDUE] Attendance Clearance Request: ${req.student.name} (${req.leave_start_date} to ${req.leave_end_date})`
    : `[REJECTED] Attendance Clearance Request Disapproved: ${req.student.name} (${req.leave_start_date} to ${req.leave_end_date})`;

  await dispatchEmail({
    to: req.student.gmail,
    subject,
    html,
    triggerType: isOverdue ? 'overdue_rejection' : 'rejected_by_teacher',
    requestId: req.id
  });
}

// 4. Trigger when Admin verifies and clears the request (final confirmation after SHUHOOD update)
export async function sendAdminVerificationEmail(req: ClearanceRequest): Promise<void> {
  const content = generateAdminVerifiedEmail(req);
  await dispatchEmail({
    to: req.student.gmail,
    subject: content.subject,
    html: content.html,
    triggerType: 'verified_by_admin',
    requestId: req.id
  });
}

// 5. Trigger when 24h reminder is sent to Teacher (by student or admin)
export async function sendReminderEmail(req: ClearanceRequest, senderRole: 'student' | 'admin'): Promise<void> {
  const content = generateTeacherReminderEmail(req, senderRole);
  await dispatchEmail({
    to: req.assigned_teacher_email || 'teacher@college.edu',
    subject: content.subject,
    html: content.html,
    triggerType: 'reminder_to_teacher',
    requestId: req.id
  });
}
