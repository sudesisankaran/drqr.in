import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  X,
  FileCheck,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { recordService } from '../services/recordService';
import { medicalDocumentService } from '../services/medicalDocumentService';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const CATEGORIES = [
  'Lab Report',
  'Scan/X-ray',
  'Discharge Summary',
  'Prescription Document',
  'Medical Certificate',
  'Other',
];

const UploadRecordPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  // Form State
  const [hospitalRecordId, setHospitalRecordId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lab Report');
  const [recordDate, setRecordDate] = useState('');
  const [description, setDescription] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoadingHospitals(true);
      try {
        const res = await recordService.listRecords();
        const hospList = res.results || [];
        setHospitals(hospList);
        if (hospList.length > 0) {
          setHospitalRecordId(hospList[0].id);
        }
      } catch (err) {
        console.error('Error fetching hospitals', err);
        setError('Failed to fetch your saved hospitals. Please try again.');
      } finally {
        setLoadingHospitals(false);
      }
    };
    fetchHospitals();
  }, []);

  const validateFile = (file) => {
    if (!file) return 'Please select a document file to upload.';
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Invalid file format (.${ext}). Only PDF, JPG, JPEG, and PNG files are allowed.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed ${MAX_FILE_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileErr = validateFile(file);
      if (fileErr) {
        setError(fileErr);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fileErr = validateFile(file);
      if (fileErr) {
        setError(fileErr);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
      }
    }
  };

  const handleReset = () => {
    setTitle('');
    setCategory('Lab Report');
    setRecordDate('');
    setDescription('');
    setReferenceNumber('');
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!hospitalRecordId) {
      setError('Please select a hospital record associated with this document.');
      return;
    }
    if (!title.trim()) {
      setError('Document title is required.');
      return;
    }
    const fileErr = validateFile(selectedFile);
    if (fileErr) {
      setError(fileErr);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('hospital_record', hospitalRecordId);
      formData.append('title', title.trim());
      formData.append('category', category);
      if (recordDate) formData.append('record_date', recordDate);
      if (description.trim()) formData.append('description', description.trim());
      if (referenceNumber.trim()) formData.append('reference_number', referenceNumber.trim());
      formData.append('file', selectedFile);

      const res = await medicalDocumentService.uploadDocument(formData);
      setSuccess('Medical record uploaded and encrypted successfully!');
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Upload error', err);
      setError(extractErrorMessage(err, 'Failed to upload document. Please verify your connection.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingHospitals) {
    return <LoadingSpinner fullScreen text="Loading saved medical facilities..." />;
  }

  return (
    <div className="py-10 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/patient/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patient Dashboard
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold mb-3">
          <UploadCloud className="w-3.5 h-3.5 text-teal-400" />
          Private Medical Vault Storage
        </div>
        <h1 className="text-3xl font-extrabold text-white">Upload Medical Records</h1>
        <p className="mt-2 text-slate-400 text-sm max-w-lg mx-auto">
          Securely archive lab tests, scans, discharge summaries, and prescription documents into your private health registry.
        </p>
      </div>

      {/* If patient has no hospitals saved yet */}
      {hospitals.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 border border-slate-800 bg-slate-900/95 text-center shadow-xl">
          <Building2 className="w-12 h-12 text-teal-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Hospital Records Saved</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            You must add at least one hospital or medical facility before uploading medical records.
          </p>
          <div className="mt-6">
            <Link
              to="/patient/hospitals/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Hospital Details First
            </Link>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-800 bg-slate-900/95 shadow-2xl">
          <AlertMessage type="error" message={error} onClose={() => setError(null)} className="mb-6" />
          <AlertMessage type="success" message={success} className="mb-6" />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hospital selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Associated Hospital Facility *
              </label>
              <select
                value={hospitalRecordId}
                onChange={(e) => setHospitalRecordId(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white"
                required
              >
                {hospitals.map((hosp) => (
                  <option key={hosp.id} value={hosp.id} className="bg-slate-900 text-white">
                    {hosp.hospital_name} ({hosp.city}) — Doctor: {hosp.doctor_in_charge}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Link this document to the attending medical center.
              </p>
            </div>

            {/* Document Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Record Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC) Report"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Record Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Record Date (Optional)
                </label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reference / Lab Report No (Optional)
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. LAB-2026-98124"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Clinical Notes / Findings (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Fasting glucose normal, cholesterol slightly elevated. Follow-up consultation scheduled."
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            {/* Drag & Drop File Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upload File (PDF, JPG, PNG) *
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-teal-400 bg-teal-500/10'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-slate-700 hover:border-teal-500/40 bg-slate-950/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-white truncate max-w-sm">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type || 'Document'}
                    </span>
                    <span className="text-[11px] text-teal-400 mt-2 underline">
                      Click to choose another file
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-2">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-white">
                      Click to upload or drag & drop file here
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF, JPG, JPEG, PNG &bull; Max size: {MAX_FILE_SIZE_MB} MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Reset Form
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Link
                  to="/patient/dashboard"
                  className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading & Encrypting...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Save & Upload Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UploadRecordPage;
