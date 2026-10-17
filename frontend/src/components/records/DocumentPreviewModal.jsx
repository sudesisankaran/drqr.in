import React from 'react';
import { X, ExternalLink, FileText, Calendar, Building2, Tag, ShieldCheck } from 'lucide-react';
import { medicalDocumentService } from '../../services/medicalDocumentService';

const DocumentPreviewModal = ({ isOpen, onClose, document: doc }) => {
  if (!isOpen || !doc) return null;

  const viewUrl = medicalDocumentService.getDocumentViewUrl(doc.id);
  const isImage = doc.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(doc.original_filename || '');
  const isPdf = doc.mime_type === 'application/pdf' || /\.pdf$/i.test(doc.original_filename || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl glass-panel shadow-2xl border border-slate-700/80 bg-slate-900/95 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">{doc.title}</h3>
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  {doc.category || 'Record'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                {doc.hospital_name && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                    {doc.hospital_name}
                  </span>
                )}
                {doc.record_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {doc.record_date}
                  </span>
                )}
                <span className="font-mono text-[11px] text-slate-400 truncate max-w-xs">
                  {doc.original_filename}
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons (Download off - View only) */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              In-Website View Only
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview Frame */}
        <div className="flex-1 p-3 sm:p-4 bg-slate-950/70 overflow-auto flex items-center justify-center">
          {isPdf ? (
            <iframe
              src={`${viewUrl}#toolbar=0&navpanes=0`}
              title={doc.title}
              className="w-full h-full rounded-xl border border-slate-800 bg-slate-900"
            />
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center p-2">
              <img
                src={viewUrl}
                alt={doc.title}
                className="max-h-full max-w-full object-contain rounded-xl shadow-lg border border-slate-800"
              />
            </div>
          ) : (
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-semibold text-white">{doc.original_filename}</h4>
              <p className="text-xs text-slate-300 mt-2">
                This document is secured under medical privacy regulations. Direct file downloading has been disabled. Viewing is restricted to authorized in-website inspection.
              </p>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Protected Medical Health Record</span>
          <span className="font-mono text-teal-400">File Download Disabled &bull; In-Website Inspection</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
