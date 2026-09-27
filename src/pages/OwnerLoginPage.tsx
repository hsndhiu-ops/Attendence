import React, { useState } from 'react';
import { useAuth, MAIN_ADMIN_USER } from '../context/AuthContext';
import { signInWithEmailPassword } from '../services/supabase';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

interface OwnerLoginPageProps {
  onSuccess?: () => void;
}

export const OwnerLoginPage: React.FC<OwnerLoginPageProps> = ({ onSuccess }) => {
  const { switchUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    setIsLoading(true);
    try {
      // 1. Try Supabase Auth
      const res = await signInWithEmailPassword(cleanUser, cleanPass, 'main_admin');
      if (res.success && res.user) {
        switchUser(res.user);
        if (onSuccess) onSuccess();
        return;
      }

      // 2. Direct hardcoded master controller credentials fallback
      const isValidUser = ['owner', 'controller', 'controller@institution.edu', 'admin', 'mainadmin'].includes(cleanUser);
      const isValidPass = ['master2026', 'admin123', 'owner123', 'admin'].includes(cleanPass);

      if (isValidUser && isValidPass) {
        switchUser(MAIN_ADMIN_USER);
        if (onSuccess) onSuccess();
      } else {
        setError('Invalid controller credentials. Access denied.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Institutional Header */}
        <div className="px-6 py-6 bg-slate-900 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3 border border-white/10 shadow-inner">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            System Controller Access
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Restricted Master Clearance Terminal
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Controller Access ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Controller Username or Email"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-hidden min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Master Access Key <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-hidden min-h-[44px]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate Controller</span>
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
