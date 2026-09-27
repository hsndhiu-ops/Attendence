import React, { useState } from 'react';
import { Student, ClearanceRequest } from '../types';
import { StatusBadge } from './StatusBadge';
import { StudentRequestDetailModal } from './StudentRequestDetailModal';
import { isEligibleForReminder } from '../services/db';
import { 
  Plus, 
  Calendar, 
  Mail, 
  BellRing, 
  FileText, 
  Edit3,
  User,
  ArrowRight
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  requests: ClearanceRequest[];
  onOpenNewRequest: () => void;
  onOpenProfile: () => void;
  onSendReminder: (req: ClearanceRequest) => void;
  onSimulate24Hours?: (reqId: string) => void;
}

// Clean date range helper with days count: "23 Sep – 25 Sep · 3 days"
function formatLeaveDatesWithDays(startDateStr: string, endDateStr: string): string {
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
      datesText = `${sDay} ${sMonth} ${sYear}`;
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

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  requests,
  onOpenNewRequest,
  onOpenProfile,
  onSendReminder
}) => {
  const [selectedReq, setSelectedReq] = useState<ClearanceRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const myRequests = requests.filter(r => r.student_id === student.id);

  const filteredRequests = myRequests.filter(r => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'overdue') return r.is_overdue;
    return r.status === filterStatus;
  });

  const pendingCount = myRequests.filter(r => r.status === 'pending').length;
  const approvedCount = myRequests.filter(r => r.status === 'approved').length;
  const verifiedCount = myRequests.filter(r => r.status === 'verified').length;

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* 1. Mobile-First Profile / Header Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-5 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Identity Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow-2xs">
            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate">
                {student.name}
              </h2>
              <span className="font-mono text-[11px] sm:text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {student.roll_no}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                {student.class_name}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1 font-mono text-slate-600 truncate max-w-[200px] xs:max-w-none">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {student.gmail ? (
                  <span className="truncate">{student.gmail}</span>
                ) : (
                  <span className="text-amber-600 font-sans font-medium">No Gmail Registered</span>
                )}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <button
                type="button"
                onClick={onOpenProfile}
                className="text-xs text-indigo-600 hover:text-indigo-800 active:text-indigo-900 font-medium underline underline-offset-2 flex items-center gap-1 transition-colors min-h-[32px]"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Button: Full width on mobile (<640px) for effortless thumb tap */}
        <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={onOpenNewRequest}
            className="w-full sm:w-auto h-11 sm:h-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Clearance Request</span>
          </button>
        </div>
      </div>

      {/* 2. Responsive Metrics Strip: 2x2 Grid on Mobile, Row on Desktop */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 space-y-3">
        {/* Mobile 2x2 Grid / Desktop Inline Metrics */}
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-6 gap-2 text-xs font-medium">
          <div className="bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-slate-200/60 sm:border-0 flex items-center justify-between sm:justify-start gap-1.5">
            <span className="text-slate-500 font-normal">Total Filed:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{myRequests.length}</span>
          </div>
          <span className="text-slate-200 hidden sm:inline" aria-hidden="true">|</span>
          <div className="bg-amber-50/60 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-amber-200/60 sm:border-0 flex items-center justify-between sm:justify-start gap-1.5">
            <span className="text-amber-700 font-normal">Pending:</span>
            <span className="font-bold text-amber-700 font-mono text-sm">{pendingCount}</span>
          </div>
          <span className="text-slate-200 hidden sm:inline" aria-hidden="true">|</span>
          <div className="bg-blue-50/60 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-blue-200/60 sm:border-0 flex items-center justify-between sm:justify-start gap-1.5">
            <span className="text-blue-700 font-normal">Approved:</span>
            <span className="font-bold text-blue-700 font-mono text-sm">{approvedCount}</span>
          </div>
          <span className="text-slate-200 hidden sm:inline" aria-hidden="true">|</span>
          <div className="bg-emerald-50/60 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-emerald-200/60 sm:border-0 flex items-center justify-between sm:justify-start gap-1.5">
            <span className="text-emerald-700 font-normal">Cleared:</span>
            <span className="font-bold text-emerald-700 font-mono text-sm">{verifiedCount}</span>
          </div>
        </div>

        {/* Filter Segmented Control (Smooth horizontal scroll on small screens) */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: `All (${myRequests.length})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'approved', label: `Approved (${approvedCount})` },
            { id: 'verified', label: `Cleared (${verifiedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap active:scale-95 min-h-[34px] flex items-center justify-center ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 bg-slate-100 hover:text-slate-900 active:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Clearance Request List: Mobile Card Adaptation + Desktop Row */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-8 sm:p-10 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No requests in this view</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filterStatus === 'all'
                ? "You haven't filed any clearance requests yet. Click '+ New Clearance Request' above to lodge an application."
                : `No requests with status '${filterStatus}'.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRequests.map(req => {
              // Progress status helpers
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';
              const isVerified = req.status === 'verified';
              const isRejected = req.status === 'rejected';

              return (
                <div 
                  key={req.id} 
                  className="p-3.5 sm:p-4 transition-colors hover:bg-slate-50/60"
                >
                  {/* MOBILE LAYOUT (< md:hidden) */}
                  <div className="md:hidden flex flex-col gap-2.5">
                    {/* Top Row: Reason Category + Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 tracking-tight">
                          {req.reason}
                        </div>
                        {req.reason_other_details && (
                          <div className="text-xs text-slate-500 truncate">
                            {req.reason_other_details}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <StatusBadge status={req.status} />
                        {req.is_overdue && (
                          <span 
                            title="Submitted past 14-day institutional limit"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Leave Dates & Reviewer */}
                    <div className="flex flex-col gap-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatLeaveDatesWithDays(req.leave_start_date, req.leave_end_date)}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Reviewer: <span className="font-semibold text-slate-700">{req.assigned_teacher_name}</span>
                      </div>
                    </div>

                    {/* Mobile Progress Bar: Clean, single-line indicator */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                        <span>
                          {isPending && 'Step 1 of 3: Under Faculty Review'}
                          {isApproved && 'Step 2 of 3: Faculty Approved'}
                          {isVerified && 'Step 3 of 3: Cleared in SHUHOOD'}
                          {isRejected && 'Application Declined'}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {isPending ? '33%' : isApproved ? '66%' : '100%'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 rounded-full ${
                            isPending ? 'w-1/3 bg-amber-500' :
                            isApproved ? 'w-2/3 bg-blue-600' :
                            isVerified ? 'w-full bg-emerald-600' :
                            'w-full bg-rose-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Card Footer: Full-Width Button Group with Min 40px Height */}
                    <div className="flex items-center gap-2 pt-1">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onSendReminder(req)}
                          className="flex-1 h-10 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                        >
                          <BellRing className="w-3.5 h-3.5 text-slate-500" />
                          <span>Send Reminder</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedReq(req)}
                        className={`h-10 px-4 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                          isPending
                            ? 'flex-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200'
                            : 'w-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200'
                        }`}
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* DESKTOP LAYOUT (hidden on mobile, visible on md:flex) */}
                  <div className="hidden md:flex md:items-center justify-between gap-3.5">
                    {/* Left Column: Reason Category, Clean Leave Date Range, Authorizing Faculty */}
                    <div className="space-y-1 min-w-0 md:w-1/3">
                      <div className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
                        <span>{req.reason}</span>
                        {req.reason_other_details && (
                          <span className="font-normal text-slate-500 text-xs truncate">
                            ({req.reason_other_details})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatLeaveDatesWithDays(req.leave_start_date, req.leave_end_date)}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Reviewer: <span className="font-medium text-slate-800">{req.assigned_teacher_name}</span>
                      </div>
                    </div>

                    {/* Center Column: 3-Step Progress Indicator */}
                    <div className="flex items-center justify-center py-1 md:py-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
                        {/* Step 1: Submitted */}
                        <div className="flex items-center gap-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isPending ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {isPending ? '1' : '✓'}
                          </div>
                          <span className={isPending ? 'font-semibold text-amber-900' : 'text-slate-600 font-medium'}>
                            Submitted
                          </span>
                        </div>

                        <span className="text-slate-300 font-bold" aria-hidden="true">→</span>

                        {/* Step 2: Approved */}
                        <div className="flex items-center gap-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isApproved ? 'bg-blue-600 text-white' :
                            isVerified ? 'bg-emerald-600 text-white' :
                            'bg-slate-200 text-slate-500'
                          }`}>
                            {isVerified ? '✓' : '2'}
                          </div>
                          <span className={
                            isApproved ? 'font-semibold text-blue-800' :
                            isVerified ? 'text-slate-600 font-medium' :
                            'text-slate-400'
                          }>
                            Approved
                          </span>
                        </div>

                        <span className="text-slate-300 font-bold" aria-hidden="true">→</span>

                        {/* Step 3: Cleared */}
                        <div className="flex items-center gap-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isVerified ? 'bg-emerald-600 text-white' :
                            isRejected ? 'bg-rose-500 text-white' :
                            'bg-slate-200 text-slate-500'
                          }`}>
                            {isVerified ? '✓' : '3'}
                          </div>
                          <span className={
                            isVerified ? 'font-semibold text-emerald-800' :
                            isRejected ? 'font-semibold text-rose-700' :
                            'text-slate-400'
                          }>
                            {isRejected ? 'Declined' : 'Cleared'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Status Badge & Desktop Actions */}
                    <div className="flex items-center justify-end gap-2.5 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={req.status} />
                        {req.is_overdue && (
                          <span 
                            title="Submitted past 14-day institutional limit"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Overdue
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => onSendReminder(req)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 min-h-[34px]"
                          >
                            <BellRing className="w-3.5 h-3.5 text-slate-400" />
                            <span>Send Reminder</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedReq(req)}
                          className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors min-h-[34px]"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Comprehensive Student Request Detail Modal */}
      <StudentRequestDetailModal
        isOpen={Boolean(selectedReq)}
        onClose={() => setSelectedReq(null)}
        request={selectedReq}
        onSendReminder={onSendReminder}
      />
    </div>
  );
};
