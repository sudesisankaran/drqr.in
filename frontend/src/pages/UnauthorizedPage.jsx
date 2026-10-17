import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage = () => {
  const { user } = useAuth();

  const homeDestination = user?.role === 'hospital' ? '/hospital/dashboard' : user?.role === 'patient' ? '/patient/dashboard' : '/';

  return (
    <div className="py-24 max-w-md mx-auto px-4 text-center">
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 bg-slate-900/95 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-white">Access Unauthorized</h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          You do not have the required permissions or role authorization to access this healthcare resource.
        </p>

        <div className="mt-8 flex flex-col gap-2">
          <Link
            to={homeDestination}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/30 transition-all"
          >
            <Home className="w-4 h-4" />
            Return to Authorized Dashboard
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
