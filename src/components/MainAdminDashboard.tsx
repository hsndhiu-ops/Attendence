import React, { useState } from 'react';
import { 
  ClearanceRequest, 
  Teacher, 
  ClassEntity, 
  Subject 
} from '../types';
import { AdminDashboard } from './AdminDashboard';
import { 
  Shield, 
  Sliders, 
  Users, 
  FileCheck2, 
  Settings, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Trash2, 
  Mail, 
  Lock,
  Building2,
  RefreshCw
} from 'lucide-react';

interface OfficeAdminAccount {
  id: string;
  name: string;
  email: string;
  department: string;
  active: boolean;
  created_at: string;
}

const INITIAL_OFFICE_ADMINS: OfficeAdminAccount[] = [
  {
    id: 'oa-1',
    name: 'Office Registrar',
    email: 'registrar@college.edu',
    department: 'Chief Attendance Officer',
    active: true,
    created_at: '2026-01-10T09:00:00Z'
  },
  {
    id: 'oa-2',
    name: 'Sarah Connor',
    email: 's.connor@college.edu',
    department: 'Academic Records Specialist',
    active: true,
    created_at: '2026-03-15T11:30:00Z'
  }
];

interface MainAdminDashboardProps {
  requests: ClearanceRequest[];
  teachers: Teacher[];
  classes: ClassEntity[];
  subjects: Subject[];
  onVerifyRequest: (reqId: string, adminNotes?: string) => Promise<void>;
  onRejectRequest: (reqId: string, reason: string, templateType: string, customNote?: string) => Promise<void>;
  onApproveRequest: (reqId: string) => Promise<void>;
  onSendTeacherReminder: (req: ClearanceRequest) => Promise<void>;
  onAddTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  onDeleteTeacher: (id: string) => void;
  onAddClass: (cls: Omit<ClassEntity, 'id'>) => void;
  onDeleteClass: (id: string) => void;
  onAddSubject: (subj: Omit<Subject, 'id'>) => void;
  onDeleteSubject: (id: string) => void;
  onOpenEmailLogs: () => void;
}

export const MainAdminDashboard: React.FC<MainAdminDashboardProps> = (props) => {
  const [activeMainTab, setActiveMainTab] = useState<'clearance' | 'admins' | 'settings'>('clearance');

  // Office Admin management state
  const [officeAdmins, setOfficeAdmins] = useState<OfficeAdminAccount[]>(() => {
    const saved = localStorage.getItem('acs_office_admins');
    return saved ? JSON.parse(saved) : INITIAL_OFFICE_ADMINS;
  });

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminDept, setNewAdminDept] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Global Settings state
  const [enforce14Days, setEnforce14Days] = useState(true);
  const [autoSmtpDispatch, setAutoSmtpDispatch] = useState(true);
  const [emergencyFreeze, setEmergencyFreeze] = useState(false);
  const [termLabel, setTermLabel] = useState('Fall 2026 - Academic Session 1');
  const [settingsNotice, setSettingsNotice] = useState('');

  const handleToggleAdminStatus = (id: string) => {
    const updated = officeAdmins.map(a => a.id === id ? { ...a, active: !a.active } : a);
    setOfficeAdmins(updated);
    localStorage.setItem('acs_office_admins', JSON.stringify(updated));
  };

  const handleDeleteAdmin = (id: string) => {
    if (confirm('Are you sure you want to remove this Office Admin account?')) {
      const updated = officeAdmins.filter(a => a.id !== id);
      setOfficeAdmins(updated);
      localStorage.setItem('acs_office_admins', JSON.stringify(updated));
    }
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;

    const newAccount: OfficeAdminAccount = {
      id: `oa-${Date.now()}`,
      name: newAdminName.trim(),
      email: newAdminEmail.trim().toLowerCase(),
      department: newAdminDept.trim() || 'Office Administration',
      active: true,
      created_at: new Date().toISOString()
    };

    const updated = [...officeAdmins, newAccount];
    setOfficeAdmins(updated);
    localStorage.setItem('acs_office_admins', JSON.stringify(updated));
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminDept('');
    setIsAddingAdmin(false);
  };

  const handleExportAuditJson = () => {
    const data = {
      exported_at: new Date().toISOString(),
      system_role: 'Main Admin / Site Controller',
      requests_count: props.requests.length,
      teachers_count: props.teachers.length,
      classes_count: props.classes.length,
      requests: props.requests,
      settings: {
        enforce_14_days: enforce14Days,
        auto_smtp: autoSmtpDispatch,
        emergency_freeze: emergencyFreeze,
        term: termLabel
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_clearance_audit_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsNotice('System settings saved successfully.');
    setTimeout(() => setSettingsNotice(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Master Controller Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Shield className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Main Admin Controller Hub
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                  Site Owner Access
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Master governance console: Clearance Operations, Office Admin staff, and System Policies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportAuditJson}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Download Full Database Audit Export"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Audit JSON</span>
            </button>
            <button
              onClick={props.onOpenEmailLogs}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>SMTP Audit Log</span>
            </button>
          </div>
        </div>

        {/* Global Telemetry Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">System Status:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Optimal
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Active Requests:</span>
            <span className="font-semibold text-white font-mono">{props.requests.length}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Office Admins:</span>
            <span className="font-semibold text-amber-300 font-mono">{officeAdmins.filter(a => a.active).length}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">14-Day Limit:</span>
            <span className="font-semibold text-slate-200">{enforce14Days ? 'Active' : 'Off'}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Admin Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-2xs gap-1">
        <button
          onClick={() => setActiveMainTab('clearance')}
          className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeMainTab === 'clearance'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Clearance Operations & SHUHOOD</span>
        </button>

        <button
          onClick={() => setActiveMainTab('admins')}
          className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeMainTab === 'admins'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manage Office Admins ({officeAdmins.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('settings')}
          className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeMainTab === 'settings'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Site Settings & Governance</span>
        </button>
      </div>

      {/* TAB 1: CLEARANCE OPERATIONS (FULL OFFICE ADMIN VIEW) */}
      {activeMainTab === 'clearance' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Main Admin Override Mode:</strong> You have full visibility and supreme clearance sanctioning power across all faculty members and classes.
              </span>
            </div>
          </div>
          <AdminDashboard {...props} />
        </div>
      )}

      {/* TAB 2: OFFICE ADMIN ACCOUNT MANAGEMENT */}
      {activeMainTab === 'admins' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Office Admin Accounts</h3>
              <p className="text-xs text-slate-500">
                Grant or revoke institutional attendance clearance privileges for Registrar office personnel
              </p>
            </div>

            <button
              onClick={() => setIsAddingAdmin(!isAddingAdmin)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingAdmin ? 'Cancel' : 'New Office Admin'}</span>
            </button>
          </div>

          {/* Add Admin Form */}
          {isAddingAdmin && (
            <form onSubmit={handleCreateAdmin} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Register Office Administrator
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="jdoe@college.edu"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Attendance Officer"
                    value={newAdminDept}
                    onChange={(e) => setNewAdminDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Office Admin</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Office Admins */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {officeAdmins.map((admin) => (
              <div key={admin.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-200">
                    <Building2 className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{admin.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        admin.active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {admin.active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span className="font-mono text-slate-600">{admin.email}</span> · <span>{admin.department}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleAdminStatus(admin.id)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {admin.active ? 'Suspend Access' : 'Activate Access'}
                  </button>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GLOBAL SYSTEM SETTINGS & GOVERNANCE */}
      {activeMainTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Global System Settings</h3>
            <p className="text-xs text-slate-500">
              Institutional policy enforcement, communication protocols, and clearance limits
            </p>
          </div>

          {settingsNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{settingsNotice}</span>
            </div>
          )}

          <div className="space-y-4 divide-y divide-slate-100">
            {/* Setting 1: 14-day rule */}
            <div className="flex items-start justify-between gap-4 pt-3">
              <div>
                <label className="text-sm font-semibold text-slate-900 block">
                  14-Day Leave Filing Policy Enforcement
                </label>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  Automatically flags clearance applications filed more than 14 days after the leave end date as "Overdue" and triggers special audit notices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnforce14Days(!enforce14Days)}
                className="shrink-0 text-slate-700"
              >
                {enforce14Days ? (
                  <ToggleRight className="w-9 h-9 text-emerald-600 cursor-pointer" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-400 cursor-pointer" />
                )}
              </button>
            </div>

            {/* Setting 2: Automated SMTP Dispatch */}
            <div className="flex items-start justify-between gap-4 pt-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 block">
                  Automated Nodemailer / Gmail SMTP Dispatch
                </label>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  When enabled, fires asynchronous Gmail SMTP notifications on application submission, teacher approval, and clearance slips.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoSmtpDispatch(!autoSmtpDispatch)}
                className="shrink-0 text-slate-700"
              >
                {autoSmtpDispatch ? (
                  <ToggleRight className="w-9 h-9 text-emerald-600 cursor-pointer" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-400 cursor-pointer" />
                )}
              </button>
            </div>

            {/* Setting 3: Emergency Freeze */}
            <div className="flex items-start justify-between gap-4 pt-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 block">
                  Emergency Clearance Submission Freeze
                </label>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  Locks the student submission portal during exams, audits, or semester transitions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmergencyFreeze(!emergencyFreeze)}
                className="shrink-0 text-slate-700"
              >
                {emergencyFreeze ? (
                  <ToggleRight className="w-9 h-9 text-rose-600 cursor-pointer" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-400 cursor-pointer" />
                )}
              </button>
            </div>

            {/* Setting 4: Term Identifier */}
            <div className="pt-4 space-y-2">
              <label className="text-sm font-semibold text-slate-900 block">
                Active Academic Term Identifier
              </label>
              <input
                type="text"
                value={termLabel}
                onChange={(e) => setTermLabel(e.target.value)}
                className="w-full max-w-md px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
            >
              Save Configuration
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
