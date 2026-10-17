import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  FileText,
  UploadCloud,
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
  Eye,
  Plus
} from 'lucide-react';
import { recordService } from '../services/recordService';
import { medicalDocumentService } from '../services/medicalDocumentService';
import { pdfService } from '../services/pdfService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import ConfirmModal from '../components/common/ConfirmModal';
import QRCodeCard from '../components/qr/QRCodeCard';
import PDFViewerModal from '../components/pdf/PDFViewerModal';
import DocumentPreviewModal from '../components/records/DocumentPreviewModal';

const ViewHospitalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hospData, docsData] = await Promise.all([
          recordService.getRecord(id),
          medicalDocumentService.listDocuments({ hospital_id: id }),
        ]);
        setHospital(hospData);
        setDocuments(docsData.results || docsData || []);
      } catch (err) {
        console.error('Fetch hospital error', err);
        setError('Could not retrieve hospital information.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await recordService.deleteRecord(id);
      navigate('/patient/dashboard');
    } catch (err) {
      console.error('Delete error', err);
      setError('Failed to delete hospital record.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!hospital) return;
    pdfService.downloadPdf(hospital.id, `${hospital.hospital_name.replace(/\s+/g, '_')}_Record.pdf`);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading hospital record & attached documents..." />;
  }

  if (error || !hospital) {
    return (
      <div className="py-20 max-w-md mx-auto px-4 text-center">
        <AlertMessage type="error" message={error || 'Hospital record not found.'} className="mb-4" />
        <Link to="/patient/dashboard" className="text-xs text-teal-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/patient/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patient Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/patient/records/upload`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02]"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Document
          </Link>

          <Link
            to={`/patient/hospitals/${hospital.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Edit className="w-4 h-4 text-amber-400" />
            Edit
          </Link>

          <button
            onClick={() => setPdfModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            PDF
          </button>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors ml-1"
            title="Delete Hospital Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Details Left, QR Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Hospital Information Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/90 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-mono text-teal-400 font-semibold uppercase tracking-wider">
                  REGISTRATION NO: {hospital.registration_number || 'N/A'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {hospital.hospital_name}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type: <span className="text-slate-200 font-medium">{hospital.hospital_type}</span>
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE HEALTHCARE RECORD
              </div>
            </div>

            {/* Doctor & Location Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-teal-400">Doctor & Contact</h3>
                <div className="flex items-center gap-2.5 text-sm text-white">
                  <UserCheck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="font-semibold">{hospital.doctor_in_charge}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{hospital.contact_number}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{hospital.official_email}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-teal-400">Location</h3>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {hospital.address}, {hospital.city}, {hospital.district}, {hospital.state} - {hospital.pincode}
                  </span>
                </div>
                {hospital.visit_date && (
                  <div className="flex items-center gap-2 text-slate-300 pt-1">
                    <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Visit Date: <strong className="text-white">{hospital.visit_date}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Specialization & Additional Notes */}
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                  Specializations:
                </span>
                <p className="mt-1 text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {hospital.specialization || hospital.specializations}
                </p>
              </div>

              {hospital.additional_notes && (
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                    Additional Notes:
                  </span>
                  <p className="mt-1 text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {hospital.additional_notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attached Medical Records Section */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Attached Medical Records</h3>
                <p className="text-xs text-slate-400">
                  Lab reports, scans and documents uploaded for this facility
                </p>
              </div>

              <Link
                to="/patient/records/upload"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload New Document
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
                No medical documents uploaded for this hospital yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {documents.map((doc) => (
                  <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{doc.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          {doc.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {doc.record_date ? `Date: ${doc.record_date} • ` : ''}
                        {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDoc(doc);
                          setPreviewModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs transition-colors"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => medicalDocumentService.downloadDocument(doc.id, doc.original_filename)}
                        className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: QR and Export */}
        <div className="space-y-6">
          <QRCodeCard
            targetUrl={`${window.location.origin}/verify/${hospital.id}`}
            recordTitle={hospital.hospital_name}
            recordSubtitle={`Doctor: ${hospital.doctor_in_charge}`}
            recordId={hospital.id}
            size={200}
            showActions={true}
          />

          <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center space-y-3">
            <h4 className="text-base font-bold text-white">Official Certificate PDF</h4>
            <p className="text-xs text-slate-400">
              High-resolution document signed with doctor credentials and registration verification.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setPdfModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2"
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
        title="Delete Hospital Details?"
        message={`Are you sure you want to permanently delete the records for "${hospital.hospital_name}"?`}
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
        recordId={hospital.id}
        hospitalName={hospital.hospital_name}
      />

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
  );
};

export default ViewHospitalPage;
