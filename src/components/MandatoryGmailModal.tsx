import React, { useState } from 'react';
import { Student } from '../types';
import { Mail, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface MandatoryGmailModalProps {
  isOpen: boolean;
  student: Student;
  onRegisterGmail: (gmail: string) => void;
}

export const MandatoryGmailModal: React.FC<MandatoryGmailModalProps> = ({
  isOpen,
  student,
  onRegisterGmail
}) => {
  const [gmail, setGmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = gmail.trim().toLowerCase();
    if (!clean) {
      setError('Gmail address is strictly required to receive clearance approvals.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clean)) {
      setError('Please enter a valid email address (e.g. yourname@gmail.com).');
      return;
    }

    if (!clean.endsWith('@gmail.com') && !clean.includes('@')) {
      setError('Please provide a valid Gmail address (@gmail.com).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onRegisterGmail(clean);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      // Non-dismissible: clicks on backdrop do nothing
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gmail-modal-title"
      >
        {/* Banner with Attention Accent */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Mail className="w-32 h-32 text-indigo-400" />
          </div>

          <div className="w-13 h-13 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Mail className="w-6 h-6 text-indigo-300" />
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400 text-amber-950 mb-2 shadow-2xs">
            Action Required
          </span>

          <h2 id="gmail-modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Register Notification Gmail
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
            Link your personal Gmail to receive real-time faculty approvals, reminder confirmations, and official attendance clearance slips.
          </p>
        </div>

        {/* Student Verification Pill */}
        <div className="px-6 pt-4 pb-1">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Logged in Student
              </span>
              <span className="font-bold text-slate-900 truncate block">
                {student.name}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded text-[11px] border border-indigo-100 block">
                {student.class_name}
              </span>
              <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                Adm: {student.roll_no}
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 pt-3">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Personal Gmail Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                autoFocus
                placeholder="e.g. yourname@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 text-base sm:text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-hidden min-h-[46px]"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Used strictly for clearance emails & decision notices.</span>
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save Gmail & Unlock Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
