import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, LogIn, Loader2, ArrowRight, Building2, User, KeyRound } from 'lucide-react';
import { loginSchema } from '../validation/schemas';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';
import DRQRLogo from '../components/common/DRQRLogo';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('session_expired') === '1';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await login(data.email, data.password);
      const role = res.user?.role;
      const destination = location.state?.from?.pathname || (role === 'hospital' ? '/hospital/dashboard' : '/patient/dashboard');
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Invalid credentials. Please verify your email and password.'));
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 flex flex-col items-center">
        <Link to="/" className="mb-4 inline-block group">
          <DRQRLogo size="lg" showSubtitle={false} />
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          Secure Healthcare Portal Authentication
        </div>
        <h1 className="text-3xl font-extrabold text-white">Sign In</h1>
        <p className="mt-2 text-slate-400 text-sm">
          Access your authorized medical center or patient dashboard.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/95 shadow-2xl">
        {sessionExpired && (
          <AlertMessage
            type="warning"
            message="Your session has expired. Please sign in again to continue."
            className="mb-4"
          />
        )}

        <AlertMessage type="error" message={serverError} onClose={() => setServerError(null)} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email *</label>
            <input
              type="email"
              placeholder="name@hospital.com or name@patient.com"
              {...register('email')}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              autoComplete="username"
            />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password *</label>
              <Link to="/forgot-password" className="text-xs text-teal-400 hover:text-teal-300">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              autoComplete="current-password"
            />
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In to Dashboard
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Instant One-Click Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillCredentials('apollo@hospital.com', 'Password123!')}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-teal-950/50 text-slate-300 hover:text-teal-300 border border-slate-700/60 hover:border-teal-500/40 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              Demo Hospital
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('john@patient.com', 'Password123!')}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-950/50 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/40 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Demo Patient
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-teal-400 hover:text-teal-300 font-semibold underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
