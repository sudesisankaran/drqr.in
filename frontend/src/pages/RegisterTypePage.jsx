import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import DRQRLogo from '../components/common/DRQRLogo';

const RegisterTypePage = () => {
  return (
    <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12 flex flex-col items-center">
        <Link to="/" className="mb-4 inline-block group">
          <DRQRLogo size="lg" showSubtitle={false} />
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          DRQR Portal Registration
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Select Account Type</h1>
        <p className="mt-2 text-slate-400 text-sm max-w-md mx-auto">
          Choose whether you are registering an official healthcare facility or creating a personal patient record profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hospital Card */}
        <Link
          to="/register/hospital"
          className="group glass-card rounded-2xl p-8 border border-teal-500/20 hover:border-teal-500/50 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white group-hover:text-teal-300 transition-colors">
              Hospital Registration
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              For hospitals, clinics, and health centers. Requires official registration number, medical license, facilities list, and doctor-in-charge details.
            </p>
            <div className="mt-6 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Dedicated Hospital Profile Dashboard
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Manage Authorized Medical Records
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Official QR Stamp & Clinical Summary
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-teal-400 font-semibold text-sm">
            <span>Proceed with Hospital Setup</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Patient Card */}
        <Link
          to="/register/patient"
          className="group glass-card rounded-2xl p-8 border border-emerald-500/20 hover:border-emerald-500/50 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
              Patient Registration
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              For individuals managing their health facility records. Automatically assigns a unique Patient Reference ID for secure record tracking.
            </p>
            <div className="mt-6 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Automatic Unique Patient Reference ID
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Add & Organize Hospital Records
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Instant QR Verification & Digital Dossier
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-emerald-400 font-semibold text-sm">
            <span>Proceed with Patient Setup</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="text-center mt-12 text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-4">
          Sign In here
        </Link>
      </div>
    </div>
  );
};

export default RegisterTypePage;
