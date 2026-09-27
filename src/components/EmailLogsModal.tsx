import React, { useState } from 'react';
import { EmailLog } from '../types';
import { Mail, X, CheckCircle, Clock, Search, ArrowLeft, ExternalLink } from 'lucide-react';

interface EmailLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: EmailLog[];
}

export const EmailLogsModal: React.FC<EmailLogsModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter(l => 
    l.recipient.toLowerCase().includes(filterQuery.toLowerCase()) ||
    l.subject.toLowerCase().includes(filterQuery.toLowerCase()) ||
    l.trigger_type.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full h-full sm:h-auto sm:max-w-4xl bg-white rounded-none sm:rounded-xl shadow-2xl border-0 sm:border border-slate-200 flex flex-col max-h-screen sm:max-h-[88vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {selectedLog && (
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="md:hidden p-1.5 text-slate-600 hover:bg-slate-200 rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Notification Dispatch Audit Console
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Official institutional notification & delivery records
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 sm:p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Logs List Pane (hidden on mobile if inspecting an email) */}
          <div className={`w-full md:w-1/2 border-r border-slate-200 flex flex-col min-h-0 ${selectedLog ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by recipient or subject..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-base sm:text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 min-h-[40px] sm:min-h-[34px]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No email events recorded yet.
                </div>
              ) : (
                filteredLogs.map(log => {
                  const isSelected = selectedLog?.id === log.id;
                  return (
                    <button
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`w-full text-left p-3 rounded-lg transition-colors text-xs flex flex-col gap-1 active:bg-slate-100 ${
                        isSelected ? 'bg-indigo-50/80 border border-indigo-200/80' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800 truncate">{log.recipient}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-1 font-medium">{log.subject}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">
                          {log.trigger_type}
                        </span>
                        {log.cc && (
                          <span className="text-slate-400 truncate text-[10px]">CC: {log.cc}</span>
                        )}
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          {log.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Email Preview Pane */}
          <div className={`w-full md:w-1/2 flex flex-col min-h-0 bg-slate-50/30 ${selectedLog ? 'flex' : 'hidden md:flex'}`}>
            {selectedLog ? (
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200">
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div><strong className="text-slate-900">Subject:</strong> {selectedLog.subject}</div>
                    <div><strong className="text-slate-900">To:</strong> {selectedLog.recipient}</div>
                    {selectedLog.cc && <div><strong className="text-slate-900">CC:</strong> {selectedLog.cc}</div>}
                    <div>
                      <strong className="text-slate-900">Trigger:</strong> {selectedLog.trigger_type} · 
                      <strong className="text-slate-900 ml-2">Sent:</strong> {new Date(selectedLog.sent_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Rendered HTML Preview */}
                <div className="p-3 sm:p-4 flex-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Rendered Email Body
                  </div>
                  <div 
                    className="bg-white rounded-lg border border-slate-200 shadow-xs p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm"
                    dangerouslySetInnerHTML={{ __html: selectedLog.body_html }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
                <Mail className="w-8 h-8 text-slate-300 mb-2" />
                Select an email log from the list to preview content.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] sm:text-xs">Live Email Service Active</span>
          </div>
          <button
            onClick={onClose}
            className="h-9 px-4 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
