export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'verified';

export type LeaveReason = 
  | 'Medical' 
  | 'Family Emergency' 
  | 'Official College Work' 
  | 'Personal' 
  | 'Other';

export interface Student {
  id: string;
  roll_no: string;
  name: string;
  class_id: string;
  class_name: string;
  department: string;
  gmail: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  name: string;
  username: string;
  department: string;
  email: string;
  assigned_class_ids: string[];
}

export interface ClassEntity {
  id: string;
  name: string;
  department_combination: string;
  default_teacher_id: string;
  default_teacher_name?: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  class_ids: string[];
}

export interface ClassSubject {
  class_id: string;
  subject_id: string;
}

export interface ClearanceRequest {
  id: string;
  student_id: string;
  student: Student;
  teacher_id: string;
  assigned_teacher_name: string;
  assigned_teacher_email: string;
  class_teacher_id_if_different?: string;
  class_teacher_name?: string;
  class_teacher_email?: string;
  reason: LeaveReason;
  reason_other_details?: string;
  leave_start_date: string; // YYYY-MM-DD
  leave_end_date: string;   // YYYY-MM-DD
  submission_date: string;  // YYYY-MM-DD
  deadline_date: string;    // YYYY-MM-DD (leave_end_date + 14 days)
  subjects_missed: string[];
  remarks?: string;
  document_url?: string;
  document_name?: string;
  status: RequestStatus;
  is_overdue: boolean;      // submission_date > deadline_date
  created_at: string;       // ISO timestamp
  approved_at?: string;
  verified_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  rejection_template_type?: string;
  last_reminder_sent_at?: string;
  reminder_count?: number;
  admin_notes?: string;
}

export interface CreateRequestInput {
  student: Student;
  teacher_id: string;
  reason: LeaveReason;
  reason_other_details?: string;
  leave_start_date: string;
  leave_end_date: string;
  subjects_missed: string[];
  remarks?: string;
  document_url?: string;
  document_name?: string;
}

export interface EmailLog {
  id: string;
  request_id?: string;
  recipient: string;
  cc?: string;
  subject: string;
  body_html: string;
  trigger_type: 
    | 'new_request' 
    | 'approved_by_teacher' 
    | 'rejected_by_teacher' 
    | 'verified_by_admin' 
    | 'overdue_rejection' 
    | 'reminder_to_teacher';
  sent_at: string;
  status: 'sent' | 'simulated' | 'failed';
  details?: string;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface RejectionTemplate {
  id: string;
  name: string;
  description: string;
  defaultReason: string;
  generateBody: (request: ClearanceRequest, customNote?: string) => string;
}
