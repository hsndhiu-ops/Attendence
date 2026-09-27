import React from 'react';
import { AlertCircle, CheckCircle, HelpCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'success';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
  children
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          btn: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500',
          iconBg: 'bg-red-100 text-red-600',
          icon: <AlertCircle className="w-5 h-5" />
        };
      case 'success':
        return {
          btn: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus:ring-emerald-500',
          iconBg: 'bg-emerald-100 text-emerald-600',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'primary':
      default:
        return {
          btn: 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white focus:ring-slate-500',
          iconBg: 'bg-slate-100 text-slate-700',
          icon: <HelpCircle className="w-5 h-5" />
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="w-full sm:max-w-lg bg-white rounded-none sm:rounded-xl shadow-xl border-0 sm:border border-slate-200 overflow-hidden scale-in-95 transition-all my-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className={`p-2 sm:p-2.5 rounded-lg shrink-0 ${style.iconBg}`}>
              {style.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 p-2 sm:p-1 rounded-md transition-colors min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{description}</p>
            </div>
          </div>

          {children && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              {children}
            </div>
          )}
        </div>

        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 sm:h-auto px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-10 sm:h-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 ${style.btn}`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
