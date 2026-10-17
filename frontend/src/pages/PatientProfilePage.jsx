import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { User, Save, ArrowLeft, Loader2, Copy, Check, MapPin, Mail, Phone, Calendar } from 'lucide-react';
import { patientService } from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PatientProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await patientService.getMyPatient();
        setProfile(res.data);
        reset(res.data);
      } catch (err) {
        console.error('Error fetching profile', err);
        setServerError('Could not load patient profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const handleCopyRef = async () => {
    if (!profile?.patient_reference_id) return;
    try {
      await navigator.clipboard.writeText(profile.patient_reference_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmit = async (data) => {
    setServerError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await patientService.updateMyPatient(data);
      setProfile(res.data);
      await refreshUser();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      console.error('Update profile error', err);
      setServerError(extractErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading patient profile..." />;
  }

  return (
    <div className="py-10 max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/patient/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patient Dashboard
        </Link>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold mb-2">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          Patient Profile Management
        </div>
        <h1 className="text-3xl font-extrabold text-white">My Patient Profile</h1>
      </div>

      {profile && (
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between border border-teal-500/30 bg-slate-950/60">
          <div>
            <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">
              Unique Patient Reference ID
            </div>
            <div className="font-mono text-lg font-extrabold text-white mt-0.5">
              {profile.patient_reference_id}
            </div>
          </div>
          <button
            onClick={handleCopyRef}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy ID'}</span>
          </button>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-800 bg-slate-900/95 shadow-xl">
        <AlertMessage type="error" message={serverError} onClose={() => setServerError(null)} className="mb-6" />
        <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                {...register('full_name', { required: 'Full name is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.full_name && (
                <p className="text-xs text-rose-400 mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number *</label>
              <input
                type="text"
                {...register('phone', { required: 'Phone number is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.phone && (
                <p className="text-xs text-rose-400 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date of Birth</label>
              <input
                type="date"
                {...register('date_of_birth')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Residential Address *</label>
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
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfilePage;
