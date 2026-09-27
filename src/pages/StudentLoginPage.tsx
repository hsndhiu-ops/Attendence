import React, { useState } from 'react';
import { useAuth, AuthUser, PRESET_USERS } from '../context/AuthContext';
import { FIXED_CLASSES } from '../components/StudentAuthModal';
import { GraduationCap, ArrowRight, Hash, User, AlertCircle } from 'lucide-react';

interface StudentLoginPageProps {
  onSuccess?: () => void;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ onSuccess }) => {
  const { switchUser } = useAuth();
  const [admissionNo, setAdmissionNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('FC-2');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanAdmission = admissionNo.trim().toUpperCase();
    const cleanName = studentName.trim();

    if (!cleanAdmission) {
      setErrorMessage('Please enter your Admission Number.');
      return;
    }
    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const classObj = FIXED_CLASSES.find(c => c.name === studentClass) || FIXED_CLASSES[3];

    // Check if preset student exists with this admission number to retain their Gmail if present
    const existing = PRESET_USERS.find(
      u => u.role === 'student' && u.admission_no?.toUpperCase() === cleanAdmission
    );

    const newUser: AuthUser = {
      id: existing ? existing.id : `stu-${cleanAdmission.toLowerCase()}`,
      name: cleanName,
      role: 'student',
      email: existing ? existing.email : '', // If empty, triggers mandatory Gmail modal on student dashboard
      admission_no: cleanAdmission,
      class_name: classObj.name,
      department: classObj.department
    };

    switchUser(newUser);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Institutional Header */}
        <div className="px-6 py-6 bg-slate-900 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3 border border-white/10 shadow-inner">
            <GraduationCap className="w-6 h-6 text-indigo-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Student Leave Portal
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign in with your Admission Number & Name to file requests
          </p>
        </div>

        {/* Credential Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Admission No <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. 24CS099"
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-hidden min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Enter your registered name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-hidden min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Class <span className="text-rose-500">*</span>
            </label>
            <select
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-hidden min-h-[44px]"
            >
              {FIXED_CLASSES.map(cls => (
                <option key={cls.id} value={cls.name}>
                  {cls.name} — {cls.department}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-11 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Enter Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
