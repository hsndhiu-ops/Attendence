import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Student, 
  Teacher, 
  ClassEntity, 
  Subject, 
  ClearanceRequest, 
  EmailLog, 
  CreateRequestInput 
} from './types';
import { 
  getStudents, 
  saveStudent, 
  getTeachers, 
  saveTeacher, 
  deleteTeacher, 
  getClasses, 
  saveClass, 
  deleteClass, 
  getSubjects, 
  saveSubject, 
  deleteSubject, 
  getRequests, 
  createRequest, 
  approveRequest, 
  rejectRequest, 
  verifyRequest, 
  recordReminderSent, 
  simulate24HoursElapsed, 
  getEmailLogs 
} from './services/db';
import { 
  sendNewRequestNotifications, 
  sendTeacherApprovalEmail, 
  sendRejectionEmail, 
  sendAdminVerificationEmail, 
  sendReminderEmail 
} from './services/email';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentPage } from './pages/StudentPage';
import { TeacherPage } from './pages/TeacherPage';
import { AdminPage } from './pages/AdminPage';
import { MainAdminPage } from './pages/MainAdminPage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { TeacherLoginPage } from './pages/TeacherLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { OwnerLoginPage } from './pages/OwnerLoginPage';
import { EmailLogsModal } from './components/EmailLogsModal';
import { ToastContainer, ToastMessage } from './components/Toast';

// Component that safely redirects the user from root based on current session
const RootRedirect: React.FC = () => {
  const { currentUser } = useAuth();
  if (currentUser?.role === 'student') return <Navigate to="/student" replace />;
  if (currentUser?.role === 'teacher') return <Navigate to="/teacher" replace />;
  if (currentUser?.role === 'admin') return <Navigate to="/admin" replace />;
  if (currentUser?.role === 'main_admin') return <Navigate to="/owner-access" replace />;
  return <Navigate to="/student" replace />;
};

function AppContent() {
  const { currentUser } = useAuth();

  // Core Data Entities
  const [students, setStudents] = useState<Student[]>(() => getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(() => getTeachers());
  const [classes, setClasses] = useState<ClassEntity[]>(() => getClasses());
  const [subjects, setSubjects] = useState<Subject[]>(() => getSubjects());
  const [requests, setRequests] = useState<ClearanceRequest[]>(() => getRequests());
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => getEmailLogs());

  // Modal controls
  const [isEmailLogsOpen, setIsEmailLogsOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      description
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Student Profile Updates
  const handleUpdateStudentProfile = (updatedStudent: Student) => {
    saveStudent(updatedStudent);
    setStudents(getStudents());
    addToast('success', 'Profile Updated', 'Student profile details were successfully synchronized.');
  };

  // Submit Leave Clearance Request (Student)
  const handleCreateRequest = async (input: CreateRequestInput): Promise<void> => {
    try {
      const newReq = createRequest(input);
      setRequests(getRequests());

      // Send notifications
      try {
        await sendNewRequestNotifications(newReq);
        setEmailLogs(getEmailLogs());
      } catch (e) {
        console.error('Failed to dispatch notification email:', e);
      }

      addToast(
        'success',
        'Leave Application Lodged',
        `Clearance application submitted. Status: Stage 1 (Pending Faculty Review).`
      );
    } catch (e: any) {
      addToast('error', 'Submission Failed', e?.message || 'Error creating request');
    }
  };

  // Teacher Review: Approve Request
  const handleTeacherApprove = async (reqId: string) => {
    try {
      const approvedReq = approveRequest(reqId);
      setRequests(getRequests());

      try {
        await sendTeacherApprovalEmail(approvedReq);
        setEmailLogs(getEmailLogs());
      } catch (e) {
        console.error('Approval notification error:', e);
      }

      addToast(
        'success',
        'Clearance Approved by Faculty',
        `${approvedReq.student.name}'s leave cleared by faculty. Forwarded to Office Admin for SHUHOOD attendance synchronization.`
      );
    } catch (e: any) {
      addToast('error', 'Approval Error', e?.message || 'Failed to approve request');
    }
  };

  // Rejection: Both Teacher and Admin rejection
  const handleReject = async (
    reqId: string, 
    reason: string, 
    templateType: string, 
    customNote?: string
  ) => {
    try {
      const rejectedReq = rejectRequest(reqId, reason, templateType);
      setRequests(getRequests());

      try {
        await sendRejectionEmail(rejectedReq, templateType, customNote);
        setEmailLogs(getEmailLogs());
      } catch (e) {
        console.error('Rejection notification error:', e);
      }

      addToast('error', 'Clearance Application Rejected', `Official rejection notice dispatched to ${rejectedReq.student.name}.`);
    } catch (e: any) {
      addToast('error', 'Rejection Error', e?.message || 'Failed to reject request');
    }
  };

  // Office Admin Final Verification (SHUHOOD synchronization)
  const handleAdminVerify = async (reqId: string, adminNotes?: string) => {
    try {
      const verifiedReq = verifyRequest(reqId, adminNotes);
      setRequests(getRequests());

      try {
        await sendAdminVerificationEmail(verifiedReq);
        setEmailLogs(getEmailLogs());
      } catch (e) {
        console.error('Final clearance verification email error:', e);
      }

      addToast(
        'success',
        'SHUHOOD Clearance Verified',
        `Attendance synchronized in SHUHOOD. Official clearance certificate dispatched to ${verifiedReq.student.name}.`
      );
    } catch (e: any) {
      addToast('error', 'Verification Error', e?.message || 'Failed to verify request');
    }
  };

  // Send Reminder (Student to Teacher, or Admin to Teacher)
  const handleSendReminder = async (req: ClearanceRequest, initiator: 'student' | 'admin') => {
    try {
      const updated = recordReminderSent(req.id);
      setRequests(getRequests());

      try {
        await sendReminderEmail(updated, initiator);
        setEmailLogs(getEmailLogs());
      } catch (e) {
        console.error('Reminder dispatch error:', e);
      }

      addToast(
        'info',
        'Faculty Reminder Dispatched',
        `Gentle clearance reminder sent to ${req.assigned_teacher_name}.`
      );
    } catch (e: any) {
      addToast('error', 'Reminder Error', e?.message || 'Failed to send reminder');
    }
  };

  // Time-travel simulator: fast-forward 24 hours to test 24-hr reminder threshold
  const handleSimulate24Hours = (reqId: string) => {
    simulate24HoursElapsed(reqId);
    setRequests(getRequests());
    addToast('info', 'Simulated 24 Hours', 'Timestamp shifted backward by 25h. Reminder cooldown unlocked.');
  };

  // Admin Management CRUD: Teacher, Class, Subject
  const handleAddTeacher = (newTeacher: Omit<Teacher, 'id'>) => {
    const t: Teacher = { ...newTeacher, id: `t-${Date.now()}` };
    saveTeacher(t);
    setTeachers(getTeachers());
    addToast('success', 'Faculty Added', `${t.name} added to institutional directory.`);
  };

  const handleDeleteTeacher = (id: string) => {
    deleteTeacher(id);
    setTeachers(getTeachers());
    addToast('info', 'Faculty Removed', 'Faculty record was deleted.');
  };

  const handleAddClass = (newClass: Omit<ClassEntity, 'id'>) => {
    const c: ClassEntity = { ...newClass, id: `c-${Date.now()}` };
    saveClass(c);
    setClasses(getClasses());
    addToast('success', 'Class Added', `Class ${c.name} registered.`);
  };

  const handleDeleteClass = (id: string) => {
    deleteClass(id);
    setClasses(getClasses());
    addToast('info', 'Class Removed', 'Class record was removed.');
  };

  const handleAddSubject = (newSubj: Omit<Subject, 'id'>) => {
    const s: Subject = { ...newSubj, id: `s-${Date.now()}` };
    saveSubject(s);
    setSubjects(getSubjects());
    addToast('success', 'Subject Added', `${s.name} (${s.code}) registered.`);
  };

  const handleDeleteSubject = (id: string) => {
    deleteSubject(id);
    setSubjects(getSubjects());
    addToast('info', 'Subject Deleted', 'Subject record was removed.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenEmailLogs={() => setIsEmailLogsOpen(true)}
        emailCount={emailLogs.length}
      />

      {/* Main Body Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Routes>
          {/* Root Redirects to /student or active user portal */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Navigate to="/student" replace />} />

          {/* Independent Student Portal Route (/student) */}
          <Route
            path="/student"
            element={
              currentUser?.role === 'student' ? (
                <StudentPage
                  requests={requests}
                  teachers={teachers}
                  onSubmitRequest={handleCreateRequest}
                  onUpdateProfile={handleUpdateStudentProfile}
                  onSendReminder={(req) => handleSendReminder(req, 'student')}
                  onSimulate24Hours={handleSimulate24Hours}
                />
              ) : (
                <StudentLoginPage />
              )
            }
          />

          {/* Independent Teacher Route (/teacher) */}
          <Route
            path="/teacher"
            element={
              currentUser?.role === 'teacher' ? (
                <TeacherPage
                  requests={requests}
                  teachers={teachers}
                  onApproveRequest={handleTeacherApprove}
                  onRejectRequest={handleReject}
                />
              ) : (
                <TeacherLoginPage />
              )
            }
          />

          {/* Independent Office Admin Route (/admin) */}
          <Route
            path="/admin"
            element={
              currentUser?.role === 'admin' ? (
                <AdminPage
                  requests={requests}
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  onVerifyRequest={handleAdminVerify}
                  onRejectRequest={handleReject}
                  onApproveRequest={handleTeacherApprove}
                  onSendTeacherReminder={(req) => handleSendReminder(req, 'admin')}
                  onAddTeacher={handleAddTeacher}
                  onDeleteTeacher={handleDeleteTeacher}
                  onAddClass={handleAddClass}
                  onDeleteClass={handleDeleteClass}
                  onAddSubject={handleAddSubject}
                  onDeleteSubject={handleDeleteSubject}
                  onOpenEmailLogs={() => setIsEmailLogsOpen(true)}
                />
              ) : (
                <AdminLoginPage />
              )
            }
          />

          {/* Hidden Main Admin Route (/owner-access) */}
          <Route
            path="/owner-access"
            element={
              currentUser?.role === 'main_admin' ? (
                <MainAdminPage
                  requests={requests}
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  onVerifyRequest={handleAdminVerify}
                  onRejectRequest={handleReject}
                  onApproveRequest={handleTeacherApprove}
                  onSendTeacherReminder={(req) => handleSendReminder(req, 'admin')}
                  onAddTeacher={handleAddTeacher}
                  onDeleteTeacher={handleDeleteTeacher}
                  onAddClass={handleAddClass}
                  onDeleteClass={handleDeleteClass}
                  onAddSubject={handleAddSubject}
                  onDeleteSubject={handleDeleteSubject}
                  onOpenEmailLogs={() => setIsEmailLogsOpen(true)}
                />
              ) : (
                <OwnerLoginPage />
              )
            }
          />

          {/* Aliases for Main Admin */}
          <Route
            path="/main-admin"
            element={
              currentUser?.role === 'main_admin' ? (
                <MainAdminPage
                  requests={requests}
                  teachers={teachers}
                  classes={classes}
                  subjects={subjects}
                  onVerifyRequest={handleAdminVerify}
                  onRejectRequest={handleReject}
                  onApproveRequest={handleTeacherApprove}
                  onSendTeacherReminder={(req) => handleSendReminder(req, 'admin')}
                  onAddTeacher={handleAddTeacher}
                  onDeleteTeacher={handleDeleteTeacher}
                  onAddClass={handleAddClass}
                  onDeleteClass={handleDeleteClass}
                  onAddSubject={handleAddSubject}
                  onDeleteSubject={handleDeleteSubject}
                  onOpenEmailLogs={() => setIsEmailLogsOpen(true)}
                />
              ) : (
                <Navigate to="/owner-access" replace />
              )
            }
          />
          <Route path="/owner-login" element={<Navigate to="/owner-access" replace />} />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Attendance Clearance System</span>
            <span>•</span>
            <span>Automated Institutional Leave & Sanction Engine</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-slate-400 flex-wrap">
            <span>Automated Notification System Active</span>
            <span>•</span>
            <a 
              href="https://shuhood.vercel.app" 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-600 hover:text-indigo-800"
            >
              External SHUHOOD Register ↗
            </a>
          </div>
        </div>
      </footer>

      {/* Notification Audit Logs Modal */}
      <EmailLogsModal
        isOpen={isEmailLogsOpen}
        onClose={() => setIsEmailLogsOpen(false)}
        logs={emailLogs}
      />

      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
