import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ClearanceRequest, Student, ClassEntity, Teacher } from '../types';
import { 
  Download, 
  X, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Calendar,
  Users
} from 'lucide-react';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: ClearanceRequest[];
  students: Student[];
  classes: ClassEntity[];
  teachers: Teacher[];
  currentFilters: {
    classId: string;
    teacherId: string;
    status: string;
    applicationDate: string;
    searchQuery: string;
  };
  onSuccessToast?: (title: string, desc: string) => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  requests,
  students,
  classes,
  teachers,
  currentFilters,
  onSuccessToast
}) => {
  const [exportScope, setExportScope] = useState<'requests' | 'students' | 'both'>('requests');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');
  const [filterMode, setFilterMode] = useState<'filtered' | 'date_range' | 'all'>('filtered');
  
  // Custom Date Range state (based on application/submission date)
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Preset Date range helpers
  const setPresetRange = (preset: 'this_month' | 'last_30_days' | 'semester' | 'clear') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'clear') {
      setFromDate('');
      setToDate('');
      return;
    }

    if (preset === 'this_month') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      setFromDate(`${year}-${month}-01`);
      setToDate(todayStr);
    } else if (preset === 'last_30_days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (preset === 'semester') {
      const past = new Date(today);
      past.setDate(past.getDate() - 90);
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(todayStr);
    }
  };

  // Helper to get application submission date in YYYY-MM-DD
  const getRequestAppDate = (r: ClearanceRequest): string => {
    if (r.submission_date) return r.submission_date;
    if (r.created_at) return r.created_at.split('T')[0];
    return '';
  };

  // Filter requests according to selected filter mode
  const getFilteredRequests = (): ClearanceRequest[] => {
    if (filterMode === 'all') {
      return requests;
    }

    if (filterMode === 'date_range') {
      return requests.filter(r => {
        const appDate = getRequestAppDate(r);
        if (fromDate && appDate && appDate < fromDate) return false;
        if (toDate && appDate && appDate > toDate) return false;
        return true;
      });
    }

    // Default: 'filtered' (Current dashboard filter view)
    return requests.filter(r => {
      if (currentFilters.classId !== 'all' && r.student.class_id !== currentFilters.classId) return false;
      if (currentFilters.teacherId !== 'all' && r.teacher_id !== currentFilters.teacherId) return false;
      if (currentFilters.status !== 'all' && r.status !== currentFilters.status) return false;
      if (currentFilters.applicationDate && r.submission_date !== currentFilters.applicationDate) return false;
      if (currentFilters.searchQuery) {
        const q = currentFilters.searchQuery.toLowerCase();
        const match = 
          r.student.name.toLowerCase().includes(q) ||
          r.student.roll_no.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q) ||
          r.assigned_teacher_name.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  };

  // Filter students according to selected filter mode
  const getFilteredStudents = (): Student[] => {
    if (filterMode === 'all') {
      return students;
    }

    if (filterMode === 'date_range') {
      // If date range is specified, return all students (their counts will reflect the date range)
      return students;
    }

    // Default: 'filtered' (Current dashboard filter view)
    return students.filter(s => {
      if (currentFilters.classId !== 'all' && s.class_id !== currentFilters.classId) return false;
      if (currentFilters.searchQuery) {
        const q = currentFilters.searchQuery.toLowerCase();
        const match = 
          s.name.toLowerCase().includes(q) ||
          s.roll_no.toLowerCase().includes(q) ||
          (s.gmail && s.gmail.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  };

  const targetRequests = getFilteredRequests();
  const targetStudents = getFilteredStudents();

  // Helper to format human-readable status
  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Faculty Review';
      case 'approved': return 'Approved by Faculty (Pending Office Admin)';
      case 'verified': return 'Verified & Cleared in SHUHOOD';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  // Calculate calendar days
  const calculateDays = (startStr: string, endStr: string): number => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const diff = Math.abs(e.getTime() - s.getTime());
      return isNaN(diff) ? 1 : Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    } catch {
      return 1;
    }
  };

  // Transform requests into clean, formatted rows for export
  const buildRequestRows = (reqs: ClearanceRequest[]) => {
    return reqs.map(r => {
      const days = calculateDays(r.leave_start_date, r.leave_end_date);
      const subjects = r.subjects_missed && r.subjects_missed.length > 0 
        ? r.subjects_missed.join('; ') 
        : 'None specified';
      
      const reasonFull = r.reason_other_details 
        ? `${r.reason} (${r.reason_other_details})` 
        : r.reason;

      return {
        'Student Name': r.student.name,
        'Admission No': r.student.roll_no,
        'Class': r.student.class_name,
        'Reason': reasonFull,
        'Leave Start Date': r.leave_start_date,
        'Leave End Date': r.leave_end_date,
        'Days': days,
        'Subjects/Periods Missed': subjects,
        'Assigned Teacher': r.assigned_teacher_name,
        'Status': formatStatus(r.status),
        'Overdue (Yes/No)': r.is_overdue ? 'Yes' : 'No',
        'Submitted Date': r.submission_date,
        'Approved Date': r.approved_at ? r.approved_at.split('T')[0] : '—',
        'Verified Date': r.verified_at ? r.verified_at.split('T')[0] : '—',
        'Remarks': r.remarks || r.admin_notes || '—'
      };
    });
  };

  // Transform students into clean, formatted rows for export
  const buildStudentRows = (studs: Student[]) => {
    return studs.map(s => {
      // If filtered or date_range, count requests from targetRequests
      const reqPool = filterMode === 'all' ? requests : targetRequests;
      const studentReqs = reqPool.filter(
        r => r.student_id === s.id || r.student.roll_no?.toUpperCase() === s.roll_no?.toUpperCase()
      );
      const pendingCount = studentReqs.filter(r => r.status === 'pending').length;
      const approvedCount = studentReqs.filter(r => r.status === 'approved').length;
      const verifiedCount = studentReqs.filter(r => r.status === 'verified').length;

      return {
        'Admission No': s.roll_no,
        'Full Name': s.name,
        'Class': s.class_name,
        'Gmail': s.gmail || 'Not Registered',
        'Total Requests Filed': studentReqs.length,
        'Pending': pendingCount,
        'Approved': approvedCount,
        'Verified': verifiedCount
      };
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      if (exportFormat === 'xlsx') {
        const wb = XLSX.utils.book_new();

        if (exportScope === 'requests' || exportScope === 'both') {
          const reqRows = buildRequestRows(targetRequests);
          const wsRequests = XLSX.utils.json_to_sheet(reqRows);
          XLSX.utils.book_append_sheet(wb, wsRequests, 'Requests');
        }

        if (exportScope === 'students' || exportScope === 'both') {
          const studentRows = buildStudentRows(targetStudents);
          const wsStudents = XLSX.utils.json_to_sheet(studentRows);
          XLSX.utils.book_append_sheet(wb, wsStudents, 'Students');
        }

        const dateSuffix = filterMode === 'date_range' && (fromDate || toDate)
          ? `${fromDate || 'start'}_to_${toDate || 'today'}`
          : todayStr;

        const filename = exportScope === 'both'
          ? `attendance-records-export-${dateSuffix}.xlsx`
          : exportScope === 'requests'
          ? `attendance-requests-export-${dateSuffix}.xlsx`
          : `students-directory-export-${dateSuffix}.xlsx`;

        XLSX.writeFile(wb, filename);

        if (onSuccessToast) {
          onSuccessToast('Export Completed', `Downloaded ${filename} successfully.`);
        }
      } else {
        // CSV Format
        const dateSuffix = filterMode === 'date_range' && (fromDate || toDate)
          ? `${fromDate || 'start'}_to_${toDate || 'today'}`
          : todayStr;

        if (exportScope === 'requests' || exportScope === 'both') {
          const reqRows = buildRequestRows(targetRequests);
          const wsRequests = XLSX.utils.json_to_sheet(reqRows);
          const csvContent = XLSX.utils.sheet_to_csv(wsRequests);
          downloadCsv(csvContent, `attendance-requests-export-${dateSuffix}.csv`);
        }

        if (exportScope === 'students' || exportScope === 'both') {
          const studentRows = buildStudentRows(targetStudents);
          const wsStudents = XLSX.utils.json_to_sheet(studentRows);
          const csvContent = XLSX.utils.sheet_to_csv(wsStudents);
          if (exportScope === 'both') {
            setTimeout(() => {
              downloadCsv(csvContent, `students-directory-export-${dateSuffix}.csv`);
            }, 300);
          } else {
            downloadCsv(csvContent, `students-directory-export-${dateSuffix}.csv`);
          }
        }

        if (onSuccessToast) {
          const desc = exportScope === 'both'
            ? `Generated 2 CSV files (Requests & Students) for download.`
            : `Downloaded CSV export file successfully.`;
          onSuccessToast('Export Completed', desc);
        }
      }

      onClose();
    } catch (e: any) {
      console.error('Export failed:', e);
      if (onSuccessToast) {
        onSuccessToast('Export Failed', e?.message || 'Error generating export file.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const activeFilterDescriptions: string[] = [];
  if (currentFilters.classId !== 'all') {
    const c = classes.find(cls => cls.id === currentFilters.classId);
    activeFilterDescriptions.push(`Class: ${c ? c.name : currentFilters.classId}`);
  }
  if (currentFilters.teacherId !== 'all') {
    const t = teachers.find(tch => tch.id === currentFilters.teacherId);
    activeFilterDescriptions.push(`Teacher: ${t ? t.name : currentFilters.teacherId}`);
  }
  if (currentFilters.status !== 'all') {
    activeFilterDescriptions.push(`Status: ${formatStatus(currentFilters.status)}`);
  }
  if (currentFilters.applicationDate) {
    activeFilterDescriptions.push(`Date: ${currentFilters.applicationDate}`);
  }
  if (currentFilters.searchQuery) {
    activeFilterDescriptions.push(`Search: "${currentFilters.searchQuery}"`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Download className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Export Institutional Records</h2>
              <p className="text-[11px] text-slate-300">Office Admin Record-Keeping & Archival</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700 overflow-y-auto max-h-[75vh]">
          {/* 1. What to Export */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2 uppercase tracking-wider">
              1. What to Export:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExportScope('requests')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  exportScope === 'requests'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 text-slate-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  {exportScope === 'requests' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <span className="text-xs">Requests</span>
                <span className="text-[10px] text-slate-500 font-normal">All clearance records</span>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('students')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  exportScope === 'students'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 text-slate-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  {exportScope === 'students' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <span className="text-xs">Students</span>
                <span className="text-[10px] text-slate-500 font-normal">Directory & counts</span>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('both')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  exportScope === 'both'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 text-slate-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  {exportScope === 'both' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <span className="text-xs">Both</span>
                <span className="text-[10px] text-slate-500 font-normal">Requests + Directory</span>
              </button>
            </div>
          </div>

          {/* 2. Format Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2 uppercase tracking-wider">
              2. File Format:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label 
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  exportFormat === 'csv'
                    ? 'border-slate-900 bg-slate-900/5 ring-2 ring-slate-900/10'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  className="text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">CSV (.csv)</span>
                  <span className="text-[10px] text-slate-500 block">Universal Excel & Google Sheets format</span>
                </div>
              </label>

              <label 
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  exportFormat === 'xlsx'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/15'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value="xlsx"
                  checked={exportFormat === 'xlsx'}
                  onChange={() => setExportFormat('xlsx')}
                  className="text-emerald-600 focus:ring-emerald-600"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Excel (.xlsx)</span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-semibold">Sheets</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block">Native workbook with multiple tabs</span>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Filter Scope Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2 uppercase tracking-wider">
              3. Data Filter Scope:
            </label>
            <div className="space-y-2">
              {/* Option A: Custom Date Range Picker */}
              <div 
                className={`p-3 rounded-xl border transition-all ${
                  filterMode === 'date_range'
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/15'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="date_range"
                    checked={filterMode === 'date_range'}
                    onChange={() => setFilterMode('date_range')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>Custom Date Range (Application Date)</span>
                      </span>
                      {filterMode === 'date_range' && (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          {targetRequests.length} matching
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Export records submitted within a specific timeframe (independent of dashboard view).
                    </p>
                  </div>
                </label>

                {/* Date Inputs & Quick Presets (Interactive when date_range is selected or on click) */}
                <div 
                  className={`mt-2.5 pt-2.5 border-t border-slate-200/80 space-y-2 ${
                    filterMode !== 'date_range' ? 'opacity-60' : ''
                  }`}
                  onClick={() => {
                    if (filterMode !== 'date_range') setFilterMode('date_range');
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-600 mb-1">
                        From Date (Submitted):
                      </span>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                          setFromDate(e.target.value);
                          if (filterMode !== 'date_range') setFilterMode('date_range');
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-600 mb-1">
                        To Date (Submitted):
                      </span>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                          setToDate(e.target.value);
                          if (filterMode !== 'date_range') setFilterMode('date_range');
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-500">Quick ranges:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterMode('date_range');
                        setPresetRange('this_month');
                      }}
                      className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 transition-colors cursor-pointer"
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterMode('date_range');
                        setPresetRange('last_30_days');
                      }}
                      className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 transition-colors cursor-pointer"
                    >
                      Last 30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterMode('date_range');
                        setPresetRange('semester');
                      }}
                      className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 transition-colors cursor-pointer"
                    >
                      Semester (90d)
                    </button>
                    {(fromDate || toDate) && (
                      <button
                        type="button"
                        onClick={() => setPresetRange('clear')}
                        className="px-1.5 py-0.5 text-[10px] font-medium text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Option B: Current Dashboard Filter View */}
              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  filterMode === 'filtered'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/15'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="filtered"
                  checked={filterMode === 'filtered'}
                  onChange={() => setFilterMode('filtered')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Current Dashboard Filter View</span>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      {targetRequests.length} requests
                    </span>
                  </div>
                  {activeFilterDescriptions.length > 0 ? (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Active Filters: {activeFilterDescriptions.join(' · ')}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-1 italic">
                      No active filters applied (exports current dashboard items)
                    </p>
                  )}
                </div>
              </label>

              {/* Option C: Entire Database */}
              <label 
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  filterMode === 'all'
                    ? 'border-slate-900 bg-slate-900/5 ring-2 ring-slate-900/10'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={filterMode === 'all'}
                  onChange={() => setFilterMode('all')}
                  className="mt-0.5 text-slate-900 focus:ring-slate-900"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Entire Database (All Time)</span>
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      {requests.length} requests · {students.length} students
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Ignores all filters and date bounds; exports all historical records.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Export Summary Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-semibold text-slate-700 block">Export Summary:</span>
            <div className="text-[11px] text-slate-600 flex items-center justify-between">
              <span>Selected Scope:</span>
              <strong className="text-slate-900 capitalize">{exportScope}</strong>
            </div>
            <div className="text-[11px] text-slate-600 flex items-center justify-between">
              <span>File Type:</span>
              <strong className="text-slate-900 uppercase">.{exportFormat}</strong>
            </div>
            <div className="text-[11px] text-slate-600 flex items-center justify-between">
              <span>Filter Mode:</span>
              <span className="text-slate-900 font-medium">
                {filterMode === 'date_range' && (
                  fromDate || toDate 
                    ? `From ${fromDate || 'earliest'} to ${toDate || 'today'}`
                    : 'Custom Range (all dates)'
                )}
                {filterMode === 'filtered' && 'Current Dashboard Filter View'}
                {filterMode === 'all' && 'All Historical Records'}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 flex items-center justify-between pt-0.5 border-t border-slate-200/80">
              <span className="font-semibold text-slate-800">Total Export Rows:</span>
              <span className="font-mono font-bold text-slate-900 text-xs">
                {exportScope === 'requests' && `${targetRequests.length} requests`}
                {exportScope === 'students' && `${targetStudents.length} students`}
                {exportScope === 'both' && `${targetRequests.length} requests & ${targetStudents.length} students`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 font-sans"
          >
            {isExporting ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download Export .{exportFormat.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
