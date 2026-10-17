import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Loader2,
  Lock,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import api from '../../services/api';
import SecurityShield from '../common/SecurityShield';

/**
 * SecureInAppPDFViewerModal
 * Fulfills: "pdf not download opection , website inside view", right-click off, no screenshot
 * Renders the ReportLab clinical summary PDF inside the browser within a secure container
 * with toolbar controls for viewing, without download or print capabilities.
 */
const SecureInAppPDFViewerModal = ({
  isOpen,
  onClose,
  pdfEndpoint,
  title = 'Official Clinical Summary',
  patientRefId = ''
}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    let activeUrl = null;
    const loadPdfBlob = async () => {
      if (!isOpen || !pdfEndpoint) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(pdfEndpoint, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        activeUrl = window.URL.createObjectURL(blob);
        setBlobUrl(activeUrl);
      } catch (err) {
        console.error('Failed to load in-app PDF stream:', err);
        setError('Could not load secure clinical document stream.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadPdfBlob();
    }

    return () => {
      if (activeUrl) {
        window.URL.revokeObjectURL(activeUrl);
      }
      setBlobUrl(null);
      setZoom(100);
    };
  }, [isOpen, pdfEndpoint]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <SecurityShield watermarkText={`MEDICAL RECORD • VIEW ONLY • NOT FOR DOWNLOAD • REF: ${patientRefId}`}>
        <div className="w-[96vw] max-w-5xl h-[92vh] flex flex-col rounded-2xl glass-panel shadow-2xl border border-slate-700/80 bg-slate-900/95 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {title}
                  </h3>
                  {patientRefId && (
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                      {patientRefId}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Website Inside View Only • File Download Disabled for Privacy
                </p>
              </div>
            </div>

            {/* Viewer Controls (Zoom In, Zoom Out, Reset, Close) */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(prev - 15, 60))}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono">{zoom}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(prev + 15, 160))}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(100)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Viewer */}
          <div className="flex-1 overflow-auto bg-slate-950/90 relative flex items-center justify-center p-2 sm:p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
                <span className="text-xs">Streaming verified clinical summary inside website...</span>
              </div>
            ) : error ? (
              <div className="max-w-md p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                <Lock className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Access Restricted</p>
                <p className="mt-1 text-xs text-rose-300">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Dismiss
                </button>
              </div>
            ) : blobUrl ? (
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-150 origin-top"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              >
                {/* Embedded in-website viewer without browser download toolbar */}
                <iframe
                  src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                  title="Clinical Health Summary"
                  className="w-full h-full rounded-xl border border-slate-800 bg-white shadow-2xl"
                  style={{ minHeight: '75vh' }}
                />
              </div>
            ) : null}
          </div>

          {/* Footer Security Notice */}
          <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              Protected in-browser view. File download and print options are disabled.
            </span>
            <span className="font-mono text-slate-400">
              DRQR Clinical Verification Engine
            </span>
          </div>
        </div>
      </SecurityShield>
    </div>
  );
};

export default SecureInAppPDFViewerModal;
