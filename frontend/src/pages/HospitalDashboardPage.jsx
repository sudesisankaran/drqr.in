import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  UserPlus,
  FileText,
  QrCode,
  Search,
  Plus,
  Eye,
  Download,
  Printer,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  UploadCloud,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hospitalService } from '../services/hospitalService';
import { hospitalPatientService } from '../services/hospitalPatientService';
import { recordService } from '../services/recordService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import RegisterPatientModal from '../components/hospital/RegisterPatientModal';
import HospitalPatientDetailModal from '../components/hospital/HospitalPatientDetailModal';
import AddPatientRecordModal from '../components/hospital/AddPatientRecordModal';
import UploadPatientDocumentModal from '../components/hospital/UploadPatientDocumentModal';
import PatientQRModal from '../components/hospital/PatientQRModal';
import SecureInAppPDFViewerModal from '../components/pdf/SecureInAppPDFViewerModal';

const HospitalDashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');

  // Modals
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedPatientForQR, setSelectedPatientForQR] = useState(null);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [selectedPatientForRecord, setSelectedPatientForRecord] = useState(null);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [selectedPatientForDoc, setSelectedPatientForDoc] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdfPatient, setSelectedPdfPatient] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Hospital Profile
      const profRes = await hospitalService.getMyHospital();
      setProfile(profRes.data);

      // 2. Fetch Patients registered with this hospital
      const patRes = await hospitalPatientService.listPatients({ search: patientSearch });
      setPatients(patRes.patients || []);
      setTotalPatients(patRes.total_patients || 0);
    } catch (err) {
      console.error('Error fetching hospital dashboard data:', err);
      setError('Failed to load dashboard data. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [patientSearch]);

  const handleOpenDetail = (patientId) => {
    setSelectedPatientId(patientId);
    setDetailModalOpen(true);
  };

  const handleOpenQR = (patient) => {
    setSelectedPatientForQR(patient);
    setQrModalOpen(true);
  };

  const handleOpenAddRecord = (patient) => {
    setSelectedPatientForRecord(patient);
    setAddRecordModalOpen(true);
  };

  const handleOpenUploadDoc = (patient) => {
    setSelectedPatientForDoc(patient);
    setUploadDocModalOpen(true);
  };

  const handleViewPDF = (patient) => {
    setSelectedPdfPatient(patient);
    setPdfViewerOpen(true);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            Hospital Administration Portal
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {profile?.hospital_name || user?.full_name || 'Hospital Dashboard'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Official Registration Number:{' '}
            <span className="font-mono text-teal-400 font-semibold">
              {profile?.registration_number || 'N/A'}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            Register New Patient
          </button>

          <Link
            to="/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
          >
            Edit Facility Info
          </Link>
        </div>
      </div>

      <AlertMessage type="error" message={error} onClose={() => setError(null)} />

      {/* Hospital Profile Card */}
      {profile && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/90 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {profile.hospital_name}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-normal">
                  {profile.hospital_type}
                </span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-200">Specializations:</span> {profile.specializations}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-200">Facilities:</span> {profile.facilities}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-300 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Doctor: <strong className="text-white">{profile.doctor_in_charge}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{profile.contact_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="truncate">{profile.official_email}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{profile.address}, {profile.city}, {profile.district}, {profile.state} - {profile.pincode}</span>
              </div>
              <div className="pt-2 text-[11px] text-slate-400">
                License No: <span className="font-mono text-slate-200 font-semibold">{profile.license_number}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/80">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Registered Patients</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{totalPatients}</div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Enrolled with permanent QR identity
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/80">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>One Patient = One QR Engine</span>
            <QrCode className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-teal-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            Permanent Digital QR
          </div>
          <div className="mt-1 text-xs text-slate-400">Stable across all visits & documents</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/80">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Clinical Summary Engine</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-400 flex items-center gap-2">
            In-Website Dossier
          </div>
          <div className="mt-1 text-xs text-slate-400">Secure digital summary with embedded QR</div>
        </div>
      </div>

      {/* Patients Section */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              Registered Hospital Patients
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Search by name, phone number, or patient reference ID. Access authorized records and permanent QR identities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, phone, or PAT-ID..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              onClick={() => setRegisterModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register Patient</span>
            </button>
          </div>
        </div>

        {/* Patients Table */}
        {loading ? (
          <div className="p-12 text-center">
            <LoadingSpinner message="Loading registered patients..." />
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No Patients Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {patientSearch
                ? `No patient matched "${patientSearch}". Try searching with another name, phone, or ID.`
                : 'Your hospital does not have any registered patients yet. Click "Register New Patient" to enroll your first patient.'}
            </p>
            <button
              onClick={() => setRegisterModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              Register Patient Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Patient Reference ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Demographics</th>
                  <th className="py-3.5 px-4 text-center">Records / Docs</th>
                  <th className="py-3.5 px-4">Enrolled Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {patients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-teal-300 px-2 py-1 rounded bg-teal-500/10 border border-teal-500/25">
                        {pat.patient_reference_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{pat.full_name}</div>
                      <div className="text-[11px] text-slate-400">{pat.city}, {pat.state}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{pat.phone}</div>
                      {pat.email && !pat.email.includes('@mediqr.local') && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{pat.email}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="capitalize">{pat.gender || 'Not specified'}</div>
                      <div className="text-[11px] text-slate-400">
                        {pat.date_of_birth ? `DOB: ${pat.date_of_birth}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                          {pat.total_records} Records
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                          {pat.total_documents} Docs
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {pat.registered_at ? pat.registered_at.split('T')[0] : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(pat.patient_id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 transition-colors"
                          title="Open Patient Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenQR(pat)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 transition-colors"
                          title="View / Download Permanent QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenAddRecord(pat)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                          title="Add Visit Record"
                        >
                          <Stethoscope className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenUploadDoc(pat)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                          title="Upload Medical Document"
                        >
                          <UploadCloud className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleViewPDF(pat)}
                          className="p-1.5 rounded-lg bg-teal-600/80 hover:bg-teal-600 text-white transition-colors"
                          title="View Clinical PDF Inside Website"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Register New Patient */}
      <RegisterPatientModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={() => fetchDashboardData()}
      />

      {/* Modal: Patient Dossier / Detail */}
      <HospitalPatientDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedPatientId(null);
        }}
        patientId={selectedPatientId}
        onOpenAddRecord={(pat) => {
          setDetailModalOpen(false);
          handleOpenAddRecord(pat);
        }}
        onOpenUploadDoc={(pat) => {
          setDetailModalOpen(false);
          handleOpenUploadDoc(pat);
        }}
      />

      {/* Modal: Patient QR Code */}
      <PatientQRModal
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setSelectedPatientForQR(null);
        }}
        patient={selectedPatientForQR}
      />

      {/* Modal: Add Visit Record */}
      <AddPatientRecordModal
        isOpen={addRecordModalOpen}
        onClose={() => {
          setAddRecordModalOpen(false);
          setSelectedPatientForRecord(null);
        }}
        patient={selectedPatientForRecord}
        onSuccess={() => fetchDashboardData()}
      />

      {/* Modal: Upload Document */}
      <UploadPatientDocumentModal
        isOpen={uploadDocModalOpen}
        onClose={() => {
          setUploadDocModalOpen(false);
          setSelectedPatientForDoc(null);
        }}
        patient={selectedPatientForDoc}
        onSuccess={() => fetchDashboardData()}
      />

      {/* Modal: View Clinical PDF Inside Website */}
      {pdfViewerOpen && selectedPdfPatient && (
        <SecureInAppPDFViewerModal
          isOpen={pdfViewerOpen}
          onClose={() => {
            setPdfViewerOpen(false);
            setSelectedPdfPatient(null);
          }}
          pdfEndpoint={`/hospital/patients/${selectedPdfPatient.patient_id}/pdf/`}
          title="Official Patient Clinical Dossier"
          patientRefId={selectedPdfPatient.patient_reference_id}
        />
      )}
    </div>
  );
};

export default HospitalDashboardPage;
