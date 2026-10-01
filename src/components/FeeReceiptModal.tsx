import React, { useRef } from 'react';
import { FeeRecord, Student, Tuition } from '../types';
import { X, Printer, Share2, CheckCircle, Clock } from 'lucide-react';
import { AlbakshStamp } from './AlbakshStamp';
import { formatDDMMYYYY } from '../utils/dateFormatter';

interface FeeReceiptModalProps {
  fee: FeeRecord;
  student?: Student;
  tuition?: Tuition;
  onClose: () => void;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({
  fee,
  student,
  tuition,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement | null>(null);
  const formattedDate = formatDDMMYYYY(fee.paymentDate || fee.updatedAt || new Date());

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const parentPhone = (student?.parentPhone || fee.parentPhone || '').replace(/\D/g, '');
    const message = encodeURIComponent(
      `*STUDENTS REGISTER — OFFICIAL FEE RECEIPT*\n` +
      `Teacher: ALBAKSH MOLSAB\n` +
      `[★ OFFICIAL ALBAKSH MOLSAB STAMP VERIFIED ★]\n` +
      `--------------------------------\n` +
      `Receipt No: ${fee.receiptNumber}\n` +
      `Student: ${fee.studentName}\n` +
      `Tuition: ${tuition?.name || fee.tuitionId}\n` +
      `Month: ${fee.month}\n` +
      `Fee Amount: Rs. ${fee.totalAmount.toLocaleString()}\n` +
      `Amount Paid: Rs. ${fee.paidAmount.toLocaleString()}\n` +
      `Remaining Balance: Rs. ${fee.balance.toLocaleString()}\n` +
      `Status: ${fee.status}\n` +
      `Payment Date: ${formattedDate} (DD.MM.YYYY)\n` +
      `--------------------------------\n` +
      `JazakAllah Khair.\nAlbaksh Molsab`
    );

    const whatsappUrl = parentPhone
      ? `https://wa.me/${parentPhone.startsWith('92') || parentPhone.startsWith('91') ? parentPhone : `92${parentPhone.replace(/^0/, '')}`}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/60 print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Digital Fee Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 transition"
              title="Share on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div
          ref={receiptRef}
          className="p-6 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 space-y-4 print:p-8 print:bg-white print:text-black"
        >
          {/* Header */}
          <div className="text-center border-b border-emerald-500/20 pb-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 mb-2">
              <span className="font-serif font-black text-xl">SR</span>
            </div>
            <h2 className="text-lg font-black tracking-wide text-white uppercase">
              STUDENTS REGISTER
            </h2>
            <p className="text-xs font-semibold text-emerald-400">ALBAKSH MOLSAB TUITION ACADEMY</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Official Fee Payment Receipt</p>
          </div>

          {/* Receipt Meta with DD.MM.YYYY */}
          <div className="flex justify-between items-center text-xs bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Receipt No</span>
              <span className="font-mono font-bold text-emerald-300">{fee.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Date (DD.MM.YYYY)</span>
              <span className="font-mono font-bold text-emerald-300">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Student & Tuition Info */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Student Name:</span>
              <span className="font-bold text-white">{fee.studentName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Tuition Batch:</span>
              <span className="font-medium text-slate-200">{tuition?.name || fee.tuitionId}</span>
            </div>
            {student?.parentName && (
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Parent / Guardian:</span>
                <span className="font-medium text-slate-200">{student.parentName}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Billing Period:</span>
              <span className="font-semibold text-amber-300">{fee.month}</span>
            </div>
            {fee.paymentMethod && (
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-medium text-slate-200">{fee.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="bg-emerald-950/40 border border-emerald-700/40 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Total Monthly Tuition Fee:</span>
              <span className="font-semibold">Rs. {fee.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1 border-t border-emerald-800/40">
              <span>Amount Received:</span>
              <span>Rs. {fee.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-amber-400 font-semibold pt-1 border-t border-emerald-800/40">
              <span>Outstanding Balance:</span>
              <span>Rs. {fee.balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Status Badge & ALBAKSH MOLSAB STAMP */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {fee.status === 'Paid' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Fully Paid</span>
                  </div>
                ) : fee.status === 'Partially Paid' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Partially Paid</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
                    <span>Pending</span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <span className="block text-[10px] text-slate-400 font-medium">Authorized Teacher</span>
                <span className="text-xs font-serif font-black text-emerald-300 tracking-wider">
                  ALBAKSH MOLSAB
                </span>
              </div>
            </div>

            {/* Official Stamp */}
            <div className="shrink-0 flex items-center justify-center pl-2">
              <AlbakshStamp date={fee.paymentDate || fee.updatedAt} size="sm" />
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex gap-2.5 print:hidden">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Send to Parent via WhatsApp</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
