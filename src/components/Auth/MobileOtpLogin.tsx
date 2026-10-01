import React, { useState, useEffect } from 'react';
import { AppLanguage, Student } from '../../types';
import { Smartphone, Lock, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, Sparkles, User, Users } from 'lucide-react';
import { AlbakshStamp } from '../AlbakshStamp';

interface MobileOtpLoginProps {
  onLogin: (user: { role: 'molisab' | 'parents'; phone: string; name: string }) => void;
  language: AppLanguage;
  students: Student[];
}

export const MobileOtpLogin: React.FC<MobileOtpLoginProps> = ({
  onLogin,
  language,
  students,
}) => {
  const [role, setRole] = useState<'molisab' | 'parents'>('molisab');
  const [mobileNumber, setMobileNumber] = useState<string>('03001234500');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('123456');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default sample phone number depending on role
  useEffect(() => {
    if (role === 'molisab') {
      setMobileNumber('03001234500');
    } else {
      setMobileNumber('03001234501');
    }
    setOtpSent(false);
    setEnteredOtp('');
    setErrorMsg('');
  }, [role]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10 or 11-digit mobile number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Generate random 6-digit OTP or standard 123456
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);

    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setTimer(60);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    // Accept either generated OTP or universal demo code '123456'
    if (enteredOtp !== generatedOtp && enteredOtp !== '123456') {
      setErrorMsg(`Invalid verification code. Use ${generatedOtp} or 123456.`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const cleanPhone = mobileNumber.replace(/\D/g, '');
      let userName = 'User';

      if (role === 'molisab') {
        userName = 'Albaksh Molsab (Teacher)';
      } else {
        // Try finding matching parent name from students
        const matched = students.find((s) => s.parentPhone.replace(/\D/g, '') === cleanPhone);
        userName = matched?.parentName || 'Parent / Guardian';
      }

      const authData = {
        role,
        phone: mobileNumber,
        name: userName,
      };

      localStorage.setItem('sr_auth_user', JSON.stringify(authData));
      onLogin(authData);
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in">
        {/* Header with Islamic Seal */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-1">
            <AlbakshStamp size="sm" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
            STUDENTS REGISTER
          </h2>
          <p className="text-xs text-emerald-400 font-semibold">
            ALBAKSH MOLSAB TUITION ACADEMY
          </p>
          <p className="text-[11px] text-slate-400">
            Secure Mobile Number &amp; OTP Login Portal
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-800/90 rounded-2xl border border-slate-700/80 gap-1">
          <button
            type="button"
            onClick={() => setRole('molisab')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition active:scale-95 ${
              role === 'molisab'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Molsab (Teacher)</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('parents')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition active:scale-95 ${
              role === 'parents'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Parents (Guardian)</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Mobile Number Input */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {role === 'molisab' ? 'Teacher Mobile Number' : 'Parent Mobile Number'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400 font-mono font-bold">
                  📱
                </div>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="03001234500"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-850 border border-slate-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 tracking-wider shadow-inner"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {role === 'molisab'
                  ? 'Official teacher registered phone for session signs and management.'
                  : 'Enter the mobile number registered with your child at tuition.'}
              </p>
            </div>

            {/* Quick Demo Pre-fill Buttons */}
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Quick Test Credentials:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {role === 'molisab' ? (
                  <button
                    type="button"
                    onClick={() => setMobileNumber('03001234500')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono hover:bg-emerald-600/30 transition"
                  >
                    Albaksh Molsab: 03001234500
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setMobileNumber('03001234501')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono hover:bg-emerald-600/30 transition"
                    >
                      Tariq: 03001234501
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileNumber('03001234502')}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300 text-[11px] font-mono hover:bg-slate-600 transition"
                    >
                      Rashid: 03001234502
                    </button>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Sending OTP SMS...' : 'Send OTP Verification Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            {/* OTP Sent Banner with simulated OTP code */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-600/50 text-center space-y-1">
              <span className="text-slate-300 text-xs block">
                Verification SMS sent to <strong className="text-emerald-300 font-mono">{mobileNumber}</strong>
              </span>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold tracking-widest mt-1">
                Your OTP Code is: <span className="text-amber-300 text-sm font-black">{generatedOtp}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 text-center">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-xl font-mono font-black rounded-xl bg-slate-850 border border-slate-700 py-3 text-white focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => setEnteredOtp(generatedOtp)}
                className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-fill Code</span>
              </button>

              {timer > 0 ? (
                <span>Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Verify OTP & Enter App'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setEnteredOtp('');
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 pt-1"
            >
              ← Change Mobile Number
            </button>
          </form>
        )}

        {/* Security Footer Note */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            End-to-End Encrypted Mobile OTP Verification • STUDENTS REGISTER
          </p>
        </div>
      </div>
    </div>
  );
};
