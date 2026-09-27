import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, PRESET_USERS, AuthUser } from '../context/AuthContext';
import { resetDBToSeed } from '../services/db';
import { 
  Wrench, 
  ChevronUp, 
  ChevronDown, 
  GraduationCap, 
  UserCheck, 
  Building2, 
  RotateCcw,
  Sparkles,
  CheckCircle,
  Shield
} from 'lucide-react';

interface DevToolbarProps {
  onResetData?: () => void;
}

export const DevToolbar: React.FC<DevToolbarProps> = ({ onResetData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, switchUser } = useAuth();
  const navigate = useNavigate();

  const handleSelectUser = (user: AuthUser) => {
    switchUser(user);
    if (user.role === 'student') {
      navigate('/student');
    } else if (user.role === 'teacher') {
      navigate('/teacher');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'main_admin') {
      navigate('/main-admin');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all clearance records, email logs, and test state to defaults?')) {
      resetDBToSeed();
      if (onResetData) onResetData();
      // Reset active user to first student
      switchUser(PRESET_USERS[0]);
      navigate('/student');
    }
  };

  const studentUsers = PRESET_USERS.filter(u => u.role === 'student');
  const teacherUsers = PRESET_USERS.filter(u => u.role === 'teacher');
  const adminUsers = PRESET_USERS.filter(u => u.role === 'admin');
  const mainAdminUsers = PRESET_USERS.filter(u => u.role === 'main_admin');

  return (
    <div className="fixed bottom-3 right-3 z-50 font-sans text-xs">
      {/* Expanded Panel */}
      {isOpen && (
        <div className="mb-2 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in slide-in-from-bottom-3 duration-200">
          <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span className="font-bold tracking-tight">Institutional RBAC Dev Console</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-3 max-h-[75vh] overflow-y-auto">
            {/* Student Section */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student Personas (→ /student)</span>
              </div>
              <div className="space-y-1">
                {studentUsers.map(u => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between ${
                        isCurrent 
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-semibold shadow-2xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{u.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-semibold">
                            {u.class_name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Adm: {u.admission_no} · {u.email}
                        </div>
                      </div>
                      {isCurrent && <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Teacher Section */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Teacher Personas (→ /teacher)</span>
              </div>
              <div className="space-y-1">
                {teacherUsers.map(u => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between ${
                        isCurrent 
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold shadow-2xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {u.department} · <span className="font-mono">{u.email}</span>
                        </div>
                      </div>
                      {isCurrent && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Office Admin Section */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Office Admin Persona (→ /admin)</span>
              </div>
              <div className="space-y-1">
                {adminUsers.map(u => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between ${
                        isCurrent 
                          ? 'bg-amber-50 border-amber-400 text-amber-950 font-semibold shadow-2xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.department}</div>
                      </div>
                      {isCurrent && <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Admin Section */}
            {mainAdminUsers.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>Main Admin / Owner (→ /main-admin)</span>
                </div>
                <div className="space-y-1">
                  {mainAdminUsers.map(u => {
                    const isCurrent = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between ${
                          isCurrent 
                            ? 'bg-amber-100 border-amber-500 text-amber-950 font-semibold shadow-2xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-500">{u.department}</div>
                        </div>
                        {isCurrent && <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset Session & Data */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="w-full py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Database & State</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Badge Docked at Bottom-Right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full shadow-lg border border-slate-700/80 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-xs font-medium backdrop-blur-xs"
        title="Toggle RBAC Persona Switcher"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Wrench className="w-3.5 h-3.5 text-amber-400" />
        <span>
          Dev Mode: <strong className="text-indigo-200">{currentUser ? currentUser.name : 'Logged Out'}</strong>
          {currentUser && <span className="text-slate-400 capitalize"> ({currentUser.role})</span>}
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
      </button>
    </div>
  );
};
