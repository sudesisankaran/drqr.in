import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Save, ArrowLeft, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { recordService } from '../services/recordService';
import { hospitalService } from '../services/hospitalService';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';

const AddHospitalPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [verifiedHospitals, setVerifiedHospitals] = useState([]);

  const defaultValues = {
    hospital_name: '',
    registration_number: '',
    hospital_type: 'Multi-Specialty Hospital',
    specialization: 'General Medicine, Emergency Care',
    address: '',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    contact_number: '',
    official_email: '',
    doctor_in_charge: '',
    visit_date: '',
    additional_notes: '',
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    hospitalService.listHospitals()
      .then((res) => setVerifiedHospitals(res.results || []))
      .catch((e) => console.warn('Could not load hospital directory', e));
  }, []);

  const handleSelectPredefined = (e) => {
    const id = e.target.value;
    const hosp = verifiedHospitals.find((h) => String(h.id) === String(id));
    if (hosp) {
      setValue('hospital_name', hosp.hospital_name);
      setValue('registration_number', hosp.registration_number);
      setValue('hospital_type', hosp.hospital_type);
      setValue('specialization', hosp.specializations || hosp.specialization);
      setValue('address', hosp.address);
      setValue('city', hosp.city);
      setValue('district', hosp.district);
      setValue('state', hosp.state);
      setValue('pincode', hosp.pincode);
      setValue('contact_number', hosp.contact_number);
      setValue('official_email', hosp.official_email);
      setValue('doctor_in_charge', hosp.doctor_in_charge);
    }
  };

  const onSubmit = async (data) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        registration_number: data.registration_number ? data.registration_number.trim() : '',
        visit_date: data.visit_date && data.visit_date.trim() !== '' ? data.visit_date : null,
        additional_notes: data.additional_notes ? data.additional_notes.trim() : '',
      };

      await recordService.createRecord(payload);
      navigate('/patient/dashboard');
    } catch (err) {
      console.error('Save hospital error', err);
      setServerError(extractErrorMessage(err, 'Failed to save hospital details. Please check form.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
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
          <Building2 className="w-3.5 h-3.5 text-teal-400" />
          Hospital Records Entry
        </div>
        <h1 className="text-3xl font-extrabold text-white">Add Hospital Details</h1>
        <p className="mt-2 text-slate-400 text-sm max-w-lg mx-auto">
          Save attending medical facility details to your account to organize treatment records, scans, and doctor certificates.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-800 bg-slate-900/95 shadow-2xl">
        {/* Predefined Directory Autofill */}
        {verifiedHospitals.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-teal-500/10 border border-teal-500/25">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Quick Fill from Verified Hospital Directory
            </div>
            <select
              onChange={handleSelectPredefined}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
              defaultValue=""
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">
                -- Select a verified hospital to auto-fill details --
              </option>
              {verifiedHospitals.map((hosp) => (
                <option key={hosp.id} value={hosp.id} className="bg-slate-900 text-white">
                  {hosp.hospital_name} ({hosp.registration_number}) &bull; {hosp.city}
                </option>
              ))}
            </select>
          </div>
        )}

        <AlertMessage type="error" message={serverError} onClose={() => setServerError(null)} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hospital Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Apollo Specialty Hospital"
                {...register('hospital_name', { required: 'Hospital name is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.hospital_name && (
                <p className="text-xs text-rose-400 mt-1">{errors.hospital_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hospital Registration Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. HOSP-TN-2024-8891"
                {...register('registration_number')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hospital Type *
              </label>
              <input
                type="text"
                placeholder="e.g. Multi-Specialty, Tertiary Care, Clinic"
                {...register('hospital_type', { required: 'Hospital type is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.hospital_type && (
                <p className="text-xs text-rose-400 mt-1">{errors.hospital_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Doctor-in-Charge / Attending Physician *
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. K. S. Ramanathan, MD"
                {...register('doctor_in_charge', { required: 'Doctor in charge is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.doctor_in_charge && (
                <p className="text-xs text-rose-400 mt-1">{errors.doctor_in_charge.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hospital Contact Phone *
              </label>
              <input
                type="text"
                placeholder="e.g. +91 44 2829 0200"
                {...register('contact_number', { required: 'Contact number is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.contact_number && (
                <p className="text-xs text-rose-400 mt-1">{errors.contact_number.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hospital Email *
              </label>
              <input
                type="email"
                placeholder="e.g. contact@apollohospital.org"
                {...register('official_email', { required: 'Hospital email is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.official_email && (
                <p className="text-xs text-rose-400 mt-1">{errors.official_email.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Medical Specialization *
              </label>
              <input
                type="text"
                placeholder="e.g. Cardiology, Neurology, Orthopedics, Intensive Care"
                {...register('specialization', { required: 'Specialization is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.specialization && (
                <p className="text-xs text-rose-400 mt-1">{errors.specialization.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hospital Full Address *
              </label>
              <input
                type="text"
                placeholder="e.g. No. 21 Greams Lane, Thousand Lights"
                {...register('address', { required: 'Hospital address is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.address && (
                <p className="text-xs text-rose-400 mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">City *</label>
              <input
                type="text"
                placeholder="e.g. Chennai"
                {...register('city', { required: 'City is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.city && <p className="text-xs text-rose-400 mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">District *</label>
              <input
                type="text"
                placeholder="e.g. Chennai"
                {...register('district', { required: 'District is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.district && (
                <p className="text-xs text-rose-400 mt-1">{errors.district.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">State *</label>
              <input
                type="text"
                placeholder="e.g. Tamil Nadu"
                {...register('state', { required: 'State is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.state && <p className="text-xs text-rose-400 mt-1">{errors.state.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">PIN Code *</label>
              <input
                type="text"
                placeholder="e.g. 600006"
                {...register('pincode', { required: 'PIN code is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.pincode && (
                <p className="text-xs text-rose-400 mt-1">{errors.pincode.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date of Visit or Admission (Optional)
              </label>
              <input
                type="date"
                {...register('visit_date')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional Notes / Case Summary (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Inpatient for routine procedure, regular checkup"
                {...register('additional_notes')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Buttons: Save, Cancel, Reset Form */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => reset(defaultValues)}
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Hospital Details...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Hospital Details
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHospitalPage;
