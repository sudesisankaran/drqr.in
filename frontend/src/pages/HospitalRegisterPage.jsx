import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { hospitalRegistrationSchema } from '../validation/schemas';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';
import DRQRLogo from '../components/common/DRQRLogo';

const HospitalRegisterPage = () => {
  const { registerHospital } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hospitalRegistrationSchema),
    defaultValues: {
      hospital_type: 'Multi-Specialty Hospital',
      state: 'Tamil Nadu',
    },
  });

  const onSubmit = async (data) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await registerHospital(data);
      navigate('/hospital/dashboard');
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Hospital registration failed. Please review the form.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 flex flex-col items-center">
        <Link to="/" className="mb-4 inline-block group">
          <DRQRLogo size="lg" showSubtitle={false} />
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold mb-3">
          <Building2 className="w-3.5 h-3.5 text-teal-400" />
          Official Medical Center Registration
        </div>
        <h1 className="text-3xl font-extrabold text-white">Hospital Registration</h1>
        <p className="mt-2 text-slate-400 text-sm max-w-lg mx-auto">
          Register your hospital or clinic facility with DRQR to manage verified records, issue secure QR codes, and generate official medical documents.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-800 bg-slate-900/95 shadow-2xl">
        <AlertMessage type="error" message={serverError} onClose={() => setServerError(null)} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Facility Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-800 pb-2 mb-4">
              1. Facility Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hospital Name *</label>
                <input
                  type="text"
                  placeholder="e.g. City Care Multi-Specialty Hospital"
                  {...register('hospital_name')}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
                {errors.hospital_name && (
                  <p className="text-xs text-rose-400 mt-1">{errors.hospital_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registration Number *</label>
                <input
                  type="text"
                  placeholder="e.g. HOSP-TN-2024-998"
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
                  placeholder="e.g. Multi-Specialty, Tertiary Care, Clinic"
                  {...register('hospital_type')}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
                {errors.hospital_type && (
                  <p className="text-xs text-rose-400 mt-1">{errors.hospital_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Medical License Number *</label>
                <input
                  type="text"
                  placeholder="e.g. LIC-MED-99482"
                  {...register('license_number')}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
                {errors.license_number && (
                  <p className="text-xs text-rose-400 mt-1">{errors.license_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Doctor-in-Charge / Medical Superintendent *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. A. K. Sharma, MD, FRCS"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Specializations (Departments) *</label>
                <input
                  type="text"
                  placeholder="e.g. Cardiology, Neurology, Orthopedics, Pediatrics, Emergency Care"
                  {...register('specializations')}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
                {errors.specializations && (
                  <p className="text-xs text-rose-400 mt-1">{errors.specializations.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Medical Facilities *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 24/7 Trauma Emergency, 64-Slice CT, 3T MRI, 10 Modular OTs, ICU, Blood Bank"
                  {...register('facilities')}
                  className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                />
                {errors.facilities && (
                  <p className="text-xs text-rose-400 mt-1">{errors.facilities.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Address & Location */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-800 pb-2 mb-4">
              2. Location & Address Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Street Address *</label>
                <input
                  type="text"
                  placeholder="e.g. 45 Grand Medical Road, Sector 4"
                  {...register('address')}
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
                {errors.district && (
                  <p className="text-xs text-rose-400 mt-1">{errors.district.message}</p>
                )}
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
                {errors.pincode && (
                  <p className="text-xs text-rose-400 mt-1">{errors.pincode.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Facility Email *</label>
                <input
                  type="email"
                  placeholder="e.g. info@hospitalcare.org"
                  {...register('official_email')}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
                {errors.official_email && (
                  <p className="text-xs text-rose-400 mt-1">{errors.official_email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Login Credentials */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-800 pb-2 mb-4">
              3. Portal Login Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Login Email (Username) *</label>
                <input
                  type="email"
                  placeholder="e.g. admin@hospitalcare.org"
                  {...register('email')}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
                {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password *</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  {...register('password')}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
                {errors.password && (
                  <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  {...register('confirm_password')}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
                {errors.confirm_password && (
                  <p className="text-xs text-rose-400 mt-1">{errors.confirm_password.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 underline">
                Sign in to your account
              </Link>
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Hospital Profile...
                </>
              ) : (
                <>
                  Complete Hospital Registration
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

export default HospitalRegisterPage;
