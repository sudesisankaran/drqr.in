import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  FileText,
  Eye,
  LogIn,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  Lock
} from 'lucide-react';
import { qrService } from '../services/qrService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SecureInAppPDFViewerModal from '../components/pdf/SecureInAppPDFViewerModal';

const PublicVerifyPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  useEffect(() => {
    const fetchVerification = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await qrService.verifyRecord(id);
        setData(res.data);
      } catch (err) {
        console.error('Verification error:', err);
        setError('This QR code is invalid, expired, or the medical record was removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchVerification();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying cryptographic digital record signature..." />;
  }

  if (error || !data) {
    return (
      <div className="py-20 max-w-md mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Record Not Found</h1>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          {error || 'This medical record verification link is invalid or has expired.'}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all"
          >
            Return to Healthcare Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-slate-900/90 shadow-2xl space-y-6">
        {/* Verification Status Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/10">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Verified Medical Record
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            {data.hospital_name}
          </h1>

          <p className="text-xs text-slate-400 font-mono">
            Record ID: {data.record_id} &bull; Registration: {data.registration_number || 'Official'}
          </p>
        </div>

        {/* Record Summary Card */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">Attending Doctor</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-400" />
              {data.doctor_in_charge}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">Specialization</span>
            <span className="font-semibold text-white">{data.specialization}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">Hospital Type</span>
            <span className="font-semibold text-teal-300">{data.hospital_type}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">Location</span>
            <span className="font-semibold text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {data.city}, {data.state}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">Contact Number</span>
            <span className="font-semibold text-white flex items-center gap-1 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {data.contact_number}
            </span>
          </div>

          {data.visit_date && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Visit Date</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {data.visit_date}
              </span>
            </div>
          )}
        </div>

        {/* Ownership Verification */}
        {data.is_owner ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Authorized Viewer Access Granted
            </div>
            <p className="text-slate-300">
              Record Owner: <strong className="text-white">{data.patient_name}</strong> ({data.patient_email})
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setPdfViewerOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-600/30 transition-all"
              >
                <Eye className="w-4 h-4" />
                View Official Certificate PDF Inside Website
              </button>
              <Link
                to={`/records/${data.record_id}`}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
              >
                Open Full Record
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Are you the patient or authorized healthcare provider?</span>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shrink-0 shadow transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In to View
            </Link>
          </div>
        )}

        <div className="pt-2 text-center text-[11px] text-slate-400">
          Cryptographically timestamped on {new Date(data.created_at).toLocaleDateString()} &bull; MediQR Verification Registry
        </div>
      </div>

      {/* Modal: View PDF Inside Website */}
      {pdfViewerOpen && (
        <SecureInAppPDFViewerModal
          isOpen={pdfViewerOpen}
          onClose={() => setPdfViewerOpen(false)}
          pdfEndpoint={`/records/${data.record_id}/pdf/?download=0`}
          title={`Official Certificate — ${data.hospital_name}`}
          patientRefId={data.registration_number || data.record_id}
        />
      )}
    </div>
  );
};

export default PublicVerifyPage;
