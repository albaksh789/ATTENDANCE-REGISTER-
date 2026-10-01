import React, { useState } from 'react';
import { Student, Tuition } from '../../types';
import { X, Save, UserPlus, UserCheck } from 'lucide-react';

interface AddEditStudentModalProps {
  student?: Student | null;
  tuitions: Tuition[];
  onSave: (student: Student) => void;
  onClose: () => void;
}

export const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  student,
  tuitions,
  onSave,
  onClose,
}) => {
  const [fullName, setFullName] = useState(student?.fullName || '');
  const [tuitionId, setTuitionId] = useState(student?.tuitionId || (tuitions[0]?.id || ''));
  const [parentName, setParentName] = useState(student?.parentName || '');
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || '');
  const [monthlyFee, setMonthlyFee] = useState<number>(student?.monthlyFee || 2000);
  const [admissionDate, setAdmissionDate] = useState(
    student?.admissionDate || new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<'Active' | 'Inactive'>(student?.status || 'Active');
  const [notes, setNotes] = useState(student?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !parentName.trim() || !parentPhone.trim()) return;

    const selectedTuition = tuitions.find((t) => t.id === tuitionId);

    const updatedStudent: Student = {
      id: student?.id || `s-${Date.now()}`,
      fullName: fullName.trim(),
      tuitionId,
      tuitionName: selectedTuition?.name || 'Tuition Batch',
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      monthlyFee: Number(monthlyFee),
      admissionDate,
      status,
      notes: notes.trim(),
      createdAt: student?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedStudent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              {student ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <h3 className="font-bold text-base text-white">
              {student ? 'Edit Student Details' : 'Register New Student'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Student Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Muhammad Abdullah"
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tuition Batch *</label>
              <select
                value={tuitionId}
                onChange={(e) => setTuitionId(e.target.value)}
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                {tuitions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.timing})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Student Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Active">Active (فعال)</option>
                <option value="Inactive">Inactive (غیر فعال)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Parent / Guardian Name *</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Parent Mobile (for Login & WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="e.g. 03001234501"
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Monthly Tuition Fee (Rs.) *</label>
              <input
                type="number"
                required
                min="0"
                step="100"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Admission Date *</label>
              <input
                type="date"
                required
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Additional Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Lesson progress, specific instructions or emergency details..."
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{student ? 'Update Record' : 'Complete Registration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
