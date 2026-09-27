import React from 'react';
import { 
  ClearanceRequest, 
  Teacher, 
  ClassEntity, 
  Subject 
} from '../types';
import { AdminDashboard } from '../components/AdminDashboard';

interface AdminPageProps {
  requests: ClearanceRequest[];
  teachers: Teacher[];
  classes: ClassEntity[];
  subjects: Subject[];
  onVerifyRequest: (reqId: string, adminNotes?: string) => Promise<void>;
  onRejectRequest: (reqId: string, reason: string, templateType: string, customNote?: string) => Promise<void>;
  onApproveRequest: (reqId: string) => Promise<void>;
  onSendTeacherReminder: (req: ClearanceRequest) => Promise<void>;
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onDeleteTeacher: (id: string) => void;
  onAddClass: (cls: Omit<ClassEntity, 'id'>) => void;
  onDeleteClass: (id: string) => void;
  onAddSubject: (subj: Omit<Subject, 'id'>) => void;
  onDeleteSubject: (id: string) => void;
  onOpenEmailLogs: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = (props) => {
  return (
    <div className="w-full">
      <AdminDashboard {...props} />
    </div>
  );
};
