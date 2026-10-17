import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { patientRegistrationSchema } from '../validation/schemas';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';
import DRQRLogo from '../components/common/DRQRLogo';

const PatientRegisterPage = () => {
  const { registerPatient } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      state: 'Tamil Nadu',
    },
  });

  const onSubmit = async (data) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        date_of_birth: data.date_of_birth && data.date_of_birth.trim() !== '' ? data.date_of_birth : null,
      };
      await registerPatient(payload);
      navigate('/patient/dashboard');
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Patient registration failed. Please check your details.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 flex flex-col items-center">
        <Link to="/" className="mb-4 inline-block group">
          <DRQRLogo size="lg" showSubtitle={false} />
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold mb-3">
          <User className="w-3.5 h-3.5 text-emerald-400" />
          Patient Personal Record Profile
        </div>
        <h1 className="text-3xl font-extrabold text-white">Patient Registration</h1>
        <p className="mt-2 text-slate-400 text-sm max-w-md mx-auto">
          Create an individual patient record account with DRQR to organize your hospital documents, generate digital QR certificates, and export verified PDFs.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-800 bg-slate-900/95 shadow-2xl">
        <div className="mb-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            Upon registration, the system will automatically allocate your cryptographically generated <b>Unique Patient Reference ID</b> for instant hospital lookup.
          </span>
        </div>

        <AlertMessage type="error" message={serverError} onClose={() => setServerError(null)} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                {...register('full_name')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.full_name && <p className="text-xs text-rose-400 mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date of Birth (Optional)</label>
              <input
                type="date"
                {...register('date_of_birth')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.date_of_birth && <p className="text-xs text-rose-400 mt-1">{errors.date_of_birth.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Phone Number *</label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                {...register('phone')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address (Login Username) *</label>
              <input
                type="email"
                placeholder="e.g. john@example.com"
                {...register('email')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Residential Address *</label>
              <input
                type="text"
                placeholder="e.g. 12/B Gandhi Street, Anna Nagar"
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
                placeholder="e.g. 600040"
                {...register('pincode')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.pincode && <p className="text-xs text-rose-400 mt-1">{errors.pincode.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Password *</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                {...register('password')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password *</label>
              <input
                type="password"
                placeholder="Re-enter password"
                {...register('confirm_password')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.confirm_password && <p className="text-xs text-rose-400 mt-1">{errors.confirm_password.message}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 underline">
                Sign in
              </Link>
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Patient Account...
                </>
              ) : (
                <>
                  Register Patient Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegisterPage;
