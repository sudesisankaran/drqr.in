import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  FileText,
  QrCode,
  Edit,
  Trash2,
  Download,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { recordService } from '../services/recordService';
import { pdfService } from '../services/pdfService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import ConfirmModal from '../components/common/ConfirmModal';
import QRCodeCard from '../components/qr/QRCodeCard';
import PDFViewerModal from '../components/pdf/PDFViewerModal';

const ViewRecordPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const data = await recordService.getRecord(id);
        setRecord(data);
      } catch (err) {
        console.error('Error fetching record:', err);
        setError('Could not retrieve record. You may not have authorization to view this medical document.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await recordService.deleteRecord(id);
      navigate(user?.role === 'hospital' ? '/hospital/dashboard' : '/patient/dashboard');
    } catch (err) {
      console.error('Failed to delete record:', err);
      setError('Could not delete record.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!record) return;
    pdfService.downloadPdf(record.id, `${record.hospital_name.replace(/\s+/g, '_')}_Record.pdf`);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying record authorization and decrypting metadata..." />;
  }

  if (error || !record) {
    return (
      <div className="py-20 max-w-lg mx-auto px-4 text-center">
        <AlertMessage type="error" message={error || 'Record not found.'} className="mb-6" />
        <Link
          to={user?.role === 'hospital' ? '/hospital/dashboard' : '/patient/dashboard'}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const verificationUrl = `${window.location.origin}/verify/${record.id}`;

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={user?.role === 'hospital' ? '/hospital/dashboard' : '/patient/dashboard'}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/records/${record.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Edit className="w-4 h-4 text-amber-400" />
            Edit Record
          </Link>

          <button
            onClick={() => setPdfModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/25 transition-all"
          >
            <Eye className="w-4 h-4" />
            View PDF Inside Website
          </button>

          {user?.role === 'patient' && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs font-semibold transition-colors ml-1"
              title="Delete Record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details Left, QR Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Record Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Hospital Header Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/90 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-mono text-teal-400 font-semibold uppercase tracking-wider">
                  RECORD REF ID: REC-{String(record.id).substring(0, 8).toUpperCase()}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {record.hospital_name}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type: <span className="text-slate-200 font-medium">{record.hospital_type}</span>
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                VERIFIED ACTIVE RECORD
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400 text-[11px]">Registration Number</div>
                <div className="font-mono font-bold text-white mt-0.5">{record.registration_number}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400 text-[11px]">License Number</div>
                <div className="font-mono font-bold text-white mt-0.5">{record.license_number}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                <div className="text-slate-400 text-[11px]">Patient Ref ID</div>
                <div className="font-mono font-bold text-teal-400 mt-0.5">{record.patient_reference_id || 'N/A'}</div>
              </div>
            </div>

            {/* Doctor & Location Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">Doctor-in-Charge</h3>
                <div className="flex items-center gap-2.5 text-sm text-white">
                  <UserCheck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="font-semibold">{record.doctor_in_charge}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{record.contact_number}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{record.official_email}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">Location & Address</h3>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {record.address}, {record.city}, {record.district}, {record.state} - {record.pincode}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Registered Owner:{' '}
                  <span className="text-white font-medium">{record.patient_name}</span> ({record.patient_email})
                </div>
              </div>
            </div>

            {/* Specializations & Facilities */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Medical Specializations
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  {record.specializations}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Available Facilities
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  {record.facilities}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Created: {new Date(record.created_at).toLocaleString()}
              </span>
              <span>Updated: {new Date(record.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Dedicated QR Code Box */}
        <div className="space-y-6">
          <QRCodeCard
            targetUrl={verificationUrl}
            recordTitle={record.hospital_name}
            recordSubtitle={`Reg: ${record.registration_number}`}
            recordId={record.id}
            size={200}
            showActions={true}
          />

          {/* Quick PDF Action Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Official Document PDF</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Cryptographically signed certificate with verified clinical formatting.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setPdfModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/25 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View PDF Inside Website
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Hospital Record?"
        message={`Are you sure you want to permanently delete the record for "${record.hospital_name}"?`}
        confirmText="Yes, Delete Record"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        recordId={record.id}
        hospitalName={record.hospital_name}
      />
    </div>
  );
};

export default ViewRecordPage;
