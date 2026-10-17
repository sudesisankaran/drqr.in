import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, QrCode, ShieldCheck, Printer, Download, Copy, Check } from 'lucide-react';
import { qrService } from '../services/qrService';
import { recordService } from '../services/recordService';
import QRCodeCard from '../components/qr/QRCodeCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';

const QRPreviewPage = () => {
  const { id } = useParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQR = async () => {
      setLoading(true);
      try {
        const data = await qrService.getRecordQRData(id);
        setQrData(data);
      } catch (err) {
        console.error('Failed to get QR data:', err);
        setError('Could not retrieve QR code data. Please check authorization.');
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Generating encrypted QR code..." />;
  }

  if (error || !qrData) {
    return (
      <div className="py-20 max-w-md mx-auto px-4 text-center">
        <AlertMessage type="error" message={error || 'QR code not found.'} className="mb-4" />
        <Link to={`/records/${id}`} className="text-xs text-teal-400 hover:underline">
          Return to Record Details
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-xl mx-auto px-4 text-center space-y-6">
      <div className="flex items-center justify-start mb-2">
        <Link
          to={`/records/${id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Record
        </Link>
      </div>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold mb-3">
          <QrCode className="w-3.5 h-3.5 text-teal-400" />
          Dynamic Healthcare QR Code
        </div>
        <h1 className="text-3xl font-extrabold text-white">Record QR Verification Code</h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          This digital QR badge links to the verified healthcare authenticity registry.
        </p>
      </div>

      <QRCodeCard
        targetUrl={qrData.qr_target_url}
        recordTitle={qrData.hospital_name}
        recordSubtitle={`Reg: ${qrData.registration_number}`}
        recordId={qrData.record_id}
        size={260}
        showActions={true}
      />

      <div className="glass-panel p-4 rounded-xl text-xs text-slate-400 text-left space-y-1.5 border border-slate-800">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Privacy & Security Guarantee
        </div>
        <p className="leading-relaxed">
          Anyone scanning this QR code with their mobile device camera will access the official hospital verification badge confirming doctor credentials and license authenticity. Personal patient medical data remains encrypted and hidden from unauthorized scanners.
        </p>
      </div>
    </div>
  );
};

export default QRPreviewPage;
