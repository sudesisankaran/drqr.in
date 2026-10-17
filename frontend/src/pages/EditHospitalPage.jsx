import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, Save, ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { recordService } from '../services/recordService';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EditHospitalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchHospital = async () => {
      setLoading(true);
      try {
        const data = await recordService.getRecord(id);
        reset({
          ...data,
          specialization: data.specialization || data.specializations,
        });
      } catch (err) {
        console.error('Fetch hospital error', err);
        setServerError('Could not load hospital details.');
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, [id, reset]);

  const onSubmit = async (data) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        visit_date: data.visit_date && data.visit_date.trim() !== '' ? data.visit_date : null,
      };
      await recordService.updateRecord(id, payload);
      navigate(`/patient/hospitals/${id}`);
    } catch (err) {
      console.error('Update hospital error', err);
      setServerError(extractErrorMessage(err, 'Failed to update hospital details.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading hospital details..." />;
  }

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/patient/hospitals/${id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hospital Overview
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold mb-3">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          Edit Hospital Details
        </div>
        <h1 className="text-3xl font-extrabold text-white">Update Hospital Information</h1>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-800 bg-slate-900/95 shadow-2xl">
        <AlertMessage type="error" message={serverError} onClose={() => setServerError(null)} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hospital Name *</label>
              <input
                type="text"
                {...register('hospital_name', { required: 'Hospital name is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.hospital_name && (
                <p className="text-xs text-rose-400 mt-1">{errors.hospital_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registration Number</label>
              <input
                type="text"
                {...register('registration_number')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hospital Type *</label>
              <input
                type="text"
                {...register('hospital_type', { required: 'Hospital type is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Doctor-in-Charge *</label>
              <input
                type="text"
                {...register('doctor_in_charge', { required: 'Doctor in charge is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Phone *</label>
              <input
                type="text"
                {...register('contact_number', { required: 'Contact phone is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email *</label>
              <input
                type="email"
                {...register('official_email', { required: 'Email is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Medical Specialization *</label>
              <input
                type="text"
                {...register('specialization', { required: 'Specialization is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hospital Address *</label>
              <input
                type="text"
                {...register('address', { required: 'Address is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">City *</label>
              <input
                type="text"
                {...register('city', { required: 'City is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">District *</label>
              <input
                type="text"
                {...register('district', { required: 'District is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">State *</label>
              <input
                type="text"
                {...register('state', { required: 'State is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">PIN Code *</label>
              <input
                type="text"
                {...register('pincode', { required: 'PIN code is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date of Visit / Admission</label>
              <input
                type="date"
                {...register('visit_date')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Additional Notes</label>
              <input
                type="text"
                {...register('additional_notes')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Link
              to={`/patient/hospitals/${id}`}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHospitalPage;
