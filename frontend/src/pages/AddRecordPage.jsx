import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Plus, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { recordFormSchema } from '../validation/schemas';
import { recordService } from '../services/recordService';
import { hospitalService } from '../services/hospitalService';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';

const AddRecordPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [registeredHospitals, setRegisteredHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      hospital_type: 'Multi-Specialty Hospital',
      state: 'Tamil Nadu',
      city: 'Chennai',
      district: 'Chennai',
      specializations: 'General Medicine, Emergency Care',
      facilities: '24/7 Emergency, Pharmacy, Diagnostic Lab',
    },
  });

  useEffect(() => {
    // Fetch registered hospitals directory for quick selection
    const loadHospitals = async () => {
      setLoadingHospitals(true);
      try {
        const res = await hospitalService.listHospitals();
        setRegisteredHospitals(res.results || []);
      } catch (e) {
        console.warn('Could not load hospitals directory', e);
      } finally {
        setLoadingHospitals(false);
      }
    };
    loadHospitals();
  }, []);

  const handleSelectHospital = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const matched = registeredHospitals.find((h) => String(h.id) === String(selectedId));
    if (matched) {
      setValue('hospital_name', matched.hospital_name, { shouldValidate: true });
      setValue('registration_number', matched.registration_number, { shouldValidate: true });
      setValue('hospital_type', matched.hospital_type, { shouldValidate: true });
      setValue('specializations', matched.specializations, { shouldValidate: true });
      setValue('address', matched.address, { shouldValidate: true });
      setValue('city', matched.city, { shouldValidate: true });
      setValue('district', matched.district, { shouldValidate: true });
      setValue('state', matched.state, { shouldValidate: true });
      setValue('pincode', matched.pincode, { shouldValidate: true });
      setValue('contact_number', matched.contact_number, { shouldValidate: true });
      setValue('official_email', matched.official_email, { shouldValidate: true });
      setValue('doctor_in_charge', matched.doctor_in_charge, { shouldValidate: true });
      setValue('facilities', matched.facilities, { shouldValidate: true });
      setValue('license_number', matched.license_number, { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const created = await recordService.createRecord(data);
      // Navigate to the newly created record's details or QR page
      navigate(`/records/${created.id}`);
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Failed to save hospital record. Please check the form.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={user?.role === 'hospital' ? '/hospital/dashboard' : '/patient/dashboard'}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold mb-3">
          <Building2 className="w-3.5 h-3.5 text-teal-400" />
          Hospital Details Management
        </div>
        <h1 className="text-3xl font-extrabold text-white">Add Hospital Details</h1>
        <p className="mt-2 text-slate-400 text-sm max-w-lg mx-auto">
          Add medical center information to generate an instant verification QR code and official clinical summary.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-800 bg-slate-900/95 shadow-2xl">
        {/* Quick autofill option */}
        {registeredHospitals.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-teal-500/10 border border-teal-500/25">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Quick Fill from Registered Healthcare Centers Directory
            </div>
            <select
              onChange={handleSelectHospital}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
              defaultValue=""
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">
                -- Select a verified hospital to auto-populate details --
              </option>
              {registeredHospitals.map((hosp) => (
                <option key={hosp.id} value={hosp.id} className="bg-slate-900 text-white">
                  {hosp.hospital_name} ({hosp.registration_number}) - {hosp.city}
                </option>
              ))}
            </select>
          </div>
        )}

        <AlertMessage type="error" message={serverError} onClose={() => setServerError(null)} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hospital Name *</label>
              <input
                type="text"
                placeholder="e.g. Apollo Specialty Hospital"
                {...register('hospital_name')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.hospital_name && <p className="text-xs text-rose-400 mt-1">{errors.hospital_name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registration Number *</label>
              <input
                type="text"
                placeholder="e.g. HOSP-TN-2024-8891"
                {...register('registration_number')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.registration_number && (
                <p className="text-xs text-rose-400 mt-1">{errors.registration_number.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hospital Type *</label>
              <input
                type="text"
                placeholder="e.g. Multi-Specialty, General, Clinic"
                {...register('hospital_type')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.hospital_type && <p className="text-xs text-rose-400 mt-1">{errors.hospital_type.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Medical License Number *</label>
              <input
                type="text"
                placeholder="e.g. LIC-MED-TN-99824"
                {...register('license_number')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.license_number && (
                <p className="text-xs text-rose-400 mt-1">{errors.license_number.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Doctor-in-Charge *</label>
              <input
                type="text"
                placeholder="e.g. Dr. K. S. Ramanathan, MD"
                {...register('doctor_in_charge')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.doctor_in_charge && (
                <p className="text-xs text-rose-400 mt-1">{errors.doctor_in_charge.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Contact Phone *</label>
              <input
                type="text"
                placeholder="e.g. +91 44 2829 0200"
                {...register('contact_number')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.contact_number && (
                <p className="text-xs text-rose-400 mt-1">{errors.contact_number.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email *</label>
              <input
                type="email"
                placeholder="e.g. contact@hospital.org"
                {...register('official_email')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.official_email && (
                <p className="text-xs text-rose-400 mt-1">{errors.official_email.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Specializations *</label>
              <input
                type="text"
                placeholder="e.g. Cardiology, Neurology, Orthopedics, Pediatrics"
                {...register('specializations')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.specializations && (
                <p className="text-xs text-rose-400 mt-1">{errors.specializations.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Facilities *</label>
              <textarea
                rows={2}
                placeholder="e.g. 24/7 Trauma Emergency, 64-Slice CT, 3T MRI, 12 Modular OTs, ICU"
                {...register('facilities')}
                className="w-full glass-input rounded-xl px-4 py-2 text-sm"
              />
              {errors.facilities && <p className="text-xs text-rose-400 mt-1">{errors.facilities.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Street Address *</label>
              <input
                type="text"
                placeholder="e.g. No. 21 Greams Lane, Thousand Lights"
                {...register('address')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.address && <p className="text-xs text-rose-400 mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">City *</label>
              <input
                type="text"
                placeholder="e.g. Chennai"
                {...register('city')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.city && <p className="text-xs text-rose-400 mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">District *</label>
              <input
                type="text"
                placeholder="e.g. Chennai"
                {...register('district')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.district && <p className="text-xs text-rose-400 mt-1">{errors.district.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">State *</label>
              <input
                type="text"
                placeholder="e.g. Tamil Nadu"
                {...register('state')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.state && <p className="text-xs text-rose-400 mt-1">{errors.state.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">PIN / Postal Code *</label>
              <input
                type="text"
                placeholder="e.g. 600006"
                {...register('pincode')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.pincode && <p className="text-xs text-rose-400 mt-1">{errors.pincode.message}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Link
              to={user?.role === 'hospital' ? '/hospital/dashboard' : '/patient/dashboard'}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving medical record securely...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Save Hospital Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordPage;
