import React, { useState } from 'react';
import { UploadCloud, X, Loader2, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { hospitalPatientService } from '../../services/hospitalPatientService';
import { extractErrorMessage } from '../../services/api';

const CATEGORIES = [
  'Lab Report',
  'Scan/X-ray',
  'Discharge Summary',
  'Prescription Document',
  'Medical Certificate',
  'Other',
];

const UploadPatientDocumentModal = ({ isOpen, onClose, patient, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lab Report');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !patient) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 15 * 1024 * 1024) {
        setError('File size exceeds maximum allowed 15 MB.');
        return;
      }
      setFile(selected);
      setError(null);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Document Title is required.');
      return;
    }
    if (!file) {
      setError('Please select a file to upload (PDF, JPG, PNG).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      if (recordDate) formData.append('record_date', recordDate);
      if (description) formData.append('description', description);
      if (referenceNumber) formData.append('reference_number', referenceNumber);
      formData.append('file', file);

      await hospitalPatientService.uploadPatientDocument(patient.id, formData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to upload document:', err);
      setError(extractErrorMessage(err, 'Failed to upload document.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl glass-panel shadow-2xl border border-slate-700/80 bg-slate-900/95 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upload Medical Document</h3>
              <p className="text-[11px] text-slate-400">
                Patient: <span className="text-teal-300 font-semibold">{patient.full_name || patient.effective_full_name}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Document Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete Blood Count & Lipid Profile"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white focus:outline-none focus:border-teal-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Record Date</label>
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              File Attachment <span className="text-rose-400">*</span>
            </label>
            <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-950/40 text-center cursor-pointer hover:border-teal-500 transition-colors relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-teal-300">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold truncate max-w-xs">{file.name}</span>
                  <span className="text-slate-500 text-[10px]">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
              ) : (
                <div>
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-slate-300 font-medium">Click or drag file to upload</p>
                  <p className="text-[10px] text-slate-500">Supported formats: PDF, JPG, PNG (Max 15MB)</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Clinical Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary or findings from the document"
              className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-lg shadow-teal-500/25 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Upload to Private Storage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPatientDocumentModal;
