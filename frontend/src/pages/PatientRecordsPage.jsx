import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building2,
  RefreshCw,
  QrCode,
  Tag,
  FileCheck,
  Plus
} from 'lucide-react';
import { medicalDocumentService } from '../services/medicalDocumentService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import ConfirmModal from '../components/common/ConfirmModal';
import QRCodeCard from '../components/qr/QRCodeCard';
import DocumentPreviewModal from '../components/records/DocumentPreviewModal';

const CATEGORIES = [
  'All',
  'Lab Report',
  'Scan/X-ray',
  'Discharge Summary',
  'Prescription Document',
  'Medical Certificate',
  'Other',
];

const PatientRecordsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRecordDate, setEditRecordDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQRDoc, setSelectedQRDoc] = useState(null);

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await medicalDocumentService.listDocuments(params);
      setDocuments(res.results || res || []);
    } catch (err) {
      console.error('Error fetching medical records', err);
      setError('Could not retrieve uploaded medical documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, categoryFilter, startDate, endDate]);

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      await medicalDocumentService.deleteDocument(docToDelete.id);
      setDeleteModalOpen(false);
      setDocToDelete(null);
      setSuccess('Medical document deleted successfully.');
      fetchDocuments();
    } catch (err) {
      console.error('Delete error', err);
      setError('Failed to delete document.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (doc) => {
    setDocToEdit(doc);
    setEditTitle(doc.title);
    setEditCategory(doc.category);
    setEditDescription(doc.description || '');
    setEditRecordDate(doc.record_date || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!docToEdit) return;
    setSavingEdit(true);
    try {
      await medicalDocumentService.updateDocument(docToEdit.id, {
        title: editTitle.trim(),
        category: editCategory,
        description: editDescription.trim(),
        record_date: editRecordDate || null,
      });
      setEditModalOpen(false);
      setDocToEdit(null);
      setSuccess('Document details updated.');
      fetchDocuments();
    } catch (err) {
      console.error('Update error', err);
      setError('Failed to update document metadata.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenQR = (doc) => {
    setSelectedQRDoc(doc);
    setQrModalOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            Patient Clinical Archive
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Uploaded Records</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, search, securely inspect inside website and organize your uploaded medical documents.
          </p>
        </div>

        <Link
          to="/patient/records/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02] shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          Upload New Record
        </Link>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError(null)} />
      <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, hospital, ref..."
              className="glass-input rounded-xl pl-9 pr-3 py-2 text-xs w-full"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="glass-input rounded-xl px-3 py-2 text-xs w-full text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="From Date"
              className="glass-input rounded-xl px-3 py-2 text-xs w-full text-slate-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="To Date"
              className="glass-input rounded-xl px-3 py-2 text-xs w-full text-slate-300"
            />
            <button
              onClick={fetchDocuments}
              title="Refresh"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Records Content */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner text="Fetching encrypted patient documents..." />
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-panel py-16 px-4 rounded-2xl border border-slate-800 text-center">
          <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Medical Documents Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || categoryFilter !== 'All'
              ? 'No records match the selected filters. Try resetting search criteria.'
              : 'You have not uploaded any medical records yet. Archive your first test or scan.'}
          </p>
          <div className="mt-5">
            <Link
              to="/patient/records/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Medical Record
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/80 flex flex-col justify-between"
            >
              <div>
                {/* Header tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 truncate">
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatFileSize(doc.file_size)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-2" title={doc.title}>
                  {doc.title}
                </h3>

                <div className="mt-2.5 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{doc.hospital_name}</span>
                  </div>

                  {doc.record_date && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Record Date: {doc.record_date}</span>
                    </div>
                  )}

                  {doc.reference_number && (
                    <div className="text-[11px] font-mono text-slate-400">
                      Ref: <span className="text-white">{doc.reference_number}</span>
                    </div>
                  )}

                  {doc.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 pt-1 border-t border-slate-800/80">
                      {doc.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewDoc(doc);
                      setPreviewModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title="View / Preview Document"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-400" />
                    View
                  </button>


                  <button
                    onClick={() => handleOpenQR(doc)}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 transition-colors"
                    title="Generate QR Verification"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(doc)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                    title="Edit Metadata"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(doc)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Medical Document?"
        message={`Are you sure you want to delete "${docToDelete?.title}"? The document will be permanently removed from storage.`}
        confirmText="Yes, Delete Document"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDocToDelete(null);
        }}
      />

      {/* Edit Metadata Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 shadow-2xl border border-slate-700 bg-slate-900">
            <h3 className="text-base font-bold text-white mb-4">Edit Document Details</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category *</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
                  required
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Record Date</label>
                <input
                  type="date"
                  value={editRecordDate}
                  onChange={(e) => setEditRecordDate(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notes / Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalOpen && selectedQRDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl glass-panel p-6 shadow-2xl border border-slate-700 bg-slate-900 text-center">
            <h3 className="text-base font-bold text-white mb-1">Record QR Certificate</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedQRDoc.title}</p>
            <QRCodeCard
              targetUrl={`${window.location.origin}/verify/${selectedQRDoc.hospital_record}`}
              recordTitle={selectedQRDoc.title}
              recordSubtitle={selectedQRDoc.hospital_name}
              size={200}
              showActions={true}
            />
            <button
              onClick={() => setQrModalOpen(false)}
              className="mt-4 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
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
  );
};

export default PatientRecordsPage;
