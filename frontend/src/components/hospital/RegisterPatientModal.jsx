import React, { useState } from 'react';
import {
  UserPlus,
  X,
  Loader2,
  CheckCircle,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { hospitalPatientService } from '../../services/hospitalPatientService';
import { extractErrorMessage } from '../../services/api';

const INITIAL_FORM = {
  full_name: '',
  phone: '',
  email: '',
  date_of_birth: '',
  gender: '',
  address: '',
  city: '',
  district: '',
  state: 'Tamil Nadu',
  pincode: '',
  emergency_contact: '',
  initial_visit_date: new Date().toISOString().split('T')[0],
  consent_acknowledged: true,
};

const RegisterPatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (!formData.full_name.trim()) {
      setError('Patient Full Name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (!formData.address.trim()) {
      setError('Residential address is required.');
      return;
    }
    if (!formData.city.trim() || !formData.district.trim() || !formData.pincode.trim()) {
      setError('City, District, and PIN code are required.');
      return;
    }
    if (!formData.consent_acknowledged) {
      setError('Patient consent and privacy acknowledgment is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        date_of_birth: formData.date_of_birth || null,
        initial_visit_date: formData.initial_visit_date || null,
      };
      const res = await hospitalPatientService.registerPatient(payload);
      setSuccessData(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(extractErrorMessage(err, 'Failed to register patient. Please check all fields.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    setError(null);
    setFormData(INITIAL_FORM);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl glass-panel shadow-2xl border border-slate-700/80 bg-slate-900/95 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Register New Patient</h2>
              <p className="text-xs text-slate-400">
                Hospital-based enrollment with one permanent QR identity
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successData ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {successData.is_new_patient ? 'Patient Successfully Registered!' : 'Existing Patient Affiliated!'}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                {successData.message}
              </p>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient Name:</span>
                  <span className="font-semibold text-white">{successData.patient?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient Reference ID:</span>
                  <span className="font-mono font-bold text-teal-300">{successData.patient?.patient_reference_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Permanent QR UUID:</span>
                  <span className="font-mono text-[11px] text-purple-300">{successData.qr_identity?.public_uuid}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-500/25"
                >
                  Done & View Patient List
                </button>
              </div>
            </div>
          ) : (
            <form id="registerPatientForm" onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Krishnan"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Email Address <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="patient@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Date of Birth <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Gender <span className="text-slate-500">(Optional)</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Residential Address */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Residential Address <span className="text-rose-400">*</span>
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street name, door no, landmark"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    City <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Chennai"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    District <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Chennai"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    State <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Tamil Nadu"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    PIN Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 600001"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Hospital & Emergency Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Emergency Contact Number <span className="text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    placeholder="Relative / Guardian Phone"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Initial Visit / Registration Date
                  </label>
                  <input
                    type="date"
                    name="initial_visit_date"
                    value={formData.initial_visit_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent_acknowledged"
                    checked={formData.consent_acknowledged}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-slate-700 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-slate-300 leading-relaxed">
                    Patient has provided formal consent for medical record registration, authorized hospital affiliation, and generation of their one permanent QR identity.
                  </span>
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        {!successData && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950/40">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Form
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="registerPatientForm"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save & Register Patient
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPatientModal;
