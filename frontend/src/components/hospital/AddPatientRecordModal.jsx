import React, { useState } from 'react';
import { Plus, X, Loader2, AlertCircle, Calendar, Stethoscope } from 'lucide-react';
import { hospitalPatientService } from '../../services/hospitalPatientService';
import { extractErrorMessage } from '../../services/api';

const AddPatientRecordModal = ({ isOpen, onClose, patient, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    record_type: 'General Outpatient Visit',
    record_date: new Date().toISOString().split('T')[0],
    description: '',
    doctor_in_charge: '',
    specialization: '',
    additional_notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !patient) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Record Title is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await hospitalPatientService.addPatientRecord(patient.id, formData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to add record:', err);
      setError(extractErrorMessage(err, 'Failed to save clinical record.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl glass-panel shadow-2xl border border-slate-700/80 bg-slate-900/95 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Add Hospital Visit Record</h3>
              <p className="text-[11px] text-slate-400">
                Patient: <span className="text-teal-300 font-semibold">{patient.full_name || patient.effective_full_name}</span> ({patient.patient_reference_id})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Visit Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Cardiology OPD Follow-up & ECG Review"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Record Type</label>
              <select
                name="record_type"
                value={formData.record_type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="General Outpatient Visit">General Outpatient Visit</option>
                <option value="Inpatient Admission">Inpatient Admission</option>
                <option value="Emergency Consultation">Emergency Consultation</option>
                <option value="Routine Health Checkup">Routine Health Checkup</option>
                <option value="Specialist Follow-up">Specialist Follow-up</option>
                <option value="Post-Operative Review">Post-Operative Review</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Visit Date</label>
              <input
                type="date"
                name="record_date"
                value={formData.record_date}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Doctor-in-Charge</label>
              <input
                type="text"
                name="doctor_in_charge"
                value={formData.doctor_in_charge}
                onChange={handleChange}
                placeholder="Consulting physician name"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Cardiology"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Clinical Findings & Notes</label>
            <textarea
              name="additional_notes"
              rows={3}
              value={formData.additional_notes}
              onChange={handleChange}
              placeholder="Clinical observation, symptoms, vitals, prescriptions, or advice"
              className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-lg shadow-teal-500/25 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Visit Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientRecordModal;
