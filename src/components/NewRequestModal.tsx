import React, { useState, useEffect } from 'react';
import { Student, Teacher, Subject, LeaveReason, CreateRequestInput } from '../types';
import { getSubjectsByClass, getSubjects, formatDate } from '../services/db';
import { X, AlertTriangle, Calendar, BookOpen, User, FileText } from 'lucide-react';

interface FixedClass {
  id: string;
  name: string;
  department: string;
}

// Strictly limited to the 8 fixed institutional classes
const FIXED_CLASSES: FixedClass[] = [
  { id: 'c-qla3', name: 'QLA-3', department: 'Quality Assurance & Leadership' },
  { id: 'c-hfc3', name: 'HFC-3', department: 'Human Factors & Computing' },
  { id: 'c-qh2', name: 'QH-2', department: 'Quantitative Hardware Systems' },
  { id: 'c-fc2', name: 'FC-2', department: 'Foundations of Computing' },
  { id: 'c-al2', name: 'AL-2', department: 'Applied Logic & Software' },
  { id: 'c-qh1', name: 'QH-1', department: 'Quantitative Hardware Principles' },
  { id: 'c-fc1', name: 'FC-1', department: 'Foundations of Computing Intro' },
  { id: 'c-al1', name: 'AL-1', department: 'Applied Logic & Methods' }
];

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  teachers: Teacher[];
  onSubmit: (input: CreateRequestInput) => Promise<void>;
  isLoading?: boolean;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  student,
  teachers,
  onSubmit,
  isLoading = false
}) => {
  // Find initial class matching student
  const initialClass = 
    FIXED_CLASSES.find(c => c.id === student.class_id || c.name === student.class_name) ||
    FIXED_CLASSES[3]; // default FC-2

  const [selectedClass, setSelectedClass] = useState<FixedClass>(initialClass);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [reason, setReason] = useState<LeaveReason>('Medical');
  const [remarks, setRemarks] = useState('');

  // Default dates: last 3 days
  const prevDate = new Date();
  prevDate.setDate(prevDate.getDate() - 3);
  const [startDate, setStartDate] = useState(formatDate(prevDate));
  const [endDate, setEndDate] = useState(formatDate(new Date(Date.now() - 86400000)));

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize class selection when student changes
  useEffect(() => {
    const matching = 
      FIXED_CLASSES.find(c => c.id === student.class_id || c.name === student.class_name) ||
      FIXED_CLASSES[3];
    setSelectedClass(matching);
  }, [student]);

  // Dynamic subjects based on selected class
  const classSubjects = getSubjectsByClass(selectedClass.id);
  const availableSubjects: Subject[] = classSubjects.length > 0 ? classSubjects : getSubjects();

  // Reset or pick initial subjects when class changes
  useEffect(() => {
    if (availableSubjects.length > 0) {
      setSelectedSubjects([availableSubjects[0].name]);
    } else {
      setSelectedSubjects([]);
    }
  }, [selectedClass.id]);

  // Teachers assigned to this class
  const classFaculty = teachers.filter(t => t.assigned_class_ids?.includes(selectedClass.id));
  const otherFaculty = teachers.filter(t => !t.assigned_class_ids?.includes(selectedClass.id));

  // Auto-select designated teacher when class changes
  useEffect(() => {
    if (classFaculty.length > 0) {
      setSelectedTeacherId(classFaculty[0].id);
    } else if (teachers.length > 0) {
      setSelectedTeacherId(teachers[0].id);
    }
  }, [selectedClass.id, teachers]);

  // Auto-calculate day count
  const calculateDayCount = (fromStr: string, toStr: string) => {
    if (!fromStr || !toStr) return 0;
    const f = new Date(fromStr);
    const t = new Date(toStr);
    const diff = t.getTime() - f.getTime();
    if (isNaN(diff) || diff < 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const dayCount = calculateDayCount(startDate, endDate);

  const handleClassChange = (className: string) => {
    const found = FIXED_CLASSES.find(c => c.name === className);
    if (found) {
      setSelectedClass(found);
    }
  };

  const toggleSubject = (name: string) => {
    setSelectedSubjects(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!startDate || !endDate) {
      setErrorMsg('Please specify both From and To leave dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('From date cannot be after To date.');
      return;
    }

    if (!selectedTeacherId) {
      setErrorMsg('Please select an authorizing faculty member.');
      return;
    }

    if (selectedSubjects.length === 0) {
      setErrorMsg('Please select at least one missed subject.');
      return;
    }

    const updatedStudent: Student = {
      ...student,
      class_id: selectedClass.id,
      class_name: selectedClass.name,
      department: selectedClass.department
    };

    await onSubmit({
      student: updatedStudent,
      teacher_id: selectedTeacherId,
      reason,
      reason_other_details: reason === 'Other' ? remarks.trim() : undefined,
      leave_start_date: startDate,
      leave_end_date: endDate,
      subjects_missed: selectedSubjects,
      remarks: remarks.trim() || undefined
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white sm:bg-slate-950/70 sm:backdrop-blur-xs sm:items-center sm:justify-center sm:p-4 overflow-hidden animate-in fade-in duration-150">
      <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden sm:border border-slate-200">
        {/* Header: Fixed top */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
                Leave Application Form
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                {student.name} · {selectedClass.name}
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            title="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact & Responsive Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Row 1: Name & Class */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  1. Student Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={student.name}
                  className="w-full h-11 sm:h-9 px-3 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  2. Class
                </label>
                <select
                  value={selectedClass.name}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full h-11 sm:h-9 px-3 text-base sm:text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                >
                  {FIXED_CLASSES.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name} — {cls.department}</option>
                  ))}
                </select>
              </div>

            {/* Row 2: Department & Authorizing Teacher */}
            <div>
              <label className="block text-xs sm:text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                3. Department
              </label>
              <input
                type="text"
                readOnly
                value={selectedClass.department}
                title={selectedClass.department}
                className="w-full h-10 sm:h-8 px-3 sm:px-2.5 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-lg sm:rounded-md font-medium text-slate-700 truncate focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                7. Authorizing Teacher
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full h-10 sm:h-8 px-3 sm:px-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg sm:rounded-md text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              >
                {classFaculty.length > 0 && (
                  <optgroup label="Assigned Class Faculty">
                    {classFaculty.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                    ))}
                  </optgroup>
                )}
                {otherFaculty.length > 0 && (
                  <optgroup label="All Faculty">
                    {otherFaculty.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Row 3: Leave Dates & Reason */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs sm:text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  4. Leave Dates
                </label>
                <span className="text-xs sm:text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  Days: {dayCount}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 h-10 sm:h-8 px-2 sm:px-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg sm:rounded-md focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                />
                <span className="text-slate-400 text-sm">→</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 h-10 sm:h-8 px-2 sm:px-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg sm:rounded-md focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                5. Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as LeaveReason)}
                className="w-full h-10 sm:h-8 px-3 sm:px-2 text-base sm:text-xs bg-white border border-slate-300 rounded-lg sm:rounded-md text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              >
                <option value="Medical">Medical</option>
                <option value="Official College Work">Official College Work</option>
                <option value="Family Emergency">Family Emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Row 4: Subjects Missed (Full Width - Col Span 2) */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs sm:text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  6. Subjects Missed ({availableSubjects.length} available)
                </label>
                <span className="text-xs sm:text-[10px] font-mono text-slate-500">
                  {selectedSubjects.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 sm:max-h-24 overflow-y-auto p-2 sm:p-1.5 bg-slate-50 rounded-lg sm:rounded-md border border-slate-200">
                {availableSubjects.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub.name);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubject(sub.name)}
                      className={`min-h-[34px] sm:min-h-0 px-2.5 sm:px-2 py-1.5 sm:py-0.5 text-xs rounded-md border transition-all cursor-pointer font-medium active:scale-95 flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 active:bg-slate-100'
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 5: Reason Note / Remarks (Full Width - Col Span 2) */}
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                Reason Note / Remarks
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Specific details, medical notes, or absence remarks..."
                className="w-full min-h-[60px] py-2 px-3 sm:py-1 sm:px-2.5 text-base sm:text-xs bg-white border border-slate-300 rounded-lg sm:rounded-md focus:ring-1 focus:ring-slate-900 focus:outline-hidden resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Footer: Pinned at bottom on phone with full-width thumb actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-12 sm:h-9 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 active:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial h-12 sm:h-9 px-6 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-70"
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />}
              <span>Submit Leave Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
