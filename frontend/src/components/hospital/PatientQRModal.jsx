import React, { useState } from 'react';
import { X, QrCode, Download, Printer, ShieldCheck, Copy, Check, ExternalLink } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { hospitalPatientService } from '../../services/hospitalPatientService';
import { getPatientScanUrl } from '../../utils/qrHelper';

const PatientQRModal = ({ isOpen, onClose, patient }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !patient) return null;

  const publicUuid = patient.public_uuid || patient.qr_identity?.public_uuid;
  const qrTargetUrl = getPatientScanUrl(publicUuid, patient.target_url || patient.qr_identity?.target_url);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrTargetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const canvas = document.getElementById('hospital-patient-qr-canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `Permanent_QR_${patient.patient_reference_id}.png`;
      a.click();
      return;
    }
    setDownloading(true);
    try {
      const filename = `Permanent_QR_${patient.patient_reference_id}.png`;
      await hospitalPatientService.downloadPatientQRImage(patient.patient_id || patient.id, filename);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const canvas = document.getElementById('hospital-patient-qr-canvas');
    const qrDataUrl = canvas ? canvas.toDataURL('image/png') : `/api/qr/${publicUuid}/image/?download=1`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Permanent Patient QR - ${patient.patient_reference_id}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; background: white; color: black; }
            .card { border: 2px solid #0F766E; padding: 24px; border-radius: 16px; max-width: 360px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            h2 { color: #0F766E; margin-bottom: 4px; font-size: 20px; }
            .ref { font-family: monospace; font-size: 16px; font-weight: bold; background: #f0fdfa; padding: 4px 8px; border-radius: 6px; }
            .sub { font-size: 11px; color: #64748b; margin-top: 6px; }
            img { width: 220px; height: 220px; margin: 16px 0; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="card">
            <h2>MediQR Health Network</h2>
            <div class="sub">Official Permanent Patient QR Identity</div>
            <div style="margin: 12px 0;"><strong>${patient.full_name || patient.effective_full_name}</strong></div>
            <img src="${qrDataUrl}" alt="Permanent Patient QR" />
            <div>Patient ID: <span class="ref">${patient.patient_reference_id}</span></div>
            <div class="sub" style="margin-top: 12px;">Valid across all authorized healthcare providers</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl glass-panel p-6 shadow-2xl border border-slate-700/80 bg-slate-900/95 text-center space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-teal-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Permanent QR Identity</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-white">{patient.full_name || patient.effective_full_name}</h3>
          <p className="text-xs font-mono text-teal-300 font-semibold mt-0.5">
            ID: {patient.patient_reference_id}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            One Patient = One QR Identity across all hospital networks
          </p>
        </div>

        {/* QR Code Card */}
        <div className="p-3 bg-white rounded-2xl shadow-xl shadow-teal-500/10 inline-block mx-auto border border-teal-100 flex items-center justify-center">
          <QRCodeCanvas
            id="hospital-patient-qr-canvas"
            value={qrTargetUrl}
            size={192}
            level="H"
            marginSize={1}
            fgColor="#0F766E"
            bgColor="#FFFFFF"
          />
        </div>

        {/* Target URL with Copy Button */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2 text-left">
          <div className="min-w-0">
            <span className="block text-[10px] text-slate-500">Public QR Verification URL</span>
            <span className="block text-[11px] text-slate-300 font-mono truncate">{qrTargetUrl}</span>
          </div>
          <button
            onClick={handleCopyUrl}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 shrink-0"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/25 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Download PNG
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" /> Print QR Badge
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-xs font-medium text-slate-400 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PatientQRModal;
