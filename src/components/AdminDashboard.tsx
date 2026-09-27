import React, { useState } from 'react';
import { 
  ClearanceRequest, 
  Teacher, 
  ClassEntity, 
  Subject, 
  RequestStatus,
  EmailLog
} from '../types';
import { StatusBadge } from './StatusBadge';
import { ConfirmationModal } from './ConfirmationModal';
import { TeacherRejectModal } from './TeacherRejectModal';
import { RequestDetailModal } from './RequestDetailModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ExportDataModal } from './ExportDataModal';
import { getStudents } from '../services/db';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BellRing, 
  Users, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Database,
  ArrowUpRight,
  Eye,
  KeyRound,
  Download,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  requests: ClearanceRequest[];
  teachers: Teacher[];
  classes: ClassEntity[];
  subjects: Subject[];
  onVerifyRequest: (reqId: string, adminNotes?: string) => Promise<void>;
  onRejectRequest: (reqId: string, reason: string, templateType: string, customNote?: string) => Promise<void>;
  onSendTeacherReminder: (req: ClearanceRequest) => Promise<void>;
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onDeleteTeacher: (id: string) => void;
  onAddClass: (cls: Omit<ClassEntity, 'id'>) => void;
  onDeleteClass: (id: string) => void;
  onAddSubject: (subj: Omit<Subject, 'id'>) => void;
  onDeleteSubject: (id: string) => void;
  onOpenEmailLogs: () => void;
  onApproveRequest?: (reqId: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  requests,
  teachers,
  classes,
  subjects,
  onVerifyRequest,
  onRejectRequest,
  onSendTeacherReminder,
  onAddTeacher,
  onDeleteTeacher,
  onAddClass,
  onDeleteClass,
  onAddSubject,
  onDeleteSubject,
  onOpenEmailLogs,
  onApproveRequest
}) => {
  const [activeTab, setActiveTab] = useState<
    'master' | 'overdue' | 'approved_shuhood' | 'teacher_reminders' | 'management' | 'database_schema'
  >('master');

  // Filters for Master view (filterYear completely removed, filterClass retained)
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterApplicationDate, setFilterApplicationDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected for action & detail view
  const [detailRequest, setDetailRequest] = useState<ClearanceRequest | null>(null);
  const [verifyingRequest, setVerifyingRequest] = useState<ClearanceRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<ClearanceRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ title: string; desc: string } | null>(null);

  // Management modals / states
  const [mgmtSubTab, setMgmtSubTab] = useState<'teachers' | 'classes' | 'subjects'>('teachers');
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherDept, setNewTeacherDept] = useState('Computer Science');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');

  const [newClassName, setNewClassName] = useState('');
  const [newClassDeptComb, setNewClassDeptComb] = useState('Computer Science');
  const [newClassTeacherId, setNewClassTeacherId] = useState('');

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  // Multi-select checklist of classes to assign the subject to
  const [selectedClassIdsForSubject, setSelectedClassIdsForSubject] = useState<string[]>(() => classes.map(c => c.id));
  const [filterSubjectByClass, setFilterSubjectByClass] = useState<string>('all');
  const [subjectSuccessMessage, setSubjectSuccessMessage] = useState('');

  // Counts
  const totalCount = requests.length;
  const overduePendingRequests = requests.filter(r => r.status === 'pending' && r.is_overdue);
  const approvedAwaitingVerification = requests.filter(r => r.status === 'approved');
  const verifiedCount = requests.filter(r => r.status === 'verified').length;
  const normalPending = requests.filter(r => r.status === 'pending' && !r.is_overdue);

  // Filtered requests for Master view
  const filteredMasterRequests = requests.filter(r => {
    if (filterClass !== 'all' && r.student.class_id !== filterClass) return false;
    if (filterTeacher !== 'all' && r.teacher_id !== filterTeacher) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterApplicationDate && r.submission_date !== filterApplicationDate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        r.student.name.toLowerCase().includes(q) ||
        r.student.roll_no.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.assigned_teacher_name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleVerifyConfirm = async () => {
    if (!verifyingRequest) return;
    setIsProcessing(true);
    try {
      await onVerifyRequest(verifyingRequest.id, adminNotes);
      setVerifyingRequest(null);
      setAdminNotes('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async (reason: string, templateType: string, customNote?: string) => {
    if (!rejectingRequest) return;
    setIsProcessing(true);
    try {
      await onRejectRequest(rejectingRequest.id, reason, templateType, customNote);
      setRejectingRequest(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName || !newTeacherUsername || !newTeacherEmail) return;
    onAddTeacher({
      name: newTeacherName,
      username: newTeacherUsername,
      department: newTeacherDept,
      email: newTeacherEmail,
      assigned_class_ids: []
    });
    setNewTeacherName('');
    setNewTeacherUsername('');
    setNewTeacherEmail('');
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !newClassTeacherId) return;
    onAddClass({
      name: newClassName,
      department_combination: newClassDeptComb,
      default_teacher_id: newClassTeacherId
    });
    setNewClassName('');
  };

  const handleToggleClassForSubject = (classId: string) => {
    setSelectedClassIdsForSubject(prev => 
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const handleSelectAllClassesForSubject = () => {
    setSelectedClassIdsForSubject(classes.map(c => c.id));
  };

  const handleDeselectAllClassesForSubject = () => {
    setSelectedClassIdsForSubject([]);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    if (selectedClassIdsForSubject.length === 0) {
      alert('Please select at least one class from the checklist to assign this subject to.');
      return;
    }
    onAddSubject({
      name: newSubjectName.trim(),
      code: newSubjectCode.trim() || undefined,
      class_ids: selectedClassIdsForSubject
    });
    const assignedNames = classes.filter(c => selectedClassIdsForSubject.includes(c.id)).map(c => c.name);
    setSubjectSuccessMessage(
      `Subject "${newSubjectName.trim()}" successfully assigned to ${assignedNames.length} classes: ${assignedNames.join(', ')}.`
    );
    setTimeout(() => setSubjectSuccessMessage(''), 4500);
    setNewSubjectName('');
    setNewSubjectCode('');
  };

  const handleCopySql = () => {
    const sqlText = `-- Attendance Clearance System Relational Database Schema
-- 8 Fixed Classes: QLA-3, HFC-3, QH-2, FC-2, AL-2, QH-1, FC-1, AL-1
CREATE TABLE classes (id UUID PRIMARY KEY, name VARCHAR UNIQUE, department_combination VARCHAR, default_teacher_id UUID);
CREATE TABLE teachers (id UUID PRIMARY KEY, name VARCHAR, username VARCHAR, email VARCHAR, assigned_class_ids UUID[]);
CREATE TABLE subjects (id UUID PRIMARY KEY, name VARCHAR, code VARCHAR);
CREATE TABLE class_subjects (class_id UUID REFERENCES classes(id), subject_id UUID REFERENCES subjects(id), PRIMARY KEY (class_id, subject_id));
CREATE TABLE students (id UUID PRIMARY KEY, roll_no VARCHAR UNIQUE, name VARCHAR, class_id UUID REFERENCES classes(id), department VARCHAR, gmail VARCHAR);
CREATE TABLE requests (id UUID PRIMARY KEY, student_id UUID REFERENCES students(id), teacher_id UUID REFERENCES teachers(id), leave_start_date DATE, leave_end_date DATE, deadline_date DATE, is_overdue BOOLEAN, status VARCHAR);`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Office Admin Institutional Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[11px] font-semibold tracking-wide uppercase">
                Office of Academic Affairs • Super Authority
              </span>
              <span className="text-xs text-slate-400">Institutional Governance Console</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Master Attendance Clearance Control</h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Cross-departmental oversight, overdue case tribunal, SHUHOOD attendance synchronization, and faculty inaction reminders.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Export Requests and Student Directory to CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-900" />
              <span>Export Data</span>
            </button>

            <a
              href="https://shuhood.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Launch SHUHOOD</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
              title="Change Account Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Password</span>
            </button>

            <button
              onClick={onOpenEmailLogs}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Email Audit Logs
            </button>
          </div>
        </div>

        {/* Global Statistics Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Total Requests</span>
            <span className="text-2xl font-bold text-white font-mono tabular-nums">{totalCount}</span>
          </div>

          <div className="bg-red-950/60 p-2.5 rounded-lg border border-red-800/60">
            <span className="text-xs text-red-300 font-semibold block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Overdue Pending
            </span>
            <span className="text-2xl font-bold text-red-400 font-mono tabular-nums">{overduePendingRequests.length}</span>
            <span className="text-[10px] text-red-300/80 block">&gt;14 days after leave</span>
          </div>

          <div className="bg-amber-950/60 p-2.5 rounded-lg border border-amber-800/60">
            <span className="text-xs text-amber-300 font-semibold block">Normal Pending</span>
            <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">{normalPending.length}</span>
            <span className="text-[10px] text-amber-300/80 block">Faculty review</span>
          </div>

          <div className="bg-blue-950/60 p-2.5 rounded-lg border border-blue-800/60">
            <span className="text-xs text-blue-300 font-semibold block">Awaiting SHUHOOD</span>
            <span className="text-2xl font-bold text-blue-400 font-mono tabular-nums">{approvedAwaitingVerification.length}</span>
            <span className="text-[10px] text-blue-300/80 block">Approved by faculty</span>
          </div>

          <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/60">
            <span className="text-xs text-emerald-300 font-semibold block">Formally Cleared</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{verifiedCount}</span>
            <span className="text-[10px] text-emerald-300/80 block">Final verified</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 p-2 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'master', label: 'Master Clearance View', badge: requests.length },
            { id: 'overdue', label: 'Overdue Queue', badge: overduePendingRequests.length, alert: overduePendingRequests.length > 0 },
            { id: 'approved_shuhood', label: 'Approved Requests (SHUHOOD Clearance)', badge: approvedAwaitingVerification.length, highlight: true },
            { id: 'teacher_reminders', label: 'Teacher Inaction Reminders' },
            { id: 'management', label: 'Institutional Management' },
            { id: 'database_schema', label: 'Database Schema' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                  tab.alert 
                    ? 'bg-red-600 text-white' 
                    : tab.highlight && tab.badge > 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Export Notification Toast Banner */}
        {exportNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">{exportNotice.title}: </span>
                <span>{exportNotice.desc}</span>
              </div>
            </div>
            <button
              onClick={() => setExportNotice(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB 1: MASTER CLEARANCE VIEW (With Multi-Filters) */}
        {activeTab === 'master' && (
          <div className="p-5 space-y-4">
            {/* Filter controls row */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  Institutional Multi-Filters
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-emerald-600" />
                    <span>Export View</span>
                  </button>
                  <span className="text-slate-300" aria-hidden="true">|</span>
                  <button
                    onClick={() => {
                      setFilterClass('all');
                      setFilterTeacher('all');
                      setFilterStatus('all');
                      setFilterApplicationDate('');
                      setSearchQuery('');
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {/* Class (Filter by Class only) */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Class</label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-md focus:outline-hidden"
                  >
                    <option value="all">All Classes</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Reviewing Teacher */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Assigned Faculty</label>
                  <select
                    value={filterTeacher}
                    onChange={(e) => setFilterTeacher(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-md focus:outline-hidden"
                  >
                    <option value="all">All Faculty</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Clearance Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-md focus:outline-hidden"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved (Teacher)</option>
                    <option value="verified">Verified (Cleared)</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Application Date (filters by submission_date) */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Application Date</label>
                  <input
                    type="date"
                    value={filterApplicationDate}
                    onChange={(e) => setFilterApplicationDate(e.target.value)}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-md focus:outline-hidden text-xs"
                    title="Filters requests by date applied"
                  />
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Quick search by student name, roll number, faculty, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Master Table */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-left">Student</th>
                    <th className="py-3 px-4 text-left">Class</th>
                    <th className="py-3 px-4 text-left">Reason</th>
                    <th className="py-3 px-4 text-left">Assigned Teacher</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMasterRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 px-4 text-center text-slate-400 text-xs">
                        No clearance requests match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredMasterRequests.map(req => (
                      <tr 
                        key={req.id} 
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Column 1: STUDENT (Student full name only, font-medium, text-slate-800) */}
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                          {req.student.name}
                        </td>

                        {/* Column 2: CLASS (Compact badge/pill, e.g., "FC-2", left-aligned) */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                            {req.student.class_name}
                          </span>
                        </td>

                        {/* Column 3: REASON (The leave reason category, e.g., "Medical", "Official Work", "Family Emergency" - clean text) */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {req.reason}
                        </td>

                        {/* Column 4: ASSIGNED TEACHER (Teacher name only, text-slate-600) */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {req.assigned_teacher_name}
                        </td>

                        {/* Column 5: STATUS (Single pill status badge: Overdue Pending, Pending, Awaiting SHUHOOD, Cleared) */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={req.status} isOverdue={req.is_overdue} variant="streamlined" />
                        </td>

                        {/* Column 6: ACTION (A clean, single "Review" button that opens RequestDetailModal) */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setDetailRequest(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs hover:border-slate-400 transition-colors cursor-pointer"
                            title="Review clearance request details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DEDICATED OVERDUE CLEARANCE QUEUE */}
        {activeTab === 'overdue' && (
          <div className="p-5 space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
                <h3 className="text-sm font-bold text-red-900">
                  Statutory 14-Day Overdue Clearance Tribunal
                </h3>
              </div>
              <p className="mt-1 text-xs text-red-800 leading-relaxed">
                Requests in this queue were submitted <strong>more than 14 days after the concluding date of leave</strong>.
                Per College Attendance Regulation 4.2, overdue requests require explicit faculty justification or administrative clearance before records are updated.
                Office administrators can reject overdue requests using the specialized pre-built Overdue Rejection template.
              </p>
            </div>

            <div className="divide-y divide-red-100 border border-red-200 rounded-xl overflow-hidden bg-white">
              {overduePendingRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 text-sm">No overdue requests pending</p>
                  <p className="text-slate-400 mt-0.5">All student clearance submissions are compliant within the 14-day window.</p>
                </div>
              ) : (
                overduePendingRequests.map(req => (
                  <div key={req.id} className="p-4 hover:bg-red-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[11px] font-bold">
                          OVERDUE SUBMISSION
                        </span>
                        <span className="font-bold text-sm text-slate-900">{req.student.name}</span>
                        <span className="font-mono text-xs text-slate-600">({req.student.roll_no})</span>
                        <span className="text-xs text-slate-500">{req.student.class_name} · {req.student.department}</span>
                      </div>

                      <div className="text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-red-50/60 rounded-lg border border-red-100 font-mono">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Leave Concluded:</span>
                          <span className="font-bold text-slate-900">{req.leave_end_date}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">14-Day Cutoff:</span>
                          <span className="font-bold text-red-700">{req.deadline_date} (Expired)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Actual Lodged Date:</span>
                          <span className="font-bold text-slate-900">{req.submission_date}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600">
                        <span>Reason: <strong>{req.reason}</strong></span>
                        {req.remarks && <span className="italic ml-2 text-slate-500">"{req.remarks}"</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setDetailRequest(req)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => setRejectingRequest(req)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject via Overdue Template</span>
                      </button>

                      <button
                        onClick={() => setVerifyingRequest(req)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
                      >
                        Special Sanction / Clear
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: APPROVED REQUESTS (SHUHOOD VERIFICATION) */}
        {activeTab === 'approved_shuhood' && (
          <div className="p-5 space-y-4">
            {/* Instructional Banner for SHUHOOD Integration */}
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-700" />
                    College Attendance Synchronization Workflow (SHUHOOD)
                  </h3>
                  <p className="text-xs text-blue-900 leading-relaxed max-w-3xl">
                    <strong>Step 1:</strong> Click the button to open the college attendance system <strong>SHUHOOD</strong> (<code>shuhood.vercel.app</code>) in a separate tab, locate the student record, and update their attendance register.<br />
                    <strong>Step 2:</strong> Return here and click <strong>"Mark as Verified/Cleared"</strong>. This generates the final clearance record and dispatches the official clearance certificate email to the student's personal Gmail.
                  </p>
                </div>
                <a
                  href="https://shuhood.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Open SHUHOOD System</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Approved Queue */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              {approvedAwaitingVerification.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 text-sm">All approved requests are cleared</p>
                  <p className="text-slate-400 mt-0.5">No teacher-approved requests currently pending SHUHOOD verification.</p>
                </div>
              ) : (
                approvedAwaitingVerification.map(req => (
                  <div key={req.id} className="p-4 hover:bg-blue-50/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={req.status} isOverdue={req.is_overdue} />
                        <span className="font-bold text-sm text-slate-900">{req.student.name}</span>
                        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {req.student.roll_no}
                        </span>
                        <span className="text-xs text-slate-500">{req.student.class_name} · {req.student.department}</span>
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-x-4 gap-y-1 flex-wrap">
                        <span>Leave: <strong>{req.leave_start_date} → {req.leave_end_date}</strong></span>
                        <span>Approved by: <strong>{req.assigned_teacher_name}</strong></span>
                        <span>Student Gmail: <strong className="font-mono text-slate-700">{req.student.gmail}</strong></span>
                      </div>

                      <div className="text-xs text-slate-500">
                        <span className="text-slate-400">Missed: </span>
                        <span className="font-medium text-slate-700">{req.subjects_missed.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setDetailRequest(req)}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => setVerifyingRequest(req)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Verified / Cleared</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TEACHER INACTION REMINDERS */}
        {activeTab === 'teacher_reminders' && (
          <div className="p-5 space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-700 shrink-0" />
                <h3 className="text-sm font-bold text-amber-900">
                  Faculty Action Reminders (Administrative Nudge)
                </h3>
              </div>
              <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                As Office Administrator, you can dispatch high-priority reminder notifications directly to faculty members whose assigned clearance requests remain pending.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              {requests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 text-sm">No pending requests across any faculty</p>
                </div>
              ) : (
                requests.filter(r => r.status === 'pending').map(req => (
                  <div key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={req.status} isOverdue={req.is_overdue} size="sm" />
                        <span className="font-semibold text-slate-900 text-xs">
                          {req.student.name} ({req.student.roll_no})
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-600">Assigned: <strong>{req.assigned_teacher_name}</strong></span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Leave: {req.leave_start_date} to {req.leave_end_date} · Submitted on {req.submission_date}
                      </p>
                      {req.last_reminder_sent_at && (
                        <p className="text-[11px] text-amber-700">
                          Last reminder sent: {new Date(req.last_reminder_sent_at).toLocaleString()} (Count: {req.reminder_count})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setDetailRequest(req)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Details</span>
                      </button>

                      <button
                        onClick={() => onSendTeacherReminder(req)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-600" />
                        <span>Send Faculty Reminder</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: INSTITUTIONAL MANAGEMENT */}
        {activeTab === 'management' && (
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setMgmtSubTab('teachers')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  mgmtSubTab === 'teachers' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Teachers & Faculty ({teachers.length})
              </button>
              <button
                onClick={() => setMgmtSubTab('classes')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  mgmtSubTab === 'classes' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Classes & Default Mappings ({classes.length})
              </button>
              <button
                onClick={() => setMgmtSubTab('subjects')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  mgmtSubTab === 'subjects' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Year-Wise Subject Lists ({subjects.length})
              </button>
            </div>

            {/* Sub-tab 1: Teachers */}
            {mgmtSubTab === 'teachers' && (
              <div className="space-y-4">
                <form onSubmit={handleCreateTeacher} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Add New Faculty Member</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                    <input
                      type="text"
                      placeholder="Full Name (e.g. Dr. Jane Doe)"
                      value={newTeacherName}
                      onChange={(e) => setNewTeacherName(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Username (e.g. jdoe)"
                      value={newTeacherUsername}
                      onChange={(e) => setNewTeacherUsername(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg bg-white font-mono"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Department"
                      value={newTeacherDept}
                      onChange={(e) => setNewTeacherDept(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg bg-white"
                      required
                    />
                    <input
                      type="email"
                      placeholder="College Email"
                      value={newTeacherEmail}
                      onChange={(e) => setNewTeacherEmail(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Faculty</span>
                  </button>
                </form>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {teachers.map(t => (
                    <div key={t.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <span className="font-semibold text-slate-900 block">{t.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">@{t.username} · {t.department} · {t.email}</span>
                      </div>
                      <button
                        onClick={() => onDeleteTeacher(t.id)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        title="Delete teacher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 2: Classes */}
            {mgmtSubTab === 'classes' && (
              <div className="space-y-4">
                <form onSubmit={handleCreateClass} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Register New Class & Default Teacher Mapping</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <input
                      type="text"
                      placeholder="Class Name (e.g. QLA-3, HFC-3)"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Department Combination (e.g. Computer Science & Physics)"
                      value={newClassDeptComb}
                      onChange={(e) => setNewClassDeptComb(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg bg-white"
                      required
                    />
                    <select
                      value={newClassTeacherId}
                      onChange={(e) => setNewClassTeacherId(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg bg-white"
                      required
                    >
                      <option value="">Select Default Class Teacher...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Class Mapping</span>
                  </button>
                </form>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {classes.map(c => (
                    <div key={c.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                          <span className="text-slate-500 font-medium">({c.department_combination})</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">
                          Default Assigned Faculty: <strong className="text-slate-700">{c.default_teacher_name || 'Not configured'}</strong>
                        </span>
                      </div>
                      <button
                        onClick={() => onDeleteClass(c.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Delete class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 3: Subjects */}
            {mgmtSubTab === 'subjects' && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <strong>Class-Based Curriculum Architecture:</strong> Subjects are mapped directly to individual classes via many-to-many relationship. Select any combination of classes below to assign courses flexibly across the institution.
                </div>

                <form onSubmit={handleCreateSubject} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Add Subject & Assign to Classes</h4>
                    <span className="text-[11px] text-slate-500">Pick any combination of the 8 fixed classes</span>
                  </div>

                  {subjectSuccessMessage && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{subjectSuccessMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <input
                      id="new-subject-name-input"
                      type="text"
                      placeholder="Subject Name (e.g. Advanced Operating Systems)"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Course Code (optional, e.g. CS-301)"
                      value={newSubjectCode}
                      onChange={(e) => setNewSubjectCode(e.target.value)}
                      className="p-2 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>

                  {/* Multi-select checklist of all 8 classes */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-semibold text-slate-700">
                        Select Target Classes ({selectedClassIdsForSubject.length} of {classes.length} selected):
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllClassesForSubject}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Select All (8)
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={handleDeselectAllClassesForSubject}
                          className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {classes.map(c => {
                        const isChecked = selectedClassIdsForSubject.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer select-none text-xs transition-colors ${
                              isChecked 
                                ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 font-semibold' 
                                : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleClassForSubject(c.id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 mt-0.5"
                            />
                            <div className="min-w-0">
                              <span className="block leading-tight">{c.name}</span>
                              <span className="text-[10px] text-slate-400 block truncate font-normal">{c.department_combination}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign to selected classes ({selectedClassIdsForSubject.length})</span>
                    </button>
                  </div>
                </form>

                {/* Subject Catalogue with Filter */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Active Curriculum Catalogue ({subjects.length} Subjects)
                      </h5>
                    </div>

                    {/* Filter subjects by class */}
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-500 font-medium">Filter by Class:</label>
                      <select
                        value={filterSubjectByClass}
                        onChange={(e) => setFilterSubjectByClass(e.target.value)}
                        className="p-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-hidden"
                      >
                        <option value="all">All Classes ({classes.length})</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* List of subjects */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                    {(() => {
                      const displayedSubjects = filterSubjectByClass === 'all'
                        ? subjects
                        : subjects.filter(s => s.class_ids?.includes(filterSubjectByClass));

                      if (displayedSubjects.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-400 text-xs italic">
                            No subjects assigned to the selected class filter.
                          </div>
                        );
                      }

                      return displayedSubjects.map(s => {
                        const assignedClasses = classes.filter(c => s.class_ids?.includes(c.id));
                        return (
                          <div key={s.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                                {s.code && (
                                  <span className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                                    {s.code}
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-400 font-medium">
                                  ({assignedClasses.length} of {classes.length} classes)
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                {assignedClasses.length === 0 ? (
                                  <span className="text-[11px] text-amber-600 italic">No classes assigned</span>
                                ) : (
                                  assignedClasses.map(c => (
                                    <span 
                                      key={c.id}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    >
                                      {c.name}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => onDeleteSubject(s.id)}
                              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0 self-start sm:self-center"
                              title="Delete subject"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: DATABASE SCHEMA */}
        {activeTab === 'database_schema' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  Institutional Relational Database Schema
                </h3>
                <p className="text-xs text-slate-500">
                  Standard PostgreSQL / Supabase schema with 8 fixed classes, many-to-many class subjects join table, and 14-day clearance deadline calculation triggers.
                </p>
              </div>
              <button
                onClick={handleCopySql}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 shadow-2xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied to Clipboard' : 'Copy SQL Schema'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed">
              <pre className="text-slate-300">{`-- Attendance Clearance System — Institutional Relational Database Schema
-- Fixed Classes: QLA-3, HFC-3, QH-2, FC-2, AL-2, QH-1, FC-1, AL-1

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  department_combination VARCHAR(100) NOT NULL,
  default_teacher_id UUID REFERENCES teachers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  assigned_class_ids UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE class_subjects (
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, subject_id)
);

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roll_no VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id),
  department VARCHAR(100) NOT NULL,
  gmail VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  class_teacher_id_if_different UUID REFERENCES teachers(id),
  reason VARCHAR(50) NOT NULL,
  leave_start_date DATE NOT NULL,
  leave_end_date DATE NOT NULL,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  deadline_date DATE NOT NULL,
  subjects_missed TEXT[] NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  is_overdue BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ
);

-- Automatic 14-day Overdue Trigger:
-- compute_clearance_request_fields() sets is_overdue = (submission_date > leave_end_date + 14 days)`}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Rich Request Detail Modal */}
      <RequestDetailModal
        isOpen={Boolean(detailRequest)}
        onClose={() => setDetailRequest(null)}
        request={detailRequest}
        classes={classes}
        onApprove={async (reqId) => {
          if (onApproveRequest) {
            await onApproveRequest(reqId);
          } else {
            await onVerifyRequest(reqId, 'Administrative Direct Verification & Clearance');
          }
          setDetailRequest(null);
        }}
        onReject={(req) => {
          setDetailRequest(null);
          setRejectingRequest(req);
        }}
        onVerify={async (req) => {
          await onVerifyRequest(req.id, 'SHUHOOD Institutional Attendance Register Cleared');
          setDetailRequest(null);
        }}
        onSendReminder={(req) => {
          onSendTeacherReminder(req);
        }}
      />

      {/* Confirmation Modal for Admin Verification (SHUHOOD Clearance) */}
      <ConfirmationModal
        isOpen={Boolean(verifyingRequest)}
        onClose={() => setVerifyingRequest(null)}
        onConfirm={handleVerifyConfirm}
        title="Mark Attendance as Verified & Cleared"
        description={`Confirm final attendance clearance for ${verifyingRequest?.student.name} (${verifyingRequest?.student.roll_no}) for the period ${verifyingRequest?.leave_start_date} to ${verifyingRequest?.leave_end_date}.`}
        confirmText="Confirm Clearance & Send Email"
        variant="success"
        isLoading={isProcessing}
      >
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
            <strong>Clearance Confirmation:</strong>
            <p className="mt-0.5 text-emerald-800">
              Ensure you have credited the student's periods in the official <strong>SHUHOOD</strong> attendance register.
              Confirming will mark this clearance as Stage 3: <strong>Verified/Cleared</strong> and automatically dispatch the final clearance certificate to <strong>{verifyingRequest?.student.gmail}</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Administrative Register Note (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Cleared in SHUHOOD Register Batch 2026-A, folio 42"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>
      </ConfirmationModal>

      {/* Rejection Modal for Overdue Tribunal */}
      {rejectingRequest && (
        <TeacherRejectModal
          isOpen={Boolean(rejectingRequest)}
          onClose={() => setRejectingRequest(null)}
          request={rejectingRequest}
          onConfirmReject={handleRejectConfirm}
          isLoading={isProcessing}
        />
      )}

      {/* Office Admin Change Password Modal */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          userEmail="registrar@college.edu"
          userName="Office Registrar"
        />
      )}

      {/* Export Data Modal */}
      {isExportModalOpen && (
        <ExportDataModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          requests={requests}
          students={getStudents()}
          classes={classes}
          teachers={teachers}
          currentFilters={{
            classId: filterClass,
            teacherId: filterTeacher,
            status: filterStatus,
            applicationDate: filterApplicationDate,
            searchQuery: searchQuery
          }}
          onSuccessToast={(title, desc) => {
            setExportNotice({ title, desc });
            setTimeout(() => setExportNotice(null), 5000);
          }}
        />
      )}
    </div>
  );
};
