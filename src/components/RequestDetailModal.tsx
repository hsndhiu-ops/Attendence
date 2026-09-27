import React, { useState } from 'react';
import { ClearanceRequest, ClassEntity } from '../types';
import { StatusBadge } from './StatusBadge';
import { 
  X, 
  BellRing, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ExternalLink, 
  AlertTriangle,
  FileText,
  User,
  BookOpen
} from 'lucide-react';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ClearanceRequest | null;
  classes?: ClassEntity[];
  userRole?: 'teacher' | 'admin' | 'main_admin';
  onApprove?: (reqId: string) => void | Promise<void>;
  onReject?: (request: ClearanceRequest) => void | Promise<void>;
  onVerify?: (request: ClearanceRequest) => void | Promise<void>;
  onSendReminder?: (request: ClearanceRequest) => void | Promise<void>;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  classes,
  userRole = 'admin',
  onApprove,
  onReject,
  onVerify,
  onSendReminder
}) => {
  const [isNotified, setIsNotified] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !request) return null;

  // Calculate total leave duration in calendar days
  const start = new Date(request.leave_start_date);
  const end = new Date(request.leave_end_date);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = isNaN(diffTime) ? 0 : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const handleNotify = async () => {
    if (!onSendReminder) return;
    try {
      await onSendReminder(request);
      setIsNotified(true);
      setTimeout(() => setIsNotified(false), 2500);
    } catch {
      // Ignored
    }
  };

  const handleApproveAction = async () => {
    setIsUpdating(true);
    try {
      if (onApprove) {
        await onApprove(request.id);
      } else if (onVerify) {
        await onVerify(request);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const isTeacher = userRole === 'teacher';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header: Student Name — Leave Application with StatusBadge */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-indigo-300" />
            </div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight truncate max-w-xs sm:max-w-md">
              {request.student.name} — Leave Application
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={request.status} isOverdue={request.is_overdue} />
            <button 
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 14-Day Overdue Warning Banner */}
        {request.is_overdue && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 text-xs text-rose-900 flex items-start gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-800">14-Day Institutional Overdue Flag: </span>
              <span>
                Leave concluded on <strong>{request.leave_end_date}</strong> (14-day cutoff was {request.deadline_date}).
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Rich Matrix: 2-column Property Grid */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white shadow-2xs">
            {/* Row 1: Name & Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3 bg-white">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">NAME:</span>
                <span className="text-sm font-semibold text-slate-900 block mt-0.5">{request.student.name}</span>
                <span className="text-[11px] text-slate-500 font-mono">Adm: {request.student.roll_no}</span>
              </div>
              <div className="p-3 bg-white">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">CLASS:</span>
                <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {request.student.class_name}
                </span>
              </div>
            </div>

            {/* Row 2: Department & Authorizing Teacher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3 bg-white">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">DEPT:</span>
                <span className="text-sm font-medium text-slate-800 block mt-0.5">{request.student.department}</span>
              </div>
              <div className="p-3 bg-white">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">AUTHORIZING TEACHER:</span>
                <span className="text-sm font-medium text-slate-900 block mt-0.5">{request.assigned_teacher_name}</span>
                <span className="text-[11px] text-slate-500 font-mono">{request.assigned_teacher_email}</span>
              </div>
            </div>

            {/* Row 3: Leave Dates & Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3 bg-white">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">LEAVE DATES:</span>
                <div className="text-xs font-semibold text-slate-900 mt-1 flex items-center gap-1.5 flex-wrap">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{request.leave_start_date} → {request.leave_end_date}</span>
                  <span className="text-xs font-normal text-slate-500 font-sans">
                    ({diffDays} {diffDays === 1 ? 'day' : 'days'})
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">REASON:</span>
                <span className="text-sm font-medium text-slate-900 block mt-0.5">{request.reason}</span>
                {request.reason_other_details && (
                  <span className="text-xs text-slate-500 italic block mt-0.5">
                    ({request.reason_other_details})
                  </span>
                )}
              </div>
            </div>

            {/* Row 4: Submission Audit Status */}
            <div className="p-3 bg-white flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">SUBMISSION DATE & AUDIT:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-800 font-mono">Lodged on {request.submission_date}</span>
                </div>
              </div>
              <div>
                {request.is_overdue ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                    Overdue Submission
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    On-time Submission
                  </span>
                )}
              </div>
            </div>

            {/* Row 5: Subjects Missed */}
            <div className="p-3 bg-white">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                SUBJECTS MISSED ({request.subjects_missed?.length || 0}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {request.subjects_missed && request.subjects_missed.length > 0 ? (
                  request.subjects_missed.map((s, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs rounded-md border border-slate-200 font-medium"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs italic">No subjects specified</span>
                )}
              </div>
            </div>

            {/* Row 6: Details / Remarks */}
            <div className="p-3 bg-white">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                DETAILS / REMARKS:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {request.remarks || request.reason_other_details || 'No additional explanation provided by the student.'}
              </p>
            </div>

            {/* Row 7: Attached Certificate / Proof (if present) */}
            {request.document_name && (
              <div className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    ATTACHMENT / PROOF:
                  </span>
                  <span className="text-xs font-mono text-slate-800 mt-0.5 block truncate max-w-xs">
                    {request.document_name}
                  </span>
                </div>
                {request.document_url && (
                  <a
                    href={request.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <span>Preview Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer: Scoped Actions based on Role */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Close
          </button>

          {/* TEACHER-SCOPED ACTIONS */}
          {isTeacher && (
            <div className="flex items-center gap-2">
              {request.status === 'pending' ? (
                <>
                  {onReject && (
                    <button
                      type="button"
                      onClick={() => onReject(request)}
                      className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded-xl transition-colors cursor-pointer active:scale-95"
                    >
                      Reject with Reason
                    </button>
                  )}

                  {onApprove && (
                    <button
                      type="button"
                      onClick={handleApproveAction}
                      disabled={isUpdating}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                      <span>Approve Request</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  {request.status === 'approved' && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                      Approved by Faculty ✓ (Pending Admin SHUHOOD Clearance)
                    </span>
                  )}
                  {request.status === 'verified' && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Sanctioned & Cleared in SHUHOOD ✓
                    </span>
                  )}
                  {request.status === 'rejected' && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                      Application Declined
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* OFFICE ADMIN & MAIN ADMIN SCOPED ACTIONS */}
          {!isTeacher && (
            <div className="flex items-center gap-2">
              {onReject && (
                <button
                  type="button"
                  onClick={() => onReject(request)}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-300 rounded-xl transition-colors cursor-pointer"
                >
                  Reject
                </button>
              )}

              {onSendReminder && (
                <button
                  type="button"
                  onClick={handleNotify}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isNotified ? 'Notified ✓' : 'Forward / Notify Teacher'}</span>
                </button>
              )}

              {(onApprove || onVerify) && (
                <button
                  type="button"
                  onClick={handleApproveAction}
                  disabled={request.status === 'verified' || isUpdating}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isUpdating ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{request.status === 'verified' ? 'Cleared in SHUHOOD ✓' : 'Approve / Clear SHUHOOD'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
