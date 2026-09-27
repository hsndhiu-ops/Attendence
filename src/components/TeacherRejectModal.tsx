import React, { useState, useEffect } from 'react';
import { ClearanceRequest } from '../types';
import { REJECTION_TEMPLATES } from '../services/templates';
import { X, AlertTriangle, FileText, Send, Eye } from 'lucide-react';

interface TeacherRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ClearanceRequest;
  onConfirmReject: (reason: string, templateType: string, customNote?: string) => Promise<void>;
  isLoading?: boolean;
}

export const TeacherRejectModal: React.FC<TeacherRejectModalProps> = ({
  isOpen,
  onClose,
  request,
  onConfirmReject,
  isLoading = false
}) => {
  // If request is overdue, default to overdue template!
  const defaultTemplateId = request.is_overdue ? 'overdue_rejection' : 'insufficient_documentation';
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplateId);
  const [customNote, setCustomNote] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  useEffect(() => {
    if (request.is_overdue) {
      setSelectedTemplateId('overdue_rejection');
      setCustomReason('Request submitted exceeding statutory 14-day clearance window.');
    } else {
      const template = REJECTION_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (template) setCustomReason(template.defaultReason);
    }
  }, [request]);

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const template = REJECTION_TEMPLATES.find(t => t.id === id);
    if (template) {
      setCustomReason(template.defaultReason);
    }
  };

  const currentTemplate = REJECTION_TEMPLATES.find(t => t.id === selectedTemplateId) || REJECTION_TEMPLATES[0];
  const generatedHtml = currentTemplate.generateBody(request, customNote || customReason);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmReject(customReason || currentTemplate.defaultReason, selectedTemplateId, customNote);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full h-full sm:h-auto sm:max-w-2xl bg-white rounded-none sm:rounded-xl shadow-2xl border-0 sm:border border-slate-200 overflow-y-auto flex flex-col my-auto max-h-screen sm:max-h-[92vh] animate-in fade-in-50 duration-150">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-red-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-red-100 text-red-700 rounded-lg shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                Disapprove Clearance Request
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Student: <span className="font-semibold text-slate-800">{request.student.name}</span> ({request.student.roll_no})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 sm:p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 flex-1 overflow-y-auto">
          {/* Overdue Alert banner if flagged */}
          {request.is_overdue && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
              <div className="font-bold text-red-800 mb-0.5">
                ⚠️ Overdue Request Detected:
              </div>
              <p className="leading-relaxed">
                Leave ended on <strong>{request.leave_end_date}</strong>. The 14-day statutory deadline was <strong>{request.deadline_date}</strong>.
                Actual submission was on <strong>{request.submission_date}</strong>.
              </p>
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Pre-Built Institutional Rejection Template:
            </label>
            <div className="space-y-2">
              {REJECTION_TEMPLATES.map((tmpl) => (
                <label
                  key={tmpl.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors active:bg-slate-100 ${
                    selectedTemplateId === tmpl.id
                      ? 'border-red-400 bg-red-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejection_template"
                    value={tmpl.id}
                    checked={selectedTemplateId === tmpl.id}
                    onChange={() => handleTemplateChange(tmpl.id)}
                    className="mt-0.5 text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-900 block">{tmpl.name}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">{tmpl.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Reason Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Summary Reason (Displayed on portal and email summary):
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3 py-2 text-base sm:text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden min-h-[42px] sm:min-h-[36px]"
              required
            />
          </div>

          {/* Additional Reviewer Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specific Faculty Remarks / Notes for Student:
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Please consult Dr. Sharma with original medical documents on Monday."
              className="w-full px-3 py-2 text-base sm:text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden min-h-[50px]"
            />
          </div>

          {/* Toggle Email Template Preview */}
          <div>
            <button
              type="button"
              onClick={() => setShowHtmlPreview(!showHtmlPreview)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 min-h-[36px]"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showHtmlPreview ? 'Hide Live Email Preview' : 'Preview Student Notification Email'}</span>
            </button>

            {showHtmlPreview && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-56 overflow-y-auto">
                <div 
                  className="bg-white p-3 rounded border text-xs"
                  dangerouslySetInnerHTML={{ __html: generatedHtml }}
                />
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-10 sm:h-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 sm:h-auto px-5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 active:bg-red-900 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              {isLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              )}
              <span>Dispatch Rejection & Notify</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
