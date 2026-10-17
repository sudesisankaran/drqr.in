import React from 'react';
import { ShieldCheck, FileText, QrCode, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-slate-300">DRQR System</span>
            <span>&bull;</span>
            <span>Production Medical Record Verification & Archival</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Secure Health Cloud
            </span>
            <span className="flex items-center gap-1.5 text-teal-300">
              <QrCode className="w-3.5 h-3.5" />
              Dynamic QR Ready
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <FileText className="w-3.5 h-3.5" />
              Clinical Records Active
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-900 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} DRQR Healthcare System. All rights reserved. Exclusively for Hospital Registration, Patient Management, QR Verification & Clinical Dossier.</p>
          <p className="text-slate-400">End-to-End Cryptographic Access Control</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
