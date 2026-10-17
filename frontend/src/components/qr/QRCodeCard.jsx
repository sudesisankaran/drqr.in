import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, Check, Printer, ExternalLink, ShieldCheck } from 'lucide-react';

const QRCodeCard = ({
  targetUrl,
  recordTitle,
  recordSubtitle,
  recordId,
  size = 220,
  showActions = true
}) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `MediQR_${recordTitle?.replace(/\s+/g, '_') || 'Record'}_${recordId ? String(recordId).substring(0, 8) : 'QR'}.png`;
    link.href = url;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center max-w-sm mx-auto border border-teal-500/20 bg-slate-900/90 shadow-xl">
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-semibold mb-4">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
        Verified Healthcare QR
      </div>

      {/* QR Canvas Box */}
      <div
        ref={qrRef}
        className="p-4 bg-white rounded-2xl shadow-inner border-2 border-slate-700/50 flex items-center justify-center transition-transform hover:scale-[1.02]"
      >
        <QRCodeCanvas
          value={targetUrl || window.location.href}
          size={size}
          level="H"
          marginSize={2}
          fgColor="#0F766E"
          bgColor="#FFFFFF"
        />
      </div>

      {/* Information Labels */}
      <div className="mt-4 w-full">
        <h4 className="text-base font-bold text-white truncate" title={recordTitle}>
          {recordTitle || 'Hospital Healthcare Record'}
        </h4>
        {recordSubtitle && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{recordSubtitle}</p>
        )}
        <div className="mt-2 text-[11px] font-mono text-teal-400/90 bg-slate-950/60 py-1 px-2.5 rounded-lg border border-slate-800 break-all select-all">
          {targetUrl}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-5 w-full grid grid-cols-3 gap-2 text-xs font-medium">
          <button
            onClick={handleCopy}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Copy verification link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-teal-400" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Download QR code image"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Download</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Print QR Certificate"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>Print</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodeCard;
