import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings, User, Building2, Lock, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { hospitalService } from '../services/hospitalService';
import { patientService } from '../services/patientService';
import { changePasswordSchema } from '../validation/schemas';
import { extractErrorMessage } from '../services/api';
import AlertMessage from '../components/common/AlertMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SettingsPage = () => {
  const { user, refreshUser, isHospital, isPatient } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm();

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        if (isHospital) {
          const res = await hospitalService.getMyHospital();
          resetProfile(res.data);
        } else if (isPatient) {
          const res = await patientService.getMyPatient();
          resetProfile(res.data);
        }
      } catch (err) {
        console.error('Error fetching settings profile', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [isHospital, isPatient, resetProfile]);

  const onUpdateProfile = async (data) => {
    setProfileError(null);
    setProfileSuccess(null);
    setSubmittingProfile(true);
    try {
      if (isHospital) {
        await hospitalService.updateMyHospital(data);
      } else {
        await patientService.updateMyPatient(data);
      }
      await refreshUser();
      setProfileSuccess('Profile details updated successfully.');
    } catch (err) {
      setProfileError(extractErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSubmittingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setSubmittingPassword(true);
    try {
      await authService.changePassword(data);
      setPasswordSuccess('Password changed successfully.');
      resetPassword();
    } catch (err) {
      setPasswordError(extractErrorMessage(err, 'Failed to change password.'));
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading account settings..." />;
  }

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5 text-teal-400" />
          Account & Security
        </div>
        <h1 className="text-3xl font-extrabold text-white">Profile Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your account credentials, contact information, and security preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'profile'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          {isHospital ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
          Profile Information
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'security'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Lock className="w-4 h-4" />
          Password & Security
        </button>
      </div>

      {/* Tab 1: Profile Information */}
      {activeTab === 'profile' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/95 shadow-xl">
          <AlertMessage type="error" message={profileError} onClose={() => setProfileError(null)} className="mb-4" />
          <AlertMessage type="success" message={profileSuccess} onClose={() => setProfileSuccess(null)} className="mb-4" />

          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {isHospital ? (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hospital Name *</label>
                    <input
                      type="text"
                      {...registerProfile('hospital_name', { required: 'Hospital name is required' })}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hospital Type *</label>
                    <input
                      type="text"
                      {...registerProfile('hospital_type')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Doctor-in-Charge *</label>
                    <input
                      type="text"
                      {...registerProfile('doctor_in_charge')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Contact Phone *</label>
                    <input
                      type="text"
                      {...registerProfile('contact_number')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email *</label>
                    <input
                      type="email"
                      {...registerProfile('official_email')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Specializations</label>
                    <input
                      type="text"
                      {...registerProfile('specializations')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Facilities</label>
                    <textarea
                      rows={2}
                      {...registerProfile('facilities')}
                      className="w-full glass-input rounded-xl px-4 py-2 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Street Address</label>
                    <input
                      type="text"
                      {...registerProfile('address')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                    <input
                      type="text"
                      {...registerProfile('city')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">District</label>
                    <input
                      type="text"
                      {...registerProfile('district')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">State</label>
                    <input
                      type="text"
                      {...registerProfile('state')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      {...registerProfile('pincode')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      {...registerProfile('full_name')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number *</label>
                    <input
                      type="text"
                      {...registerProfile('phone')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      {...registerProfile('date_of_birth')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Residential Address</label>
                    <input
                      type="text"
                      {...registerProfile('address')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                    <input
                      type="text"
                      {...registerProfile('city')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">District</label>
                    <input
                      type="text"
                      {...registerProfile('district')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">State</label>
                    <input
                      type="text"
                      {...registerProfile('state')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      {...registerProfile('pincode')}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={submittingProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all disabled:opacity-50"
              >
                {submittingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Password & Security */}
      {activeTab === 'security' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 bg-slate-900/95 shadow-xl max-w-xl">
          <AlertMessage type="error" message={passwordError} onClose={() => setPasswordError(null)} className="mb-4" />
          <AlertMessage type="success" message={passwordSuccess} onClose={() => setPasswordSuccess(null)} className="mb-4" />

          <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Password *</label>
              <input
                type="password"
                placeholder="Enter existing password"
                {...registerPassword('old_password')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {passwordErrors.old_password && (
                <p className="text-xs text-rose-400 mt-1">{passwordErrors.old_password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password *</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                {...registerPassword('new_password')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {passwordErrors.new_password && (
                <p className="text-xs text-rose-400 mt-1">{passwordErrors.new_password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password *</label>
              <input
                type="password"
                placeholder="Re-type new password"
                {...registerPassword('confirm_password')}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
              />
              {passwordErrors.confirm_password && (
                <p className="text-xs text-rose-400 mt-1">{passwordErrors.confirm_password.message}</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={submittingPassword}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all disabled:opacity-50"
              >
                {submittingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
