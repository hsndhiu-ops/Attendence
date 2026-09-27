import React, { useState } from 'react';
import { UserRole, Student, Teacher } from '../types';
import { 
  Mail, 
  GraduationCap, 
  Building2, 
  UserCheck, 
  RefreshCw, 
  ExternalLink, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeStudent: Student | null;
  activeTeacher: Teacher | null;
  onOpenEmailLogs: () => void;
  emailCount: number;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeStudent,
  activeTeacher,
  onOpenEmailLogs,
  emailCount,
  onResetData
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Wordmark & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold sm:font-bold tracking-tight text-slate-900 leading-none truncate max-w-[150px] xs:max-w-[210px] sm:max-w-none">
                Attendance Clearance
              </h1>
              <span className="hidden sm:block text-[11px] text-slate-500 font-medium mt-0.5">
                Academic Leave & Clearance Portal
              </span>
            </div>
          </div>

          {/* Zone 2: Role Segmented Control (Compact on mobile) */}
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-lg border border-slate-200/80 h-8 sm:h-auto max-w-[210px] xs:max-w-none">
            <button
              onClick={() => onRoleChange('student')}
              className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap active:scale-95 ${
                currentRole === 'student'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Student<span className="hidden sm:inline"> Portal</span></span>
            </button>

            <button
              onClick={() => onRoleChange('teacher')}
              className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap active:scale-95 ${
                currentRole === 'teacher'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Teacher<span className="hidden sm:inline"> Desk</span></span>
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap active:scale-95 ${
                currentRole === 'admin'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span><span className="hidden md:inline">Office </span>Admin</span>
            </button>
          </div>

          {/* Zone 3: Desktop Actions & Utilities */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {/* External SHUHOOD System Link */}
            <a
              href="https://shuhood.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              title="External SHUHOOD attendance register system"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>SHUHOOD System</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Email Audit Log Inspector button */}
            <button
              onClick={onOpenEmailLogs}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors whitespace-nowrap min-h-[36px]"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>Email Logs</span>
              {emailCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white font-mono tabular-nums">
                  {emailCount}
                </span>
              )}
            </button>

            {/* Quick reset data button */}
            <button
              onClick={onResetData}
              title="Reset to default college sample records"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Zone 4: Mobile Hamburger Button (< 768px) */}
          <div className="flex md:hidden items-center shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-lg active:bg-slate-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {emailCount > 0 && !mobileMenuOpen && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Card */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          <div className="flex flex-col gap-1.5 text-xs">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEmailLogs();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-800 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors font-medium min-h-[42px]"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>Email Audit Logs</span>
              </div>
              {emailCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white font-mono">
                  {emailCount}
                </span>
              )}
            </button>

            <a
              href="https://shuhood.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-800 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors font-medium min-h-[42px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>External SHUHOOD Register</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onResetData();
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors font-medium min-h-[42px]"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Reset College Sample Records</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
