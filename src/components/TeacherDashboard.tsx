import React, { useState } from 'react';
import { Teacher, ClearanceRequest } from '../types';
import { StatusBadge } from './StatusBadge';
import { RequestDetailModal } from './RequestDetailModal';
import { TeacherRejectModal } from './TeacherRejectModal';
import { ConfirmationModal } from './ConfirmationModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Clock, 
  User, 
  Info,
  Calendar,
  ArrowRight,
  FileText,
  KeyRound
} from 'lucide-react';

interface TeacherDashboardProps {
  teacher: Teacher;
  allTeachers?: Teacher[];
  onSelectTeacher?: (teacher: Teacher) => void;
  requests: ClearanceRequest[];
  onApproveRequest: (reqId: string) => Promise<void>;
  onRejectRequest: (reqId: string, reason: string, templateType: string, customNote?: string) => Promise<void>;
}

// Clean date range helper: "23 Sep – 25 Sep · 3 days"
function formatLeavePeriodWithDays(startDateStr: string, endDateStr: string): string {
  try {
    const s = new Date(startDateStr + 'T00:00:00');
    const e = new Date(endDateStr + 'T00:00:00');
    const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
    const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
    const sDay = s.getDate();
    const eDay = e.getDate();
    const sYear = s.getFullYear();
    const eYear = e.getFullYear();

    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = isNaN(diffTime) ? 1 : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const daysLabel = `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;

    let datesText = '';
    if (sYear === eYear && sMonth === eMonth && sDay === eDay) {
      datesText = `${sDay} ${sMonth}`;
    } else if (sYear === eYear && sMonth === eMonth) {
      datesText = `${sDay} – ${eDay} ${sMonth}`;
    } else {
      datesText = `${sDay} ${sMonth} – ${eDay} ${eMonth}`;
    }
    return `${datesText} · ${daysLabel}`;
  } catch {
    return `${startDateStr} – ${endDateStr}`;
  }
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  allTeachers,
  onSelectTeacher,
  requests,
  onApproveRequest,
  onRejectRequest
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<ClearanceRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<ClearanceRequest | null>(null);
  const [approvingRequest, setApprovingRequest] = useState<ClearanceRequest | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter requests assigned or CC'd to this faculty member
  const teacherRequests = requests.filter(r => 
    r.teacher_id === teacher.id || r.class_teacher_id_if_different === teacher.id
  );

  const pendingRequests = teacherRequests.filter(r => r.status === 'pending');
  const overduePending = pendingRequests.filter(r => r.is_overdue);
  const approvedRequests = teacherRequests.filter(r => r.status === 'approved' || r.status === 'verified');
  const rejectedRequests = teacherRequests.filter(r => r.status === 'rejected');

  const filteredRequests = teacherRequests.filter(r => {
    const matchQuery = 
      r.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.student.class_name && r.student.class_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchQuery) return false;

    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'approved') return r.status === 'approved' || r.status === 'verified';
    if (activeTab === 'rejected') return r.status === 'rejected';
    return true;
  });

  const handleConfirmApproval = async () => {
    if (!approvingRequest) return;
    setIsProcessing(true);
    try {
      await onApproveRequest(approvingRequest.id);
      setApprovingRequest(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRejection = async (reason: string, templateType: string, customNote?: string) => {
    if (!rejectingRequest) return;
    setIsProcessing(true);
    try {
      await onRejectRequest(rejectingRequest.id, reason, templateType, customNote);
      setRejectingRequest(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* 1. Top Header: Faculty Identity Bar (Responsive) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
            {teacher.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate">
                {teacher.name}
              </h2>
              <span className="text-[11px] sm:text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium border border-indigo-200">
                {teacher.department}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono text-slate-600 truncate max-w-[200px] xs:max-w-none">{teacher.email}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Faculty Desk</span>
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Change Account Password"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY STATS STRIP: Clean, Single-Line Horizontal Metric Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-3 sm:flex sm:items-center sm:gap-6 gap-2 text-xs font-medium">
          <div className="bg-amber-50/60 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-amber-200/60 sm:border-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <span className="text-amber-700 font-normal text-[11px] sm:text-xs">Pending:</span>
            <span className="font-bold text-amber-700 font-mono text-sm">{pendingRequests.length}</span>
          </div>
          <span className="text-slate-200 hidden sm:inline" aria-hidden="true">|</span>
          <div className="bg-blue-50/60 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-blue-200/60 sm:border-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <span className="text-blue-700 font-normal text-[11px] sm:text-xs">Approved:</span>
            <span className="font-bold text-blue-700 font-mono text-sm">{approvedRequests.length}</span>
          </div>
          <span className="text-slate-200 hidden sm:inline" aria-hidden="true">|</span>
          <div className="bg-rose-50/60 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-rose-200/60 sm:border-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <span className="text-rose-700 font-normal text-[11px] sm:text-xs">Overdue:</span>
            <span className="font-bold text-rose-700 font-mono text-sm">{overduePending.length}</span>
          </div>
        </div>

        {/* Search Input: Full width on mobile, right-aligned on desktop */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 sm:top-2.5" />
          <input
            type="text"
            placeholder="Search student or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 sm:py-1.5 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white min-h-[40px] sm:min-h-[34px]"
          />
        </div>
      </div>

      {/* 3. REQUEST LIST: Responsive Pattern (Cards on Mobile, Table on Desktop) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Navigation Tabs (Horizontal scroll on phone) */}
        <div className="px-3.5 py-2.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap min-h-[32px] ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-200'
              }`}
            >
              <span>Pending Queue</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-mono tabular-nums">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap min-h-[32px] ${
                activeTab === 'approved'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-200'
              }`}
            >
              <span>Approved ({approvedRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap min-h-[32px] ${
                activeTab === 'rejected'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-200'
              }`}
            >
              <span>Rejected ({rejectedRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap min-h-[32px] ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-200'
              }`}
            >
              <span>All ({teacherRequests.length})</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Showing {filteredRequests.length} records
          </span>
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 ? (
          <div className="p-10 text-center">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No requests found</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === 'pending'
                ? 'All clearance applications assigned to you have been reviewed.'
                : 'No records matching current filter or search criteria.'}
            </p>
          </div>
        ) : (
          <>
            {/* A. MOBILE REVIEW CARDS (block md:hidden) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredRequests.map(req => {
                const isPending = req.status === 'pending';
                const isOverdue = req.is_overdue && isPending;

                return (
                  <div 
                    key={req.id}
                    className={`p-3.5 space-y-2.5 transition-colors ${
                      isOverdue ? 'bg-red-50/20' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Header: Student Name + Class Pill + Overdue Dot */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {req.student.name}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 shrink-0">
                          {req.student.class_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Overdue
                          </span>
                        ) : (
                          <StatusBadge status={req.status} />
                        )}
                      </div>
                    </div>

                    {/* Body: Leave Dates & Reason Category */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatLeavePeriodWithDays(req.leave_start_date, req.leave_end_date)}</span>
                      </div>
                      <div className="text-slate-600 flex items-center justify-between">
                        <span>Reason: <strong className="text-slate-800">{req.reason}</strong></span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {req.subjects_missed.length} subject{req.subjects_missed.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Footer (One-Thumb Quick Actions: Min 40px Height) */}
                    <div className="flex items-center gap-2 pt-0.5">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setRejectingRequest(req)}
                            className="flex-1 h-10 px-3 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 active:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                          >
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Reject</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setApprovingRequest(req)}
                            className="flex-1 h-10 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98]"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedRequest(req)}
                            className="h-10 px-3.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 rounded-lg transition-colors flex items-center justify-center shrink-0 active:scale-[0.98]"
                            title="Inspect full application details"
                          >
                            <span>Details</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="w-full h-10 px-4 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span>Review Full Details</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* B. DESKTOP STREAMLINED TABLE (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Leave Period</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRequests.map(req => {
                    const isPending = req.status === 'pending';
                    const isOverdue = req.is_overdue && isPending;

                    return (
                      <tr 
                        key={req.id} 
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isOverdue ? 'bg-red-50/30' : ''
                        }`}
                      >
                        {/* 1. STUDENT */}
                        <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                          {req.student.name}
                        </td>

                        {/* 2. CLASS */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                            {req.student.class_name}
                          </span>
                        </td>

                        {/* 3. REASON */}
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          {req.reason}
                        </td>

                        {/* 4. LEAVE PERIOD */}
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">
                          {formatLeavePeriodWithDays(req.leave_start_date, req.leave_end_date)}
                        </td>

                        {/* 5. STATUS */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isOverdue ? (
                            <span 
                              title="Submitted >14 days after leave conclusion"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              Overdue
                            </span>
                          ) : (
                            <StatusBadge status={req.status} />
                          )}
                        </td>

                        {/* 6. ACTIONS */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setRejectingRequest(req)}
                                  title="Reject Request"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setApprovingRequest(req)}
                                  title="Approve Request"
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedRequest(req)}
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors min-h-[32px]"
                            >
                              Review / Act
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Review & Approval Modal using the SAME rich RequestDetailModal */}
      {selectedRequest && (
        <RequestDetailModal
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          request={selectedRequest}
          userRole="teacher"
          onApprove={async (reqId) => {
            await onApproveRequest(reqId);
            setSelectedRequest(null);
          }}
          onReject={(req) => {
            setSelectedRequest(null);
            setRejectingRequest(req);
          }}
        />
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          userEmail={teacher.email}
          userName={teacher.name}
        />
      )}

      {/* Confirmation Modal for Quick Approving */}
      <ConfirmationModal
        isOpen={Boolean(approvingRequest)}
        onClose={() => setApprovingRequest(null)}
        onConfirm={handleConfirmApproval}
        title="Approve Clearance Request"
        description={`Approve attendance clearance for ${approvingRequest?.student.name} (${approvingRequest?.student.class_name})?`}
        confirmText="Confirm Approval & Notify Student"
        variant="primary"
        isLoading={isProcessing}
      >
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Institutional Workflow Note:
          </p>
          <p>
            Approving this request records faculty clearance. An automated notification will be dispatched to the student's Gmail. The Office Admin will complete final attendance verification in SHUHOOD.
          </p>
        </div>
      </ConfirmationModal>

      {/* Rejection Modal with Templates */}
      {rejectingRequest && (
        <TeacherRejectModal
          isOpen={Boolean(rejectingRequest)}
          onClose={() => setRejectingRequest(null)}
          request={rejectingRequest}
          onConfirmReject={handleConfirmRejection}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
};
