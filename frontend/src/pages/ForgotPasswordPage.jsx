import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';

const ForgotPasswordPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email }) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await authService.requestPasswordReset(email);
      setSuccessMsg(res.message || 'If an account exists with this email, a reset token has been issued.');
      if (res.dev_token) {
        setResetToken(res.dev_token);
      }
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Failed to process password reset request.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Reset Password</h1>
        <p className="mt-2 text-slate-400 text-sm">
          Enter your registered email address and we'll generate your reset token.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/95 shadow-2xl">
        <AlertMessage type="error" message={serverError} onClose={() => setServerError(null)} className="mb-4" />
        <AlertMessage type="success" message={successMsg} className="mb-4" />

        {resetToken ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300">
              <p className="font-semibold mb-1">Development Reset Token Generated:</p>
              <p className="font-mono bg-slate-950 p-2 rounded border border-slate-800 break-all select-all">
                {resetToken}
              </p>
            </div>
            <button
              onClick={() => navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all"
            >
              Proceed to Set New Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email *</label>
              <input
                type="email"
                placeholder="doctor@hospital.com or patient@example.com"
                {...register('email', { required: 'Email address is required' })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Token...
                </>
              ) : (
                <>
                  Send Password Reset Instructions
                  <Send className="w-4 h-4" />
                </>
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

export default ForgotPasswordPage;
