import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, Loader2 } from 'lucide-react';
import { pdfService } from '../services/pdfService';
import { recordService } from '../services/recordService';
import AlertMessage from '../components/common/AlertMessage';

const PDFPreviewPage = () => {
  const { id } = useParams();
  const [blobUrl, setBlobUrl] = useState(null);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [rec, url] = await Promise.all([
          recordService.getRecord(id),
          pdfService.getPdfBlobUrl(id),
        ]);
        if (active) {
          setRecord(rec);
          setBlobUrl(url);
        }
      } catch (err) {
        if (active) {
          console.error('PDF error', err);
          setError('Failed to load official PDF certificate. Please check authorization.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
      if (blobUrl) window.URL.revokeObjectURL(blobUrl);
    };
  }, [id]);

  const handleDownload = () => {
    if (!record) return;
    pdfService.downloadPdf(id, `${record.hospital_name.replace(/\s+/g, '_')}_Record.pdf`);
  };

  const handlePrint = () => {
    const iframe = document.getElementById('full-pdf-frame');
    iframe?.contentWindow?.print();
  };

  return (
    <div className="py-6 max-w-6xl mx-auto px-4 h-[calc(100vh-80px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to={`/records/${id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Record
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            disabled={loading || !!error}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            Print Document
          </button>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError(null)} />

      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 overflow-hidden relative flex items-center justify-center bg-slate-950">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            <p className="text-sm font-medium animate-pulse">Streaming official medical certificate...</p>
          </div>
        )}

        {blobUrl && !loading && (
          <iframe
            id="full-pdf-frame"
            src={blobUrl}
            title="Official Medical Record PDF Preview"
            className="w-full h-full border-none bg-slate-900"
          />
        )}
      </div>
    </div>
  );
};

export default PDFPreviewPage;
