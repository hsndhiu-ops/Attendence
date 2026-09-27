import React, { useState } from 'react';
import { ClearanceRequest } from '../types';
import { StatusBadge } from './StatusBadge';
import { 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  MessageSquare
} from 'lucide-react';

interface TeacherReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ClearanceRequest | null;
  onApprove: (reqId: string, notes?: string) => Promise<void> | void;
  onReject: (request: ClearanceRequest, notes?: string) => void;
  isLoading?: boolean;
}

// Clean date range helper
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
    const daysLabel = `(${diffDays} ${diffDays === 1 ? 'day' : 'days'})`;

    let datesText = '';
    if (sYear === eYear && sMonth === eMonth && sDay === eDay) {
      datesText = `${sDay} ${sMonth} ${sYear}`;
    } else if (sYear === eYear && sMonth === eMonth) {
      datesText = `${sDay} – ${eDay} ${sMonth} ${sYear}`;
    } else {
      datesText = `${sDay} ${sMonth} – ${eDay} ${eMonth} ${sYear}`;
    }
    return `${datesText} ${daysLabel}`;
  } catch {
    return `${startDateStr} – ${endDateStr}`;
  }
}

function formatSingleDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export const TeacherReviewModal: React.FC<TeacherReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const [teacherNotes, setTeacherNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleApproveClick = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(request.id, teacherNotes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = () => {
    onReject(request, teacherNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full h-full sm:h-auto sm:max-w-xl bg-white rounded-none sm:rounded-xl shadow-2xl border-0 sm:border border-slate-200 overflow-y-auto flex flex-col my-auto max-h-screen sm:max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header: Student Name, Class, and Leave Category */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
              {request.student.name}
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/30 text-indigo-200 rounded border border-indigo-400/30 shrink-0">
              {request.student.class_name}
            </span>
            <span className="text-slate-400 shrink-0 hidden xs:inline">·</span>
            <span className="text-xs font-medium text-slate-300 truncate hidden xs:inline">
              {request.reason}
            </span>
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

        {/* Overdue Alert banner if flagged */}
        {request.is_overdue && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-xs text-red-900 flex items-start gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-800">14-Day Overdue Warning: </span>
              <span>
                Leave ended on <strong>{formatSingleDate(request.leave_end_date)}</strong> (deadline was {formatSingleDate(request.deadline_date)}).
              </span>
            </div>
          </div>
        )}

        {/* Property Grid: Comfortable vertical scroll */}
        <div className="p-3.5 sm:p-4 space-y-3 sm:space-y-3.5 text-xs flex-1 overflow-y-auto">
          <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200 bg-white shadow-2xs">
            {/* Row 1: Leave Dates & Duration + Submission Audit Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3 bg-white">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Leave Dates & Duration
                </span>
                <div className="text-xs font-semibold text-slate-900 mt-1 flex items-center gap-1.5 flex-wrap">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formatLeavePeriodWithDays(request.leave_start_date, request.leave_end_date)}</span>
                </div>
              </div>
              <div className="p-3 bg-white">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Submission Date & Audit Status
                </span>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-800 font-medium">
                    Lodged: {formatSingleDate(request.submission_date)}
                  </span>
                  {request.is_overdue ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-100 text-red-800">
                      ● Overdue
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      ● On-time
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Full Reason / Student Remarks */}
            <div className="p-3 bg-white">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Reason & Student Remarks
              </span>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-800 space-y-1">
                <p className="font-semibold text-slate-900">
                  {request.reason}
                  {request.reason_other_details && ` (${request.reason_other_details})`}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {request.remarks || 'No detailed remarks submitted.'}
                </p>
              </div>
            </div>

            {/* Row 3: Subjects & Periods Missed (tidy chips/tags with flex-wrap) */}
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
                      className="px-2.5 py-1 sm:py-0.5 bg-slate-100 text-slate-800 text-xs sm:text-[11px] font-medium rounded border border-slate-200"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Row 4: Attachment / Medical Certificate (if provided) */}
            {request.document_name && (
              <div className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Proof / Attached Certificate
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
                    className="h-10 sm:h-auto px-3.5 py-2 sm:py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg sm:rounded-md transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
                  >
                    <span>Preview Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Action Section (Bottom) */}
          {request.status === 'pending' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs sm:text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Teacher Remarks / Notes (Optional):</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional internal feedback or notes regarding approval/rejection..."
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden min-h-[50px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button Group: Pinned to bottom with large touch targets */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          {request.status === 'pending' ? (
            <div className="flex items-center gap-2.5 sm:justify-end">
              <button
                type="button"
                onClick={handleRejectClick}
                disabled={isLoading || isSubmitting}
                className="flex-1 sm:flex-initial h-11 sm:h-auto px-4 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-white hover:bg-rose-50 active:bg-rose-100 border border-rose-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Reject Request</span>
              </button>

              <button
                type="button"
                onClick={handleApproveClick}
                disabled={isLoading || isSubmitting}
                className="flex-1 sm:flex-initial h-11 sm:h-auto px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{isSubmitting ? 'Approving...' : 'Approve Request'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-slate-600 truncate">
                Status: <strong className="capitalize">{request.status}</strong>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
