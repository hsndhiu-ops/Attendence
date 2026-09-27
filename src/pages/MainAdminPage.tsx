import React from 'react';
import { 
  ClearanceRequest, 
  Teacher, 
  ClassEntity, 
  Subject 
} from '../types';
import { MainAdminDashboard } from '../components/MainAdminDashboard';

interface MainAdminPageProps {
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

export const MainAdminPage: React.FC<MainAdminPageProps> = (props) => {
  return (
    <div className="w-full">
      <MainAdminDashboard {...props} />
    </div>
  );
};
