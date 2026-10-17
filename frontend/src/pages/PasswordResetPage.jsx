import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';

const PasswordResetPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialToken = queryParams.get('token') || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      token: initialToken,
      new_password: '',
      confirm_password: '',
    },
  });

  const newPassword = watch('new_password');

  const onSubmit = async (data) => {
    if (data.new_password !== data.confirm_password) {
      setServerError('New passwords do not match.');
      return;
    }
    setServerError(null);
    setSubmitting(true);
    try {
      await authService.confirmPasswordReset(data);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Password reset failed. Invalid or expired token.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Create New Password</h1>
        <p className="mt-2 text-slate-400 text-sm">
          Enter your reset verification token and choose a secure new password.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/95 shadow-2xl">
        <AlertMessage type="error" message={serverError} onClose={() => setServerError(null)} className="mb-4" />

        {success ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Password Updated!</h3>
            <p className="text-xs text-slate-300 mt-1">
              Your password has been changed. Redirecting to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reset Token *</label>
              <input
                type="text"
                placeholder="Paste the reset token here"
                {...register('token', { required: 'Reset token is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm font-mono text-xs"
              />
              {errors.token && <p className="text-xs text-rose-400 mt-1">{errors.token.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password *</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                {...register('new_password', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.new_password && (
                <p className="text-xs text-rose-400 mt-1">{errors.new_password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password *</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                {...register('confirm_password', {
                  required: 'Please confirm your new password',
                  validate: (val) => val === newPassword || 'Passwords do not match',
                })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.confirm_password && (
                <p className="text-xs text-rose-400 mt-1">{errors.confirm_password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Set New Password'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
