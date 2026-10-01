import React, { useState } from 'react';
import { FeeRecord, Student } from '../../types';
import { X, CheckCircle, CreditCard, Banknote } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  fee: FeeRecord;
  student?: Student;
  onSave: (updatedFee: FeeRecord) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  fee,
  student,
  onSave,
  onClose,
}) => {
  const [paidAmount, setPaidAmount] = useState<number>(fee.paidAmount || fee.totalAmount);
  const [paymentMethod, setPaymentMethod] = useState(fee.paymentMethod || 'Cash');
  const [paymentDate, setPaymentDate] = useState(
    fee.paymentDate || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(fee.notes || '');

  const total = fee.totalAmount;
  const balance = Math.max(0, total - Number(paidAmount));
  const computedStatus =
    paidAmount >= total ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Pending';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (computedStatus === 'Paid') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }
    }

    const updated: FeeRecord = {
      ...fee,
      paidAmount: Number(paidAmount),
      balance,
      status: computedStatus,
      paymentMethod,
      paymentDate,
      notes,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Record Tuition Fee</h3>
              <p className="text-xs text-slate-400">{fee.studentName} — {fee.month}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Total Monthly Tuition Fee:</span>
              <span className="font-bold text-white font-mono">Rs. {fee.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Receipt Number:</span>
              <span className="font-mono text-emerald-400">{fee.receiptNumber}</span>
            </div>
            {student?.parentPhone && (
              <div className="flex justify-between text-slate-400">
                <span>Parent Mobile:</span>
                <span className="font-mono">{student.parentPhone}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">Amount Received (Rs.) *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaidAmount(total)}
                  className="text-[11px] font-bold text-emerald-400 hover:underline"
                >
                  Full (Rs. {total})
                </button>
                <button
                  type="button"
                  onClick={() => setPaidAmount(Math.round(total / 2))}
                  className="text-[11px] font-bold text-amber-400 hover:underline"
                >
                  Half (Rs. {Math.round(total / 2)})
                </button>
              </div>
            </div>
            <input
              type="number"
              required
              min="0"
              max={total}
              step="50"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2.5 text-white font-mono text-base font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Cash">Cash (نقد)</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Online / UPI">Online Transfer / UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
              </input>
            </div>
          </div>

          <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-800/40 flex justify-between items-center">
            <div>
              <span className="text-[11px] text-slate-400 block">Remaining Balance</span>
              <span className={`font-mono font-bold text-sm ${balance === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                Rs. {balance.toLocaleString()}
              </span>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              computedStatus === 'Paid'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : computedStatus === 'Partially Paid'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {computedStatus}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Payment Note</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received by Albaksh Molsab in person"
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
              <CheckCircle className="w-4 h-4" />
              <span>Save & Update Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
