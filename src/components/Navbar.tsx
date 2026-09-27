import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, ExternalLink, Mail, User, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenEmailLogs: () => void;
  emailCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEmailLogs, emailCount }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const currentRole = currentUser?.role;
    logout();
    if (currentRole === 'teacher') {
      navigate('/teacher');
    } else if (currentRole === 'admin') {
      navigate('/admin');
    } else if (currentRole === 'main_admin') {
      navigate('/owner-access');
    } else {
      navigate('/student');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'teacher':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'admin':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'main_admin':
        return 'bg-amber-100 text-amber-950 border-amber-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const isAuditLogVisible = currentUser?.role === 'admin' || currentUser?.role === 'main_admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Left: Branding */}
          <div 
            onClick={() => {
              if (currentUser?.role === 'student') navigate('/student');
              else if (currentUser?.role === 'teacher') navigate('/teacher');
              else if (currentUser?.role === 'admin') navigate('/admin');
              else if (currentUser?.role === 'main_admin') navigate('/owner-access');
              else navigate('/student');
            }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs group-hover:bg-slate-800 transition-colors shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-none truncate max-w-[155px] xs:max-w-[220px] sm:max-w-none">
                Attendance Clearance System
              </h1>
              <span className="hidden sm:block text-[11px] text-slate-500 font-medium mt-0.5">
                Official Institutional Leave & Sanction Portal
              </span>
            </div>
          </div>

          {/* Right: Actions, Logged-in User Pill & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* External Register Link */}
            <a
              href="https://shuhood.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              title="Official SHUHOOD Register"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>SHUHOOD Register</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Email / Notification Audit Logs: ONLY visible for Office Admin & Main Admin */}
            {isAuditLogVisible && (
              <button
                onClick={onOpenEmailLogs}
                className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors whitespace-nowrap min-h-[36px]"
                title="Notification Dispatch Audit Console"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline">Audit Logs</span>
                {emailCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white font-mono tabular-nums">
                    {emailCount}
                  </span>
                )}
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Logged-in User Pill: {Name} · {Role} */}
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium max-w-[140px] xs:max-w-[200px] sm:max-w-none">
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-slate-900 truncate font-semibold">
                    {currentUser.name}
                  </span>
                  <span className="text-slate-300 hidden xs:inline">·</span>
                  <span className={`capitalize text-[10px] px-1.5 py-0.2 rounded border font-semibold hidden xs:inline ${getRoleBadge(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center border border-slate-200 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
