import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Plus,
  UploadCloud,
  Search,
  FileText,
  QrCode,
  Eye,
  Edit,
  Trash2,
  Download,
  Copy,
  Check,
  Building2,
  Calendar,
  MapPin,
  RefreshCw,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  ExternalLink,
  ShieldCheck,
  Printer,
  HeartPulse,
  Activity,
  Lock,
  Settings,
  LogOut,
  FolderOpen,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';
import { recordService } from '../services/recordService';
import { medicalDocumentService } from '../services/medicalDocumentService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import ConfirmModal from '../components/common/ConfirmModal';
import DocumentPreviewModal from '../components/records/DocumentPreviewModal';
import SecurityShield from '../components/common/SecurityShield';
import { QRCodeCanvas } from 'qrcode.react';
import { getPatientScanUrl } from '../utils/qrHelper';
import SecureInAppPDFViewerModal from '../components/pdf/SecureInAppPDFViewerModal';

const CATEGORIES = [
  'All',
  'Lab Report',
  'Scan/X-ray',
  'Discharge Summary',
  'Prescription Document',
  'Medical Certificate',
  'Other',
];

const PatientDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [qrIdentity, setQrIdentity] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedQrUrl, setCopiedQrUrl] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

  // Search & Filter State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'hospitals' | 'records' | 'documents'
  const [docSearch, setDocSearch] = useState('');
  const [docCategory, setDocCategory] = useState('All');

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Print QR modal
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profRes, qrRes, hospRes, recsRes, docsRes] = await Promise.all([
        patientService.getMyPatient().catch((e) => ({ data: null })),
        patientService.getMyQR().catch((e) => ({ qr_identity: null })),
        patientService.getMyHospitals().catch((e) => ({ hospitals: [] })),
        patientService.getMyRecords().catch((e) => ({ records: [] })),
        patientService.getMyDocuments().catch((e) => ({ documents: [] })),
      ]);

      setProfile(profRes?.data || null);
      setQrIdentity(qrRes?.qr_identity || profRes?.data?.qr_identity || null);
      setHospitals(hospRes?.hospitals || []);
      setClinicalRecords(recsRes?.records || []);
      setDocuments(docsRes?.documents || []);
    } catch (err) {
      console.error('Error fetching dashboard', err);
      setError('Could not refresh dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCopyRefId = async () => {
    const refId = profile?.patient_reference_id;
    if (!refId) return;
    try {
      await navigator.clipboard.writeText(refId);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleCopyQrUrl = async () => {
    const url = getPatientScanUrl(qrIdentity?.public_uuid, qrIdentity?.target_url);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedQrUrl(true);
      setTimeout(() => setCopiedQrUrl(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleDownloadQrPng = async () => {
    const canvas = document.getElementById('patient-dashboard-qr-canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `Permanent_QR_${profile?.patient_reference_id || 'PATIENT'}.png`;
      a.click();
      setSuccess('Permanent QR Code downloaded successfully.');
      return;
    }
    setDownloadingQr(true);
    try {
      const ref = profile?.patient_reference_id || 'QR';
      await patientService.downloadMyQR(`Permanent_QR_${ref}.png`);
      setSuccess('Permanent QR Code downloaded successfully.');
    } catch (err) {
      console.error('Download QR error', err);
      setError('Failed to download QR code image.');
    } finally {
      setDownloadingQr(false);
    }
  };


  const handlePrintQr = () => {
    window.print();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = !docSearch ||
      doc.title?.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.category?.toLowerCase().includes(docSearch.toLowerCase());
    const matchesCategory = docCategory === 'All' || doc.category === docCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your personal health records dashboard..." />;
  }

  return (
    <SecurityShield watermarkText="PATIENT HEALTH HUB • NO SCREENSHOT • SECURE IN-WEBSITE VIEW">
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        {/* Top Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              1 Patient = 1 Permanent QR Code
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {profile?.effective_full_name || profile?.full_name || user?.full_name || 'Patient'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Access your permanent QR code identity, authorized hospital records, and medical PDFs.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPdfViewerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02]"
            >
              <Eye className="w-4 h-4" />
              View Health Summary PDF Inside Website
            </button>

          <Link
            to="/patient/records/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-bold text-xs shadow-lg transition-all hover:scale-[1.02]"
          >
            <UploadCloud className="w-4 h-4 text-teal-400" />
            Upload Records
          </Link>

          <Link
            to="/settings"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Profile Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError(null)} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />

      {/* MANDATORY RULE 4: ONE PERMANENT PATIENT QR IDENTITY HERO CARD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          {/* Left: QR Image & Verification Badges */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="p-3 bg-white rounded-3xl shadow-2xl shadow-teal-500/20 border-2 border-teal-400/40 shrink-0 flex items-center justify-center">
              {qrIdentity?.public_uuid ? (
                <QRCodeCanvas
                  id="patient-dashboard-qr-canvas"
                  value={getPatientScanUrl(qrIdentity.public_uuid, qrIdentity.target_url)}
                  size={144}
                  level="H"
                  marginSize={1}
                  fgColor="#0F766E"
                  bgColor="#FFFFFF"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 font-mono text-xs">
                  Loading QR...
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Permanent Patient QR Identity Active
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                One Patient = One QR Code
              </h2>

              <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                This QR identity is cryptographically tied to your health profile. It remains permanent and stable when you visit new hospitals, upload documents, or receive treatment.
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <div className="px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
                  Ref ID:{' '}
                  <span className="text-teal-400 font-bold">{profile?.patient_reference_id}</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
                  UUID:{' '}
                  <span className="text-slate-300">
                    {qrIdentity?.public_uuid ? String(qrIdentity.public_uuid).substring(0, 13) + '...' : 'Permanent'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setPdfViewerOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02]"
            >
              <Eye className="w-4 h-4" />
              View Health Summary PDF Inside Website
            </button>

            <button
              type="button"
              onClick={handleDownloadQrPng}
              disabled={downloadingQr}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              {downloadingQr ? 'Downloading...' : 'Download QR Image (PNG)'}
            </button>

            <button
              type="button"
              onClick={handlePrintQr}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              Print QR Card
            </button>

            {qrIdentity?.public_uuid && (
              <Link
                to={`/patient/qr/${qrIdentity.public_uuid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 font-bold text-xs transition-all hover:scale-[1.02]"
              >
                <ExternalLink className="w-4 h-4 text-teal-400" />
                Preview Scan Landing Page
              </Link>
            )}

            <button
              type="button"
              onClick={handleCopyQrUrl}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-slate-400 hover:text-slate-200 text-[11px] font-medium border border-slate-800 transition-colors"
            >
              {copiedQrUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedQrUrl ? 'Copied QR Target URL' : 'Copy Public Scan URL'}
            </button>
          </div>
        </div>
      </div>

      {/* Patient Profile Details Card */}
      {profile && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/90 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                {profile.effective_full_name?.charAt(0) || profile.full_name?.charAt(0) || 'P'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">
                    {profile.effective_full_name || profile.full_name}
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 font-medium capitalize">
                    {profile.gender || 'Patient'}
                  </span>
                  {profile.date_of_birth && (
                    <span className="text-[11px] text-slate-400">
                      DOB: {profile.date_of_birth}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {profile.effective_email || profile.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {profile.effective_phone || profile.phone}
                  </span>
                  {profile.emergency_contact && (
                    <span className="flex items-center gap-1.5 text-rose-300">
                      <Activity className="w-3.5 h-3.5 text-rose-400" />
                      Emergency: {profile.emergency_contact}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {profile.address}, {profile.city}, {profile.district}, {profile.state} - {profile.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Unique Patient Ref ID Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-500/30 flex flex-col items-start sm:items-end justify-center shrink-0">
              <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">
                Patient Reference ID
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-lg font-extrabold text-white tracking-wider">
                  {profile.patient_reference_id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRefId}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 transition-colors"
                  title="Copy Reference ID"
                >
                  {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Quote this ID at hospital registration desks
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Affiliated Hospitals
            </div>
            <div className="mt-2 text-3xl font-extrabold text-white">{hospitals.length}</div>
            <div className="mt-1 text-xs text-teal-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Authorized facilities
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Clinical Hospital Records
            </div>
            <div className="mt-2 text-3xl font-extrabold text-white">{clinicalRecords.length}</div>
            <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5" /> Doctor visit entries
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Uploaded Documents
            </div>
            <div className="mt-2 text-3xl font-extrabold text-white">{documents.length}</div>
            <div className="mt-1 text-xs text-cyan-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Lab & imaging reports
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              QR Identity Status
            </div>
            <div className="mt-2 text-lg font-bold text-teal-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Permanent
            </div>
            <div className="mt-1 text-xs text-slate-400">1 Patient = 1 QR Rule</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-teal-400 text-teal-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          All Health Records
        </button>
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'hospitals'
              ? 'border-teal-400 text-teal-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Registered Hospitals ({hospitals.length})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'records'
              ? 'border-teal-400 text-teal-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          Clinical Visits ({clinicalRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'border-teal-400 text-teal-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Uploaded Documents ({documents.length})
        </button>
      </div>

      {/* SECTION 1: REGISTERED HOSPITALS LIST */}
      {(activeTab === 'overview' || activeTab === 'hospitals') && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-400" />
                Registered & Affiliated Hospitals
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Medical facilities where your permanent QR identity has been registered and authorized
              </p>
            </div>
            <Link
              to="/patient/hospitals/add"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Hospital Entry
            </Link>
          </div>

          {hospitals.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No hospital affiliations registered yet</p>
              <p className="text-xs mt-0.5">
                When a hospital registers you or you record a visit, it appears here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Hospital Details</th>
                    <th className="py-3.5 px-6">Registration No</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Contact</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {hospitals.map((hosp) => (
                    <tr key={hosp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm">{hosp.hospital_name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Affiliated since {hosp.registered_at ? new Date(hosp.registered_at).toLocaleDateString() : 'Active'}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-teal-400">
                        {hosp.registration_number || 'REG: Verified'}
                      </td>
                      <td className="py-4 px-6">
                        {hosp.address || 'Address on file'}
                      </td>
                      <td className="py-4 px-6 font-mono">
                        {hosp.contact_number || 'Direct desk'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold text-[11px] capitalize">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {hosp.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CLINICAL HOSPITAL RECORDS */}
      {(activeTab === 'overview' || activeTab === 'records') && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-teal-400" />
                Clinical Hospital Records
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Official clinical diagnoses, treatments, and visit summaries recorded by attending hospitals
              </p>
            </div>
          </div>

          {clinicalRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <HeartPulse className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No clinical hospital records found</p>
              <p className="text-xs mt-0.5">Clinical records added by hospitals will be listed here securely.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {clinicalRecords.map((rec) => (
                <div key={rec.id} className="p-6 hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          {rec.record_type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-teal-400" />
                          {rec.hospital_name || 'Hospital Visit'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Visit Date: {rec.visit_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {rec.additional_notes && (
                    <div className="mt-3 text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                      {rec.additional_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: UPLOADED MEDICAL DOCUMENTS */}
      {(activeTab === 'overview' || activeTab === 'documents') && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Uploaded Medical Documents
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Encrypted lab reports, scan imaging, discharge papers, and prescriptions
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Search document title..."
                  className="glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs w-48 sm:w-56"
                />
              </div>

              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="glass-input rounded-xl px-3 py-1.5 text-xs text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>

              <Link
                to="/patient/records/upload"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition-all shrink-0"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload New
              </Link>
            </div>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No medical documents found</p>
              <p className="text-xs mt-0.5">Upload PDF reports or scan files to keep them attached to your profile.</p>
              <Link
                to="/patient/records/upload"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload Your Medical Document
              </Link>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-950/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        {doc.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatFileSize(doc.file_size)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-2" title={doc.title}>
                      {doc.title}
                    </h4>

                    <div className="mt-2 space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate">{doc.hospital_name || 'Medical Facility'}</span>
                      </div>

                      {doc.record_date && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>Date: {doc.record_date}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDoc(doc);
                          setPreviewModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors"
                        title="View / Preview Document Inside Website"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Document Inside Website
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* In-Website Secure Clinical Summary PDF Viewer */}
      {pdfViewerOpen && (
        <SecureInAppPDFViewerModal
          isOpen={pdfViewerOpen}
          onClose={() => setPdfViewerOpen(false)}
          pdfEndpoint="/patient/me/pdf/"
          title={`Medical Health Summary — ${profile?.effective_full_name || profile?.full_name}`}
          patientRefId={profile?.patient_reference_id}
        />
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewDoc(null);
        }}
        document={previewDoc}
      />
      </div>
    </SecurityShield>
  );
};

export default PatientDashboardPage;
