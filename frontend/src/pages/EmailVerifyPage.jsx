import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const EmailVerifyPage = () => {
  return (
    <div className="py-20 max-w-md mx-auto px-4 text-center">
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 bg-slate-900/95 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Email Verified</h1>
        <p className="mt-3 text-sm text-slate-300 leading-relaxed">
          Your email address has been verified. You have full access to your medical health care management dashboard.
        </p>

        <div className="mt-8">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-600/30 transition-all"
          >
            Sign In to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerifyPage;
