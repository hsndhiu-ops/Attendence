import { ClearanceRequest, RejectionTemplate } from '../types';

export const REJECTION_TEMPLATES: RejectionTemplate[] = [
  {
    id: 'overdue_rejection',
    name: 'Overdue Deadline Rejection (14-Day Limit)',
    description: 'Auto-filled with leave dates, calculated 14-day deadline, and actual submission date.',
    defaultReason: 'Request submitted exceeding the statutory 14-day clearance window.',
    generateBody: (req: ClearanceRequest, customNote?: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
        <div style="background: #991b1b; padding: 24px 32px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">Attendance Clearance — Rejection Notice (Overdue Submission)</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Office of the Dean & Academic Attendance Cell</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${req.student.name}</strong> (Roll No: <strong>${req.student.roll_no}</strong>),</p>
          <p style="font-size: 14px; color: #334155;">Your attendance clearance request for the period <strong>${req.leave_start_date}</strong> to <strong>${req.leave_end_date}</strong> has been <strong>REJECTED</strong> due to non-compliance with the college submission deadline regulation.</p>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Timeline & Deadline Audit</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Leave Period:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${req.leave_start_date} to ${req.leave_end_date}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">14-Day Permissible Deadline:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #dc2626;">${req.deadline_date} (Expired)</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Actual Date of Submission:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${req.submission_date}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Assigned Reviewer:</td>
                <td style="padding: 4px 0; color: #0f172a;">${req.assigned_teacher_name}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #334155;">
            <strong>Reason for Rejection:</strong> Under College Attendance Regulation 4.2, all leave clearance documentation must be formally lodged within 14 calendar days from the concluding date of absence. Because this request was lodged on ${req.submission_date}, the allowable submission period lapsed on ${req.deadline_date}.
          </p>

          ${customNote ? `<div style="background: #f8fafc; border-left: 3px solid #64748b; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #475569;"><strong>Reviewer Remarks:</strong> ${customNote}</div>` : ''}

          <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">If you possess extraordinary extenuating circumstances verified by the Head of Department, you may file an in-person appeal at the Administrative Academic Cell.</p>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          College Attendance Clearance System • Automatic System Notification
        </div>
      </div>
    `
  },
  {
    id: 'insufficient_documentation',
    name: 'Insufficient or Invalid Documentation',
    description: 'Medical certificate unreadable, unregistered clinic, or missing official seal.',
    defaultReason: 'Supporting documentation does not meet institutional verification criteria.',
    generateBody: (req: ClearanceRequest, customNote?: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
        <div style="background: #b91c1c; padding: 24px 32px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Attendance Clearance — Rejection Notice</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Documentation Verification Failed</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${req.student.name}</strong>,</p>
          <p style="font-size: 14px; color: #334155;">Your clearance request for <strong>${req.leave_start_date}</strong> to <strong>${req.leave_end_date}</strong> has been rejected by <strong>${req.assigned_teacher_name}</strong>.</p>
          
          <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 14px 18px; margin: 20px 0; font-size: 14px; color: #9a3412;">
            <strong>Grounds for Rejection:</strong> Insufficient or unverifiable supporting documents. Medical certificates must be issued by a registered practitioner with registration number, diagnosis, and valid clinic stamp.
          </div>

          ${customNote ? `<p style="font-size: 14px; color: #334155;"><strong>Teacher's Specific Remarks:</strong> ${customNote}</p>` : ''}
          
          <p style="font-size: 13px; color: #64748b;">You may resubmit a new request with the required authentic documentation within the allowable submission timeframe.</p>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          College Attendance Clearance System • Academic Affairs Desk
        </div>
      </div>
    `
  },
  {
    id: 'exam_conflict',
    name: 'Conflict with Mandatory Academic Assessment',
    description: 'Absence falls during lab exams, mid-term tests, or non-waivable sessions.',
    defaultReason: 'Absence coincided with scheduled internal assessments/practicals without prior dean approval.',
    generateBody: (req: ClearanceRequest, customNote?: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
        <div style="background: #b91c1c; padding: 24px 32px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Attendance Clearance — Rejection Notice</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Assessment Conflict</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${req.student.name}</strong>,</p>
          <p style="font-size: 14px; color: #334155;">Your request for clearance between <strong>${req.leave_start_date}</strong> and <strong>${req.leave_end_date}</strong> has been rejected by <strong>${req.assigned_teacher_name}</strong>.</p>
          
          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 14px 18px; margin: 20px 0; font-size: 14px; color: #9f1239;">
            <strong>Grounds for Rejection:</strong> The requested absence dates coincide with mandatory continuous assessment, practical examinations, or compulsory lab sessions where ex-post attendance credit is strictly disallowed.
          </div>

          ${customNote ? `<p style="font-size: 14px; color: #334155;"><strong>Teacher Notes:</strong> ${customNote}</p>` : ''}
          <p style="font-size: 13px; color: #64748b;">Please consult your departmental course coordinator for make-up examination options.</p>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          College Attendance Clearance System
        </div>
      </div>
    `
  },
  {
    id: 'general_rejection',
    name: 'General / Discretionary Rejection',
    description: 'Customizable reason specified by reviewing faculty.',
    defaultReason: 'Clearance cannot be sanctioned based on current academic attendance standing.',
    generateBody: (req: ClearanceRequest, customNote?: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
        <div style="background: #334155; padding: 24px 32px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Attendance Clearance — Request Disapproved</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Faculty Review Completed</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${req.student.name}</strong>,</p>
          <p style="font-size: 14px; color: #334155;">Your attendance clearance request (ID: <code>${req.id.slice(0, 8)}</code>) for the dates <strong>${req.leave_start_date}</strong> to <strong>${req.leave_end_date}</strong> has been reviewed and declined.</p>
          
          <div style="background: #f8fafc; border-left: 4px solid #64748b; padding: 14px 18px; margin: 20px 0; font-size: 14px; color: #1e293b;">
            <strong>Reason:</strong> ${customNote || 'Attendance clearance not granted for the stated reasons and duration.'}
          </div>
          <p style="font-size: 13px; color: #64748b;">Reviewer: <strong>${req.assigned_teacher_name}</strong> (${req.student.department || 'Academic Department'})</p>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          College Attendance Clearance System
        </div>
      </div>
    `
  }
];

// Teacher Approved Notification (sent to Student)
export function generateTeacherApprovedEmail(req: ClearanceRequest): { subject: string; html: string } {
  return {
    subject: `[Approved by Teacher] Attendance Clearance Request: ${req.student.name} (${req.leave_start_date} to ${req.leave_end_date})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
        <div style="background: #1e3a8a; padding: 24px 32px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Clearance Request Approved by Faculty</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Stage 2 of 3 Completed • Pending Office Admin Verification</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${req.student.name}</strong>,</p>
          <p style="font-size: 14px; color: #334155;">Great news! Your attendance clearance request has been <strong>APPROVED</strong> by <strong>${req.assigned_teacher_name}</strong>.</p>
          
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Leave Duration:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #1e3a8a;">${req.leave_start_date} to ${req.leave_end_date}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Reason Stated:</td>
                <td style="padding: 4px 0; color: #0f172a;">${req.reason}${req.reason_other_details ? ` (${req.reason_other_details})` : ''}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Subjects Missed:</td>
                <td style="padding: 4px 0; color: #0f172a;">${req.subjects_missed.join(', ')}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Current Stage:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #2563eb;">Stage 2: Approved by Teacher → Awaiting Admin Verification</td>
              </tr>
            </table>
          </div>

          <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #334155;">
            <strong>Important Institutional Notice:</strong> Faculty approval certifies validity of your absence. Final attendance database modification occurs when the College Office Administrator verifies this record in the college attendance system (SHUHOOD). You will receive an email confirmation once verified.
          </div>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          College Attendance Clearance System
        </div>
      </div>
    `
  };
}

// Admin Verified/Cleared Notification (Final stage sent to Student)
export function generateAdminVerifiedEmail(req: ClearanceRequest): { subject: string; html: string } {
  return {
    subject: `[CLEARED] Final Attendance Verification Confirmed: ${req.student.name} (${req.leave_start_date} to ${req.leave_end_date})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
        <div style="background: #15803d; padding: 24px 32px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Attendance Formally Verified & Cleared</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Process Complete • Attendance Record Updated in SHUHOOD</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${req.student.name}</strong> (Roll: <strong>${req.student.roll_no}</strong>),</p>
          <p style="font-size: 14px; color: #334155;">This is your official confirmation that your attendance clearance has been <strong>VERIFIED AND CLEARED</strong> by the College Office Administration.</p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <div style="font-size: 13px; font-weight: 700; color: #166534; text-transform: uppercase; margin-bottom: 8px;">Clearance Certificate Summary</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Student Name & Roll:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${req.student.name} (${req.student.roll_no})</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Class:</td>
                <td style="padding: 4px 0; color: #0f172a;">${req.student.class_name} (${req.student.department})</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Cleared Dates:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #166534;">${req.leave_start_date} through ${req.leave_end_date}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Approved By Faculty:</td>
                <td style="padding: 4px 0; color: #0f172a;">${req.assigned_teacher_name}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Office Status:</td>
                <td style="padding: 4px 0; font-weight: 600; color: #15803d;">Updated & Synchronized with College SHUHOOD System</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #334155;">Your official college attendance register has been credited for the missed periods. You may retain this electronic email for your records.</p>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          Office of Academic Records • College Attendance Clearance System
        </div>
      </div>
    `
  };
}

// New Request Notification (sent to Assigned Teacher and CC to Class Teacher)
export function generateNewRequestEmail(req: ClearanceRequest, isCcToClassTeacher = false): { subject: string; html: string } {
  const isOverdueAlert = req.is_overdue;
  const title = isCcToClassTeacher 
    ? `[CC: Student Request Routing] Attendance Clearance: ${req.student.name} (${req.student.roll_no})`
    : `${isOverdueAlert ? '[OVERDUE SUBMISSION] ' : ''}New Attendance Clearance Request: ${req.student.name} (${req.student.roll_no})`;

  return {
    subject: title,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
        <div style="background: ${isOverdueAlert ? '#991b1b' : '#0f172a'}; padding: 24px 32px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">
            ${isCcToClassTeacher ? 'Class Teacher Notification (CC)' : 'Action Required: Attendance Clearance Request'}
          </h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">
            ${isOverdueAlert ? '⚠️ SUBMITTED BEYOND 14-DAY POLICY DEADLINE' : 'Standard Faculty Review Desk'}
          </p>
        </div>
        <div style="padding: 32px;">
          ${isCcToClassTeacher ? `
            <div style="background: #f1f5f9; border-left: 4px solid #475569; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #334155;">
              <strong>Class Teacher Notice:</strong> Student ${req.student.name} selected <strong>${req.assigned_teacher_name}</strong> as the primary reviewing teacher. You are automatically copied as the designated Class Teacher.
            </div>
          ` : ''}

          ${isOverdueAlert ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 13px; color: #991b1b;">
              <strong>⚠️ Overdue Flag:</strong> The student submitted this request on <strong>${req.submission_date}</strong>. The 14-day policy deadline lapsed on <strong>${req.deadline_date}</strong>. You may exercise discretion to approve with justification or reject using the Overdue Rejection template.
            </div>
          ` : ''}

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 140px;">Student:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${req.student.name} (${req.student.roll_no})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Class / Dept:</td>
              <td style="padding: 6px 0; color: #0f172a;">${req.student.class_name} (${req.student.department})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Leave Range:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${req.leave_start_date} to ${req.leave_end_date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Reason:</td>
              <td style="padding: 6px 0; color: #0f172a;">${req.reason}${req.reason_other_details ? ` — "${req.reason_other_details}"` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Subjects Missed:</td>
              <td style="padding: 6px 0; color: #0f172a;">${req.subjects_missed.join(', ')}</td>
            </tr>
            ${req.remarks ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Remarks:</td>
              <td style="padding: 6px 0; color: #334155; font-style: italic;">"${req.remarks}"</td>
            </tr>
            ` : ''}
          </table>

          <p style="font-size: 13px; color: #475569;">Please log in to the Attendance Clearance Portal to view uploaded medical/official documents and record your decision.</p>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          College Attendance Clearance System • Faculty Portal
        </div>
      </div>
    `
  };
}

// 24-Hour Reminder Email (sent to Teacher)
export function generateTeacherReminderEmail(req: ClearanceRequest, senderRole: 'student' | 'admin'): { subject: string; html: string } {
  return {
    subject: `[REMINDER] Pending Attendance Clearance Request for ${req.student.name} (${req.student.roll_no})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
        <div style="background: #d97706; padding: 24px 32px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Action Reminder: Pending Clearance Request</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Initiated by: ${senderRole === 'admin' ? 'Office Administration' : 'Student (24h Inaction Trigger)'}</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 14px; color: #334155;">Respected <strong>${req.assigned_teacher_name}</strong>,</p>
          <p style="font-size: 14px; color: #334155;">This is a courtesy notification that the attendance clearance request submitted by <strong>${req.student.name}</strong> (Roll: ${req.student.roll_no}) has been awaiting your review for over 24 hours.</p>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 14px; margin: 20px 0; font-size: 13px;">
            <p style="margin: 0 0 6px 0;"><strong>Submission Date:</strong> ${req.submission_date}</p>
            <p style="margin: 0 0 6px 0;"><strong>Leave Range:</strong> ${req.leave_start_date} to ${req.leave_end_date}</p>
            <p style="margin: 0;"><strong>Status:</strong> ${req.is_overdue ? '⚠️ Overdue' : 'Normal Pending'}</p>
          </div>

          <p style="font-size: 13px; color: #475569;">Prompt clearance ensures accurate attendance reporting in SHUHOOD prior to final semester examination eligibility cutoffs.</p>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          College Attendance Clearance System
        </div>
      </div>
    `
  };
}
