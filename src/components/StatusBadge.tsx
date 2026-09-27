import React from 'react';
import { RequestStatus } from '../types';
import { Clock, CheckCircle2, ShieldCheck, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus;
  isOverdue?: boolean;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'streamlined';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  isOverdue = false,
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  if (variant === 'streamlined') {
    if (status === 'rejected') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 border border-red-200/80 px-2.5 py-0.5 text-xs font-medium ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span className="whitespace-nowrap">Rejected</span>
        </span>
      );
    }

    if (status === 'verified') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-medium ${className}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="whitespace-nowrap">Cleared</span>
        </span>
      );
    }

    if (status === 'approved') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 text-xs font-medium ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="whitespace-nowrap">Awaiting SHUHOOD</span>
        </span>
      );
    }

    // Pending status
    if (isOverdue) {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 px-2.5 py-0.5 text-xs font-medium ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="whitespace-nowrap">Overdue Pending</span>
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 text-xs font-medium ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="whitespace-nowrap">Pending</span>
      </span>
    );
  }

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  if (status === 'rejected') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-red-50 text-red-700 border border-red-200/80 ${pad} ${className}`}>
        <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
        <span className="whitespace-nowrap">Rejected</span>
      </span>
    );
  }

  if (status === 'verified') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${pad} ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="whitespace-nowrap">Verified / Cleared</span>
      </span>
    );
  }

  if (status === 'approved') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/80 ${pad} ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="whitespace-nowrap">Approved (Teacher)</span>
      </span>
    );
  }

  // Pending status
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 ${pad} ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="whitespace-nowrap">Pending</span>
      </span>

      {isOverdue && (
        <span className={`inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-800 border border-rose-300 font-semibold ${pad} animate-pulse`}>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="whitespace-nowrap">Overdue</span>
        </span>
      )}
    </div>
  );
};
