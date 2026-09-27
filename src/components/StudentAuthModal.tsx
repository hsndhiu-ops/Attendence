import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { GraduationCap, Mail, User, Hash, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

export const FIXED_CLASSES = [
  { id: 'c-qla3', name: 'QLA-3', department: 'Quality Assurance & Leadership' },
  { id: 'c-hfc3', name: 'HFC-3', department: 'Human Factors & Computing' },
  { id: 'c-qh2', name: 'QH-2', department: 'Quantitative Hardware Systems' },
  { id: 'c-fc2', name: 'FC-2', department: 'Foundations of Computing' },
  { id: 'c-al2', name: 'AL-2', department: 'Applied Logic & Software' },
  { id: 'c-qh1', name: 'QH-1', department: 'Quantitative Hardware Principles' },
  { id: 'c-fc1', name: 'FC-1', department: 'Foundations of Computing Intro' },
  { id: 'c-al1', name: 'AL-1', department: 'Applied Logic & Methods' }
];

interface StudentAuthModalProps {
  isOpen: boolean;
  onLogin: (student: Student) => void;
  existingStudents: Student[];
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onLogin,
  existingStudents
}) => {
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(FIXED_CLASSES[3].name); // FC-2 default
  const [gmail, setGmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Auto-fill when roll number matches an existing student
  const handleRollChange = (val: string) => {
    setRollNo(val);
    setError('');
    const match = existingStudents.find(
      s => s.roll_no.trim().toLowerCase() === val.trim().toLowerCase()
    );
    if (match) {
      setName(match.name);
      setSelectedClass(match.class_name);
      setGmail(match.gmail || '');
    }
  };

  const handleQuickSelect = (student: Student) => {
    setRollNo(student.roll_no);
    setName(student.name);
    setSelectedClass(student.class_name);
    setGmail(student.gmail || '');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAdmission = rollNo.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanAdmission) {
      setError('Please enter your Admission Number.');
      return;
    }
    if (!cleanName) {
      setError('Please enter your Full Name.');
      return;
    }

    const classObj = FIXED_CLASSES.find(c => c.name === selectedClass) || FIXED_CLASSES[3];

    // Find existing student or create new profile
    const existing = existingStudents.find(
      s => s.roll_no.trim().toUpperCase() === cleanAdmission
    );

    const studentProfile: Student = {
      id: existing ? existing.id : `stu-${Date.now()}`,
      roll_no: cleanAdmission,
      name: cleanName,
      class_id: classObj.id,
      class_name: classObj.name,
      department: classObj.department,
      gmail: existing?.gmail || gmail.trim().toLowerCase(),
      created_at: existing ? existing.created_at : new Date().toISOString()
    };

    onLogin(studentProfile);
  };

  const matchedStudent = existingStudents.find(
    s => s.roll_no.trim().toUpperCase() === rollNo.trim().toUpperCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full h-full sm:h-auto sm:max-w-md bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 overflow-y-auto flex flex-col my-auto max-h-screen sm:max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <GraduationCap className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white leading-tight">
                Student Portal Sign In
              </h2>
              <p className="text-xs text-slate-300">
                Attendance Clearance & Institutional Leave System
              </p>
            </div>
          </div>
        </div>

        {/* Existing Quick Pick Pill Strip (Scrollable on mobile) */}
        {existingStudents.length > 0 && (
          <div className="px-4 py-2.5 sm:px-6 sm:pt-3.5 sm:pb-2 bg-slate-50/80 border-b border-slate-100 shrink-0">
            <p className="text-[11px] font-medium text-slate-500 mb-1.5">
              Quick Pick Registered Student Profile:
            </p>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {existingStudents.slice(0, 4).map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleQuickSelect(s)}
                  className={`text-[11px] px-3 py-1.5 sm:py-1 rounded-md border font-medium transition-all whitespace-nowrap active:scale-95 min-h-[32px] ${
                    rollNo.toUpperCase() === s.roll_no.toUpperCase()
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 active:bg-slate-100'
                  }`}
                >
                  {s.name} ({s.roll_no})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 flex-1 overflow-y-auto">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {matchedStudent && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Found registered profile for <strong>{matchedStudent.name}</strong>. Details auto-loaded.
              </span>
            </div>
          )}

          {/* Admission Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admission No <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. 22CS041"
                value={rollNo}
                onChange={e => handleRollChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 sm:py-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900 focus:outline-hidden min-h-[42px] sm:min-h-[36px]"
                autoFocus
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. Aarav Mehta"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 sm:py-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden min-h-[42px] sm:min-h-[36px]"
              />
            </div>
          </div>

          {/* Class */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Class <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5 pointer-events-none" />
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full pl-9 pr-3 py-2 sm:py-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden min-h-[42px] sm:min-h-[36px]"
              >
                {FIXED_CLASSES.map(cls => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name} — {cls.department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 sm:pt-3">
            <button
              type="submit"
              className="w-full h-11 sm:h-10 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <span>{matchedStudent ? 'Continue as ' + matchedStudent.name : 'Sign In & Enter Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
