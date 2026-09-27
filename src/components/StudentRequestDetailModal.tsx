import React from 'react';
import { ClearanceRequest } from '../types';
import { StatusBadge } from './StatusBadge';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  BellRing, 
  FileText, 
  ExternalLink, 
  Send
} from 'lucide-react';
import { isEligibleForReminder } from '../services/db';

interface StudentRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ClearanceRequest | null;
  onSendReminder?: (request: ClearanceRequest) => void;
}

export const StudentRequestDetailModal: React.FC<StudentRequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  onSendReminder
}) => {
  if (!isOpen || !request) return null;

  // Calculate duration in days
  const start = new Date(request.leave_start_date);
  const end = new Date(request.leave_end_date);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = isNaN(diffTime) ? 0 : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const eligibleReminder = isEligibleForReminder(request);

  // Formatted dates
  const formatNiceDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full h-full sm:h-auto sm:max-w-xl bg-white rounded-none sm:rounded-xl shadow-2xl border-0 sm:border border-slate-200 overflow-y-auto flex flex-col my-auto max-h-screen sm:max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-300 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                Clearance Details
              </h2>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                ID: {request.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={request.status} isOverdue={request.is_overdue} />
            <button 
              type="button"
              onClick={onClose}
              className="p-2 sm:p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Overdue Policy Notice Banner (If Applicable) */}
        {request.is_overdue && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-xs text-red-900 flex items-start gap-2.5 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-red-950">Institutional 14-Day Notice</p>
              <p className="text-[11px] text-red-800 leading-relaxed">
                Lodged on <strong>{formatNiceDate(request.submission_date)}</strong>, exceeding the 14-day limit (<strong>{formatNiceDate(request.deadline_date)}</strong>) after leave on {formatNiceDate(request.leave_end_date)}.
              </p>
            </div>
          </div>
        )}

        {/* Content Body: Property Grid */}
        <div className="p-3.5 sm:p-4 space-y-3.5 text-xs flex-1 overflow-y-auto">
          <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200 bg-white shadow-2xs">
            {/* Row 1: Student & Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3 bg-white">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Student Name
                </span>
                <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                  {request.student.name}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Roll: {request.student.roll_no}
                </span>
              </div>
              <div className="p-3 bg-white">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Class & Department
                </span>
                <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                  {request.student.class_name}
                </span>
                <span className="block text-[11px] text-slate-500 mt-1">
                  {request.student.department}
                </span>
              </div>
            </div>

            {/* Row 2: Leave Dates & Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3 bg-white">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Leave Dates & Duration
                </span>
                <div className="text-xs font-medium text-slate-900 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formatNiceDate(request.leave_start_date)} → {formatNiceDate(request.leave_end_date)}</span>
                  <span className="font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 text-[10px]">
                    {diffDays} {diffDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Reason Category
                </span>
                <span className="text-sm font-medium text-slate-900 block mt-0.5">
                  {request.reason}
                </span>
                {request.reason_other_details && (
                  <span className="text-[11px] text-slate-500 block">
                    {request.reason_other_details}
                  </span>
                )}
              </div>
            </div>

            {/* Row 3: Authorizing Teacher & Submission */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3 bg-white">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Authorizing Faculty
                </span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                  {request.assigned_teacher_name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  {request.assigned_teacher_email}
                </span>
                {request.class_teacher_name && request.class_teacher_id_if_different && (
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    CC: {request.class_teacher_name}
                  </span>
                )}
              </div>
              <div className="p-3 bg-white">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Application Timestamps
                </span>
                <div className="mt-0.5 space-y-0.5">
                  <div className="text-[11px] text-slate-700">
                    <span className="text-slate-400">Submitted:</span> {formatNiceDate(request.submission_date)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Time: {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="text-slate-400">Deadline:</span> {formatNiceDate(request.deadline_date)}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Missed Subjects */}
            <div className="p-3 bg-white">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Subjects Missed ({request.subjects_missed.length})
              </span>
              {request.subjects_missed.length === 0 ? (
                <span className="text-slate-400 italic text-[11px]">No specific subjects flagged.</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {request.subjects_missed.map((subject, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 sm:py-0.5 bg-slate-100 text-slate-800 text-xs sm:text-[11px] font-medium rounded-md border border-slate-200"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Row 5: Student Explanation & Remarks */}
            <div className="p-3 bg-white">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Student Explanation & Notes
              </span>
              <p className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-md border border-slate-200 leading-relaxed font-sans">
                {request.remarks || 'No additional remarks provided.'}
              </p>
            </div>

            {/* Row 6: Attached Document (if any) */}
            {request.document_name && (
              <div className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Proof / Medical Document
                  </span>
                  <span className="text-xs text-slate-800 font-mono block mt-0.5 truncate max-w-xs">
                    {request.document_name}
                  </span>
                </div>
                {request.document_url && (
                  <a
                    href={request.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>View File</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Activity / Audit Log Section */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 space-y-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Application Activity & Audit Trail
            </span>

            <div className="space-y-1.5 text-xs sm:text-[11px]">
              {/* Submission entry */}
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Lodged on {new Date(request.created_at).toLocaleString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </span>
              </div>

              {/* Reminders dispatched */}
              {request.reminder_count && request.reminder_count > 0 ? (
                <div className="flex items-center gap-2 text-amber-800 font-medium">
                  <BellRing className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {request.reminder_count} nudge reminder{request.reminder_count > 1 ? 's' : ''} sent to faculty (last: {request.last_reminder_sent_at ? new Date(request.last_reminder_sent_at).toLocaleDateString() : 'N/A'})
                  </span>
                </div>
              ) : null}

              {/* Faculty Approval */}
              {request.approved_at && (
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Approved by {request.assigned_teacher_name} on {new Date(request.approved_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Final Clearance in SHUHOOD */}
              {request.verified_at && (
                <div className="flex items-start gap-2 text-emerald-900 font-semibold bg-emerald-50 p-2 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span>Cleared in SHUHOOD Register on {new Date(request.verified_at).toLocaleDateString()}.</span>
                    {request.admin_notes && (
                      <p className="font-normal text-slate-700 mt-0.5">Note: {request.admin_notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection */}
              {request.status === 'rejected' && (
                <div className="flex items-start gap-2 text-rose-900 font-medium bg-rose-50 p-2 rounded border border-rose-200">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Application Disapproved</span>
                    {request.rejection_reason && (
                      <p className="mt-0.5 text-slate-700">Reason: {request.rejection_reason}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Action Bar: Pinned at bottom on phone */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 gap-2">
          <div>
            {request.status === 'pending' && onSendReminder && eligibleReminder && (
              <button
                type="button"
                onClick={() => onSendReminder(request)}
                className="h-10 px-3.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs active:scale-95"
              >
                <BellRing className="w-4 h-4 text-amber-600" />
                <span>Nudge Faculty</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100 shadow-2xs transition-colors active:scale-95 ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
