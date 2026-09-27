import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Student, ClearanceRequest, Teacher, CreateRequestInput } from '../types';
import { StudentDashboard } from '../components/StudentDashboard';
import { NewRequestModal } from '../components/NewRequestModal';
import { StudentProfileModal } from '../components/StudentProfileModal';
import { MandatoryGmailModal } from '../components/MandatoryGmailModal';

interface StudentPageProps {
  requests: ClearanceRequest[];
  teachers: Teacher[];
  onSubmitRequest: (input: CreateRequestInput) => Promise<void>;
  onSendReminder: (req: ClearanceRequest) => void;
  onUpdateProfile: (updated: Student) => void;
  onSimulate24Hours?: (reqId: string) => void;
}

export const StudentPage: React.FC<StudentPageProps> = ({
  requests,
  teachers,
  onSubmitRequest,
  onSendReminder,
  onUpdateProfile,
  onSimulate24Hours
}) => {
  const { currentUser, updateCurrentUserProfile, logout } = useAuth();
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  // Convert AuthUser to Student object
  const studentEntity: Student = {
    id: currentUser.id,
    roll_no: currentUser.admission_no || '22CS041',
    name: currentUser.name,
    class_id: `c-${currentUser.class_name?.toLowerCase().replace('-', '') || 'fc2'}`,
    class_name: currentUser.class_name || 'FC-2',
    department: currentUser.department || 'Computer Science & Engineering',
    gmail: currentUser.email,
    created_at: new Date().toISOString()
  };

  const handleSaveProfile = (updated: Student) => {
    updateCurrentUserProfile({
      name: updated.name,
      email: updated.gmail,
      class_name: updated.class_name,
      department: updated.department
    });
    onUpdateProfile(updated);
    setIsProfileOpen(false);
  };

  const handleMandatoryGmailSave = (registeredGmail: string) => {
    const updatedStudent: Student = {
      ...studentEntity,
      gmail: registeredGmail
    };
    updateCurrentUserProfile({
      email: registeredGmail
    });
    onUpdateProfile(updatedStudent);
  };

  const isGmailMissing = !studentEntity.gmail || studentEntity.gmail.trim() === '';

  const handleSubmitNewRequest = async (input: CreateRequestInput) => {
    setIsSubmitting(true);
    try {
      await onSubmitRequest(input);
      setIsNewRequestOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <StudentDashboard
        student={studentEntity}
        requests={requests}
        onOpenNewRequest={() => {
          if (isGmailMissing) return;
          setIsNewRequestOpen(true);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSendReminder={onSendReminder}
        onSimulate24Hours={onSimulate24Hours}
      />

      {/* Mandatory, Non-Dismissible Gmail Registration for First-Time Logins */}
      {isGmailMissing && (
        <MandatoryGmailModal
          isOpen={isGmailMissing}
          student={studentEntity}
          onRegisterGmail={handleMandatoryGmailSave}
        />
      )}

      {/* New Request Modal */}
      {isNewRequestOpen && (
        <NewRequestModal
          isOpen={isNewRequestOpen}
          onClose={() => setIsNewRequestOpen(false)}
          student={studentEntity}
          teachers={teachers}
          onSubmit={handleSubmitNewRequest}
          isLoading={isSubmitting}
        />
      )}

      {/* Profile Edit Modal */}
      {isProfileOpen && (
        <StudentProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          student={studentEntity}
          onSaveProfile={handleSaveProfile}
          onLogout={logout}
        />
      )}
    </div>
  );
};
