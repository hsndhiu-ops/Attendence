import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Teacher, ClearanceRequest } from '../types';
import { TeacherDashboard } from '../components/TeacherDashboard';

interface TeacherPageProps {
  requests: ClearanceRequest[];
  teachers: Teacher[];
  onApproveRequest: (reqId: string) => Promise<void>;
  onRejectRequest: (reqId: string, reason: string, templateType: string, customNote?: string) => Promise<void>;
}

export const TeacherPage: React.FC<TeacherPageProps> = ({
  requests,
  teachers,
  onApproveRequest,
  onRejectRequest
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  // Find or create Teacher entity matching logged-in user
  const currentTeacher: Teacher = teachers.find(
    t => t.id === currentUser.id || t.email.toLowerCase() === currentUser.email.toLowerCase()
  ) || {
    id: currentUser.id,
    name: currentUser.name,
    username: currentUser.email.split('@')[0],
    department: currentUser.department || 'Academic Faculty',
    email: currentUser.email,
    assigned_class_ids: []
  };

  return (
    <div className="w-full">
      <TeacherDashboard
        teacher={currentTeacher}
        requests={requests}
        onApproveRequest={onApproveRequest}
        onRejectRequest={onRejectRequest}
      />
    </div>
  );
};
