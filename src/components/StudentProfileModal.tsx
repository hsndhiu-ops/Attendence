import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { Mail, User, BookOpen, Hash, X, AlertCircle, LogOut } from 'lucide-react';
import { FIXED_CLASSES } from './StudentAuthModal';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSaveProfile: (updated: Student) => void;
  onLogout?: () => void;
  isMandatoryFirstTime?: boolean;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onSaveProfile,
  onLogout,
  isMandatoryFirstTime = false
}) => {
  const [name, setName] = useState(student.name);
  const [selectedClass, setSelectedClass] = useState(student.class_name || 'FC-2');
  const [gmail, setGmail] = useState(student.gmail || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(student.name);
    setSelectedClass(student.class_name || 'FC-2');
    setGmail(student.gmail || '');
    setError('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const trimmedGmail = gmail.trim().toLowerCase();

    if (!cleanName) {
      setError('Please provide your Full Name.');
      return;
    }
    if (!trimmedGmail) {
      setError('Please provide a valid personal Gmail address.');
      return;
    }
    if (!trimmedGmail.includes('@') || !trimmedGmail.endsWith('@gmail.com')) {
      setError('Must be a valid Gmail account (e.g. yourname@gmail.com) for college notifications.');
      return;
    }

    const classObj = FIXED_CLASSES.find(c => c.name === selectedClass) || FIXED_CLASSES[3];

    const updatedStudent: Student = {
      ...student,
      name: cleanName,
      class_id: classObj.id,
      class_name: classObj.name,
      department: classObj.department,
      gmail: trimmedGmail
    };

    setError('');
    onSaveProfile(updatedStudent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full h-full sm:h-auto sm:max-w-md bg-white rounded-none sm:rounded-xl shadow-2xl border-0 sm:border border-slate-200 overflow-y-auto flex flex-col my-auto max-h-screen sm:max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {isMandatoryFirstTime ? 'Required: Register Gmail' : 'Student Profile'}
              </h3>
              <p className="text-[11px] text-slate-500">Official Clearance Notification Recipient</p>
            </div>
          </div>
          {!isMandatoryFirstTime && (
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 p-2 sm:p-1 rounded-md hover:bg-slate-100 transition-colors min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 flex-1 overflow-y-auto">
          {isMandatoryFirstTime && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Please register your personal <strong>@gmail.com</strong> address. Official notifications regarding approvals and clearance will be delivered here.
              </span>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Admission Number (Fixed Institutional Identifier) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admission No (Institutional ID)
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
              <input
                type="text"
                disabled
                value={student.roll_no}
                className="w-full pl-9 pr-3 py-2 text-base sm:text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono font-medium cursor-not-allowed min-h-[42px] sm:min-h-[36px]"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden min-h-[42px] sm:min-h-[36px]"
              />
            </div>
          </div>

          {/* Class (Limited strictly to 8 fixed classes) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Class <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden min-h-[42px] sm:min-h-[36px]"
              >
                {FIXED_CLASSES.map(cls => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name} — {cls.department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Personal Gmail Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Gmail Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
              <input
                type="email"
                required
                placeholder="e.g. yourname.student@gmail.com"
                value={gmail}
                onChange={e => setGmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden min-h-[42px] sm:min-h-[36px]"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Clearance approvals, status updates & certificates will be delivered here.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 sm:pt-3 border-t border-slate-200 flex items-center justify-between gap-2.5">
            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="h-10 sm:h-auto px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 active:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 min-h-[40px] sm:min-h-0"
                title="Switch student profile or sign out"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              {!isMandatoryFirstTime && (
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 sm:h-auto px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="h-10 sm:h-auto px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg shadow-xs transition-colors active:scale-95"
              >
                Save Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
