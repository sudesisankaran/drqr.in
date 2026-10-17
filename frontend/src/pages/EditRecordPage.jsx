import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { recordFormSchema } from '../validation/schemas';
import { recordService } from '../services/recordService';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EditRecordPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recordFormSchema),
  });

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const data = await recordService.getRecord(id);
        reset(data);
      } catch (err) {
        console.error('Failed to load record:', err);
        setServerError('Could not load record. You may not have permission to edit this record.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id, reset]);

  const onSubmit = async (data) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await recordService.updateRecord(id, data);
      navigate(`/records/${id}`);
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Failed to update record.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading record details..." />;
  }

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/records/${id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Record
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold mb-3">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          Update Record
        </div>
        <h1 className="text-3xl font-extrabold text-white">Edit Hospital Record</h1>
        <p className="mt-2 text-slate-400 text-sm">
          Update facility and contact details. Updated information will be reflected across QR and PDF certificates.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-800 bg-slate-900/95 shadow-2xl">
        <AlertMessage type="error" message={serverError} onClose={() => setServerError(null)} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hospital Name *</label>
              <input
                type="text"
                {...register('hospital_name')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.hospital_name && <p className="text-xs text-rose-400 mt-1">{errors.hospital_name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registration Number *</label>
              <input
                type="text"
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
                {...register('hospital_type')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.hospital_type && <p className="text-xs text-rose-400 mt-1">{errors.hospital_type.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Medical License Number *</label>
              <input
                type="text"
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
                {...register('doctor_in_charge')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.doctor_in_charge && (
                <p className="text-xs text-rose-400 mt-1">{errors.doctor_in_charge.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Phone *</label>
              <input
                type="text"
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
                {...register('facilities')}
                className="w-full glass-input rounded-xl px-4 py-2 text-sm"
              />
              {errors.facilities && <p className="text-xs text-rose-400 mt-1">{errors.facilities.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Street Address *</label>
              <input
                type="text"
                {...register('address')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.address && <p className="text-xs text-rose-400 mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">City *</label>
              <input
                type="text"
                {...register('city')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.city && <p className="text-xs text-rose-400 mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">District *</label>
              <input
                type="text"
                {...register('district')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.district && <p className="text-xs text-rose-400 mt-1">{errors.district.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">State *</label>
              <input
                type="text"
                {...register('state')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.state && <p className="text-xs text-rose-400 mt-1">{errors.state.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">PIN / Postal Code *</label>
              <input
                type="text"
                {...register('pincode')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.pincode && <p className="text-xs text-rose-400 mt-1">{errors.pincode.message}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Link
              to={`/records/${id}`}
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecordPage;
