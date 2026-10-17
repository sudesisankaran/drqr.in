import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Download,
  Printer,
  FileText,
  Plus,
  UploadCloud,
  Calendar,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  UserCheck,
  Eye,
  Loader2,
  Tag
} from 'lucide-react';
import { hospitalPatientService } from '../../services/hospitalPatientService';
import { medicalDocumentService } from '../../services/medicalDocumentService';
import DocumentPreviewModal from '../records/DocumentPreviewModal';
import SecurityShield from '../common/SecurityShield';
import SecureInAppPDFViewerModal from '../pdf/SecureInAppPDFViewerModal';
import { QRCodeCanvas } from 'qrcode.react';
import { getPatientScanUrl } from '../../utils/qrHelper';

const HospitalPatientDetailModal = ({
  isOpen,
  onClose,
  patientId,
  onOpenAddRecord,
  onOpenUploadDoc,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

  const fetchDetail = async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await hospitalPatientService.getPatientDetail(patientId);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch patient detail:', err);
      setError('Failed to load patient records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patientId) {
      fetchDetail();
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!patientId || !data?.patient) return;
    setDownloadingPdf(true);
    try {
      const filename = `Clinical_Summary_${data.patient.patient_reference_id}.pdf`;
      await hospitalPatientService.downloadPatientSummaryPDF(patientId, filename);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadQr = async () => {
    if (!patientId || !data?.patient) return;
    const canvas = document.getElementById('hospital-detail-qr-canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${data.patient.patient_reference_id}.png`;
      a.click();
      return;
    }
    setDownloadingQr(true);
    try {
      const filename = `QR_${data.patient.patient_reference_id}.png`;
      await hospitalPatientService.downloadPatientQRImage(patientId, filename);
    } catch (err) {
      console.error('Failed to download QR:', err);
    } finally {
      setDownloadingQr(false);
    }
  };

  const handlePrintQr = () => {
    const win = window.open('', '_blank');
    if (!win || !data?.qr_identity) return;
    const canvas = document.getElementById('hospital-detail-qr-canvas');
    const qrImgUrl = canvas ? canvas.toDataURL('image/png') : `/api/hospital/patients/${patientId}/qr/?download=1`;
    win.document.write(`
      <html>
        <head>
          <title>Patient QR Identity - ${data.patient.patient_reference_id}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; background: white; color: black; }
            .card { border: 2px solid #0F766E; padding: 24px; border-radius: 16px; max-width: 360px; margin: 0 auto; }
            h2 { color: #0F766E; margin-bottom: 4px; font-size: 20px; }
            .ref { font-family: monospace; font-size: 16px; font-weight: bold; background: #f0fdfa; padding: 4px 8px; border-radius: 6px; }
            .sub { font-size: 11px; color: #64748b; margin-top: 6px; }
            img { width: 220px; height: 220px; margin: 16px 0; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="card">
            <h2>DRQR Health Network</h2>
            <div class="sub">Official Permanent Patient QR Identity</div>
            <div style="margin: 12px 0;"><strong>${data.patient.full_name}</strong></div>
            <img src="${qrImgUrl}" alt="Permanent Patient QR" />
            <div>Patient ID: <span class="ref">${data.patient.patient_reference_id}</span></div>
            <div class="sub" style="margin-top: 12px;">Valid across all authorized healthcare providers</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <SecurityShield watermarkText={`HOSPITAL PATIENT DOSSIER • REF: ${data?.patient?.patient_reference_id || ''} • STRICTLY NO SCREENSHOT`}>
        <div className="w-full max-w-5xl h-[92vh] flex flex-col rounded-2xl glass-panel shadow-2xl border border-slate-700/80 bg-slate-900/95 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {data?.patient?.full_name || 'Patient Dossier'}
                </h2>
                {data?.patient?.patient_reference_id && (
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                    {data.patient.patient_reference_id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Authorized Clinical Management & Permanent QR Identity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
              <span className="text-xs">Loading patient dossier...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 text-rose-300 text-xs border border-rose-500/20 text-center">
              {error}
            </div>
          ) : data && (
            <>
              {/* Quick Actions Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Affiliation Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                    Active & Authorized
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAddRecord && onOpenAddRecord(data.patient)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-500/25 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Visit Record
                  </button>

                  <button
                    onClick={() => onOpenUploadDoc && onOpenUploadDoc(data.patient)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-400" /> Upload Document
                  </button>

                  <button
                    onClick={() => setPdfViewerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-500/25 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Summary PDF Inside Website
                  </button>
                </div>
              </div>

              {/* Grid: Profile Demographics & Permanent QR Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information (2 cols) */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-teal-400" />
                    Patient Demographics
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Phone Number</span>
                      <span className="text-slate-200 font-semibold">{data.patient.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Email Address</span>
                      <span className="text-slate-200 font-semibold truncate block">{data.patient.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Date of Birth</span>
                      <span className="text-slate-200 font-semibold">{data.patient.date_of_birth || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Gender</span>
                      <span className="text-slate-200 font-semibold capitalize">{data.patient.gender || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Emergency Contact</span>
                      <span className="text-slate-200 font-semibold">{data.patient.emergency_contact || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Initial Hospital Visit</span>
                      <span className="text-slate-200 font-semibold">{data.initial_visit_date || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-500 block text-[11px] mb-0.5">Residential Address</span>
                    <span className="text-slate-300">
                      {data.patient.address}, {data.patient.city}, {data.patient.district}, {data.patient.state} - {data.patient.pincode}
                    </span>
                  </div>
                </div>

                {/* Permanent QR Identity Card (1 col) */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-teal-500/25 flex flex-col items-center justify-between text-center space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      Permanent Patient QR
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">1 Patient = 1 Permanent QR Identity</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white shadow-lg shadow-teal-500/10 flex items-center justify-center">
                    <QRCodeCanvas
                      id="hospital-detail-qr-canvas"
                      value={getPatientScanUrl(data.qr_identity?.public_uuid, data.qr_identity?.target_url)}
                      size={128}
                      level="H"
                      marginSize={1}
                      fgColor="#0F766E"
                      bgColor="#FFFFFF"
                    />
                  </div>

                  <div className="w-full text-center">
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      UUID: {data.qr_identity?.public_uuid}
                    </div>
                    <div className="mt-3 flex justify-center gap-2">
                      <button
                        onClick={handleDownloadQr}
                        disabled={downloadingQr}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> PNG
                      </button>
                      <button
                        onClick={handlePrintQr}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Visit Records Section */}
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    Authorized Clinical Visit Records ({data.hospital_records?.length || 0})
                  </h3>
                  <button
                    onClick={() => onOpenAddRecord && onOpenAddRecord(data.patient)}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                  >
                    + Add Record
                  </button>
                </div>

                {data.hospital_records?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No clinical records recorded yet at this hospital.</p>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {data.hospital_records.map((rec) => (
                      <div key={rec.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{rec.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                              {rec.record_type}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            Visit Date: {rec.visit_date || 'N/A'} • Doctor: {rec.doctor_in_charge || 'Staff Doctor'}
                          </div>
                          {rec.additional_notes && (
                            <p className="text-slate-400 text-[11px] mt-1 italic">
                              "{rec.additional_notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Uploaded Documents Section */}
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    Medical Documents & Reports ({data.medical_documents?.length || 0})
                  </h3>
                  <button
                    onClick={() => onOpenUploadDoc && onOpenUploadDoc(data.patient)}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                  >
                    + Upload Document
                  </button>
                </div>

                {data.medical_documents?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No medical documents uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.medical_documents.map((doc) => (
                      <div key={doc.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white truncate">{doc.title}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 shrink-0">
                              {doc.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {doc.record_date ? `Date: ${doc.record_date} • ` : ''}
                            {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewDoc(doc);
                              setPreviewModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
                            title="View / Preview Document Inside Website"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View In-App
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Secure In-App PDF Viewer Modal */}
      {pdfViewerOpen && (
        <SecureInAppPDFViewerModal
          isOpen={pdfViewerOpen}
          onClose={() => setPdfViewerOpen(false)}
          pdfEndpoint={`/hospital/patients/${patientId}/pdf/`}
          title={`Clinical Summary — ${data?.patient?.full_name}`}
          patientRefId={data?.patient?.patient_reference_id}
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
      </SecurityShield>
    </div>
  );
};

export default HospitalPatientDetailModal;
