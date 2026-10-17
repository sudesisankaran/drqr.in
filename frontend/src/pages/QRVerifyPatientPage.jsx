import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  FileText,
  LogIn,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  Lock,
  QrCode,
  ArrowRight,
  Eye,
  Activity,
  HeartPulse,
  Clock,
  RotateCcw
} from 'lucide-react';
import { qrVerifyService } from '../services/qrVerifyService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SecurityShield from '../components/common/SecurityShield';
import SecureInAppPDFViewerModal from '../components/pdf/SecureInAppPDFViewerModal';
import DocumentPreviewModal from '../components/records/DocumentPreviewModal';

// 25 minutes access limit (in seconds)
const SESSION_LIMIT_SECONDS = 25 * 60;

const QRVerifyPatientPage = () => {
  const { publicUuid } = useParams();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 25-minute countdown timer state
  const [secondsRemaining, setSecondsRemaining] = useState(SESSION_LIMIT_SECONDS);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // In-app PDF and Document Viewers (No Download Option)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewDocOpen, setPreviewDocOpen] = useState(false);

  // Session timer management
  useEffect(() => {
    if (!publicUuid) return;

    // Check or initialize session start timestamp
    const sessionKey = `qr_session_start_${publicUuid}`;
    let startTime = sessionStorage.getItem(sessionKey);
    const now = Date.now();

    if (!startTime) {
      startTime = now.toString();
      sessionStorage.setItem(sessionKey, startTime);
    }

    const elapsedSeconds = Math.floor((now - parseInt(startTime, 10)) / 1000);
    const initialRemaining = Math.max(SESSION_LIMIT_SECONDS - elapsedSeconds, 0);

    setSecondsRemaining(initialRemaining);
    if (initialRemaining <= 0) {
      setIsSessionExpired(true);
    }

    const interval = setInterval(() => {
      const currentNow = Date.now();
      const currentElapsed = Math.floor((currentNow - parseInt(startTime, 10)) / 1000);
      const remaining = Math.max(SESSION_LIMIT_SECONDS - currentElapsed, 0);

      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        setIsSessionExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [publicUuid]);

  // Fetch verified QR details
  useEffect(() => {
    const fetchVerification = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await qrVerifyService.verifyQR(publicUuid);
        setData(res);
      } catch (err) {
        console.error('QR verification error:', err);
        setError(
          err.response?.data?.message ||
          'This QR code is either invalid, unverified, or does not match any registered patient.'
        );
      } finally {
        setLoading(false);
      }
    };
    if (publicUuid) {
      fetchVerification();
    }
  }, [publicUuid]);

  const handleRestartSession = () => {
    if (!publicUuid) return;
    sessionStorage.setItem(`qr_session_start_${publicUuid}`, Date.now().toString());
    setSecondsRemaining(SESSION_LIMIT_SECONDS);
    setIsSessionExpired(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying cryptographic permanent QR identity..." />;
  }

  // If 25-minute session expired
  if (isSessionExpired) {
    return (
      <SecurityShield watermarkText="SESSION EXPIRED • ACCESS TERMINATED">
        <div className="py-20 max-w-lg mx-auto px-4 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 shadow-2xl">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase mb-3">
            <Lock className="w-3.5 h-3.5" /> 25-Minute Access Limit Reached
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Secure Session Expired
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            To ensure patient confidentiality under medical privacy rules, QR verification sessions are strictly limited to <strong>25 minutes</strong> per scan.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRestartSession}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02]"
            >
              <RotateCcw className="w-4 h-4" />
              Re-scan / Reopen 25-Min Session
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Return to Healthcare Hub
            </Link>
          </div>
        </div>
      </SecurityShield>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 max-w-lg mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/10">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">QR Identity Not Found</h1>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          {error || 'This QR identifier is not registered in the medical healthcare system.'}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all"
          >
            Return to Healthcare Hub
          </Link>
        </div>
      </div>
    );
  }

  const isAuthorized = Boolean(data.is_authorized);
  const percentRemaining = (secondsRemaining / SESSION_LIMIT_SECONDS) * 100;

  return (
    <SecurityShield watermarkText={`CONFIDENTIAL MEDICAL RECORD • REF: ${data?.patient?.patient_reference_id || data?.patient_reference_id} • 25 MIN LIMIT`}>
      <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fadeIn">
        {/* TOP 25-MINUTE SECURITY COUNTDOWN BANNER */}
        <div className="glass-panel rounded-2xl p-4 border border-teal-500/30 bg-slate-900/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Secure Access Session:
                </span>
                <span className="font-mono text-sm font-extrabold text-teal-300 bg-slate-950 px-2 py-0.5 rounded-md border border-teal-500/30">
                  {formatTime(secondsRemaining)} remaining
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Application session automatically expires in 25 minutes for patient privacy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
              <Lock className="w-3 h-3" /> Right-Click & Screen Record Disabled
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              secondsRemaining < 300 ? 'bg-rose-500' : secondsRemaining < 600 ? 'bg-amber-400' : 'bg-teal-400'
            }`}
            style={{ width: `${percentRemaining}%` }}
          />
        </div>

        {/* Header Verification Badge */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px] mx-auto shadow-2xl shadow-emerald-500/25">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-9 h-9 text-emerald-400" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide uppercase shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Permanent Verified Medical QR Identity
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isAuthorized ? data.patient?.effective_full_name || data.patient?.full_name : data.masked_name}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span>
              Patient Reference ID:{' '}
              <strong className="font-mono text-teal-400 font-bold">
                {data.patient?.patient_reference_id || data.patient_reference_id}
              </strong>
            </span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-500">
              UUID: {String(publicUuid).substring(0, 13)}...
            </span>
          </div>
        </div>

        {/* CASE 1: PUBLIC / UNAUTHORIZED SCAN */}
        {!isAuthorized && (
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/30 bg-slate-900/95 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Cryptographically Verified Patient Badge</h3>
                    <p className="text-[11px] text-slate-400">Stable, permanent identity for this individual</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                  Identity Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Patient Legal Identity</span>
                  <span className="font-bold text-white text-sm mt-0.5 block tracking-wide">
                    {data.masked_name}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Name masked for privacy protection
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Registered Contact</span>
                  <span className="font-bold text-white text-sm mt-0.5 block font-mono">
                    {data.masked_phone}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Phone number masked for patient privacy
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Registered Location</span>
                  <div className="font-bold text-white text-sm mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span>{data.city || 'Tamil Nadu'}, {data.state || 'India'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Hospital Affiliations</span>
                  <div className="font-bold text-teal-300 text-sm mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>{data.affiliated_hospitals_count || 1} Authorized Hospital(s)</span>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-300">
                    Medical Privacy & Strict Access Policy
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Detailed medical records, clinical visits, and laboratory documents are private and access-controlled. Direct file downloads are prohibited; records may only be inspected inside the website by authenticated personnel.
                  </p>
                </div>
              </div>

              {/* Login CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  Are you the registered patient or an attending hospital doctor?
                </div>
                <Link
                  to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02]"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Unlock In-Website Records
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* CASE 2: AUTHORIZED UNLOCKED VIEW (NO DOWNLOAD OPTION - IN-WEBSITE VIEW ONLY) */}
        {isAuthorized && (
          <div className="space-y-6">
            {/* Patient Profile Card */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-teal-500/30 bg-slate-900/95 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xl">
                    {data.patient?.effective_full_name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {data.patient?.effective_full_name || data.patient?.full_name}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-mono text-teal-400 font-semibold">
                        {data.patient?.patient_reference_id}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{data.patient?.gender || 'Patient'}</span>
                      {data.patient?.date_of_birth && (
                        <>
                          <span>•</span>
                          <span>DOB: {data.patient.date_of_birth}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* IN-WEBSITE PDF VIEW BUTTON (NO DOWNLOAD OPTION) */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPdfViewerOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02]"
                  >
                    <Eye className="w-4 h-4" />
                    View Clinical PDF Inside Website
                  </button>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Contact Phone</span>
                  <span className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    {data.patient?.effective_phone || data.patient?.phone}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Email Address</span>
                  <span className="font-semibold text-white mt-0.5 flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{data.patient?.effective_email || data.patient?.email || 'N/A'}</span>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Emergency Contact</span>
                  <span className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-rose-400" />
                    {data.patient?.emergency_contact || 'None specified'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 sm:col-span-2 lg:col-span-3">
                  <span className="text-slate-400 text-[11px] block">Residential Address</span>
                  <span className="font-semibold text-white mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {data.patient?.address}, {data.patient?.city}, {data.patient?.district}, {data.patient?.state} - {data.patient?.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Clinical Hospital Records Section */}
            <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-teal-400" />
                  Clinical Hospital Visit Records ({data.records?.length || 0})
                </h3>
                <span className="text-[11px] text-teal-300 font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                  Authorized In-App View
                </span>
              </div>

              {(!data.records || data.records.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No clinical records recorded yet for this patient.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {data.records.map((rec) => (
                    <div key={rec.id} className="p-5 hover:bg-slate-800/30 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{rec.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                              {rec.record_type}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-500" />
                              {rec.hospital_name || 'Hospital Visit'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {rec.visit_date}
                            </span>
                          </div>
                        </div>
                      </div>
                      {rec.additional_notes && (
                        <p className="mt-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          {rec.additional_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medical Documents Section (View Only Inside Website - No Download Option) */}
            <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Medical Documents ({data.documents?.length || 0})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Direct downloads disabled • In-website view only
                </span>
              </div>

              {(!data.documents || data.documents.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No medical documents attached yet.
                </div>
              ) : (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="text-xs font-bold text-white truncate" title={doc.title}>
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-teal-400 font-medium">
                          {doc.category}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {doc.original_filename}
                        </div>
                      </div>

                      {/* IN-WEBSITE VIEW ONLY (NO DOWNLOAD) */}
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDoc(doc);
                          setPreviewDocOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shrink-0 transition-colors"
                        title="View Document Inside Website"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View In-App
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECURE IN-WEBSITE PDF VIEWER MODAL (NO DOWNLOAD) */}
        {pdfViewerOpen && (
          <SecureInAppPDFViewerModal
            isOpen={pdfViewerOpen}
            onClose={() => setPdfViewerOpen(false)}
            pdfEndpoint={`/qr/${publicUuid}/pdf/`}
            title={`Clinical Summary — ${data.patient?.effective_full_name || data.patient?.full_name}`}
            patientRefId={data.patient?.patient_reference_id}
          />
        )}

        {/* SECURE IN-APP DOCUMENT PREVIEW MODAL */}
        <DocumentPreviewModal
          isOpen={previewDocOpen}
          onClose={() => {
            setPreviewDocOpen(false);
            setPreviewDoc(null);
          }}
          document={previewDoc}
        />
      </div>
    </SecurityShield>
  );
};

export default QRVerifyPatientPage;
