import React, { useState } from 'react';
import { Tuition } from '../../types';
import { X, Save, BookOpen } from 'lucide-react';

interface AddEditTuitionModalProps {
  tuition?: Tuition | null;
  onSave: (tuition: Tuition) => void;
  onClose: () => void;
}

export const AddEditTuitionModal: React.FC<AddEditTuitionModalProps> = ({
  tuition,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(tuition?.name || '');
  const [timing, setTiming] = useState(tuition?.timing || '04:10 PM - 05:00 PM');
  const [feeDueDate, setFeeDueDate] = useState<number>(tuition?.feeDueDate || 5);
  const [days, setDays] = useState(tuition?.days || 'Mon - Fri');
  const [notes, setNotes] = useState(tuition?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !timing.trim()) return;

    const newTuition: Tuition = {
      id: tuition?.id || `t-${Date.now()}`,
      name: name.trim(),
      timing: timing.trim(),
      feeDueDate: Number(feeDueDate),
      days: days.trim(),
      teacherName: 'ALBAKSH MOLSAB',
      notes: notes.trim(),
      createdAt: tuition?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newTuition);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">
              {tuition ? 'Edit Tuition Batch' : 'Create New Tuition Batch'}
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
            <label className="block font-semibold text-slate-300 mb-1">Tuition / Batch Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Batch 10: Afternoon Hifz"
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tuition Timing *</label>
              <input
                type="text"
                required
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                placeholder="e.g. 04:10 PM - 05:00 PM"
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Monthly Fee Due Day *</label>
              <select
                value={feeDueDate}
                onChange={(e) => setFeeDueDate(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                {[1, 5, 7, 10, 15, 20, 25].map((d) => (
                  <option key={d} value={d}>
                    {d}th of every month
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Class Days</label>
            <input
              type="text"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="e.g. Mon - Sat or Daily"
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Additional Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Syllabus, specific rules, venue details..."
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
              <span>{tuition ? 'Update Batch' : 'Save Batch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
