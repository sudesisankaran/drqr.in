import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  User,
  QrCode,
  FileText,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import QRCodeCard from '../components/qr/QRCodeCard';

const LandingPage = () => {
  return (
    <div className="relative overflow-hidden bg-radial-gradient">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs sm:text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-teal-400" />
          DRQR Healthcare Network &bull; Secure Digital Health Management
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Medical Health Care <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-300">Management & QR</span> Verification
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          A secure, enterprise-grade portal purpose-built for hospital registration, patient records management, permanent cryptographic QR code verification, and confidential in-website medical record access.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-base shadow-lg shadow-teal-500/30 transition-all hover:scale-105"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700 hover:border-slate-600 transition-all"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </section>

      {/* Registration Type Cards */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Choose Your Portal Access</h2>
          <p className="text-slate-400 text-sm mt-2">Dedicated interfaces designed specifically for hospitals and patients</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Hospital Card */}
          <div className="glass-card rounded-2xl p-8 border border-teal-500/30 relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/25 flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Hospital Registration</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Register licensed medical centers, multi-specialty clinics, and research hospitals. Manage official doctor profiles, hospital facilities, and verify authorized health records.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400" /> Hospital registration & license verification</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400" /> Multi-speciality & facility directory listing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400" /> Permanent patient QR and in-website clinical summary access</li>
              </ul>
            </div>
            <Link
              to="/register/hospital"
              className="mt-8 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-600/30 transition-colors"
            >
              Register as Hospital
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Patient Card */}
          <div className="glass-card rounded-2xl p-8 border border-emerald-500/30 relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mb-5">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Patient Registration</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Create a patient profile with a unique patient reference ID. Add and organize your hospital care records, access digital verification QR codes, and access confidential in-website health summaries.
              </p>
              <ul className="mt-5 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto-generated unique Patient Ref ID</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Save & manage personalized hospital records</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Secure in-website view of authorized medical documents</li>
              </ul>
            </div>
            <Link
              to="/register/patient"
              className="mt-8 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-colors"
            >
              Register as Patient
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature & Security Highlights */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Engineered for Security & Integrity</h2>
          <p className="text-slate-400 text-sm mt-2">Zero compromises on patient privacy, role enforcement, and record validation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Privacy-Safe QR Codes</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              QR codes point to secure, cryptographically verifiable endpoints. Public scans confirm hospital authenticity without leaking private patient identities.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">In-Website Clinical Dossier</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Official medical summaries rendered securely inside the website with doctor credentials, hospital registration numbers, facility breakdowns, and embedded QR stamps.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Role-Based Access Control</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Strict object-level ownership checks and end-to-end access controls. Neither patients nor hospitals can tamper with or access unauthorized records.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
