import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, Loader2, ExternalLink } from 'lucide-react';
import { pdfService } from '../../services/pdfService';

const PDFViewerModal = ({ isOpen, onClose, recordId, hospitalName }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (isOpen && recordId) {
      setLoading(true);
      setError(null);
      pdfService
        .getPdfBlobUrl(recordId)
        .then((url) => {
          if (active) {
            setBlobUrl(url);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (active) {
            console.error('Failed to load PDF blob:', err);
            setError('Could not load PDF document. Please try again.');
            setLoading(false);
          }
        });
    }

    return () => {
      active = false;
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, recordId]);

  if (!isOpen) return null;

  const handleDownload = () => {
    pdfService.downloadPdf(recordId, `${hospitalName || 'Hospital_Record'}.pdf`);
  };

  const handlePrint = () => {
    if (blobUrl) {
      const iframe = document.getElementById('pdf-preview-frame');
      iframe?.contentWindow?.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl h-[92vh] flex flex-col rounded-2xl glass-panel shadow-2xl border border-slate-700/80 bg-slate-900 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Official Healthcare Document
                <span className="text-xs font-normal text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/40">
                  In-Website Clinical View
                </span>
              </h3>
              <p className="text-xs text-slate-400">{hospitalName || 'Hospital Record'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading || !!error}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-slate-950 relative flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
              <p className="text-sm font-medium animate-pulse">Rendering official PDF certificate...</p>
            </div>
          )}

          {error && (
            <div className="text-center p-6 text-rose-400 max-w-md">
              <p className="font-semibold text-base mb-2">{error}</p>
              <button
                onClick={handleDownload}
                className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl"
              >
                Try Direct Download Instead
              </button>
            </div>
          )}

          {blobUrl && !loading && (
            <iframe
              id="pdf-preview-frame"
              src={blobUrl}
              title="Official Medical Record PDF Preview"
              className="w-full h-full border-none rounded-b-2xl bg-slate-900"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewerModal;
