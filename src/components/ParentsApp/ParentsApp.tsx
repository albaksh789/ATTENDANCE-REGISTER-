import React, { useState, useMemo } from 'react';
import {
  Student,
  Tuition,
  AttendanceRecord,
  MolisabAttendanceRecord,
  FeeRecord,
  NotificationRecord,
  AppSettings,
  AppLanguage,
} from '../../types';
import { translations } from '../../utils/translations';
import { NaatPlayer } from '../NaatPlayer';
import { FeeReceiptModal } from '../FeeReceiptModal';
import { AlbakshStamp } from '../AlbakshStamp';
import { formatDDMMYYYY } from '../../utils/dateFormatter';
import {
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  CreditCard,
  Bell,
  MessageCircle,
  LogOut,
  ChevronRight,
  User,
  ShieldCheck,
  Music,
  Printer,
  Sparkles,
  Phone,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface ParentsAppProps {
  students: Student[];
  tuitions: Tuition[];
  attendance: AttendanceRecord[];
  allAttendance: AttendanceRecord[];
  molisabAttendance: MolisabAttendanceRecord[];
  fees: FeeRecord[];
  notifications: NotificationRecord[];
  settings: AppSettings;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  defaultParentPhone?: string;
}

export const ParentsApp: React.FC<ParentsAppProps> = ({
  students,
  tuitions,
  attendance,
  allAttendance,
  molisabAttendance,
  fees,
  notifications,
  settings,
  language,
  onLanguageChange,
  defaultParentPhone,
}) => {
  const t = translations[language];

  // Auth State: phone number + OTP
  const [parentPhone, setParentPhone] = useState<string>(defaultParentPhone || '03001234501'); // Pre-filled Tariq Mehmood for instant seamless test
  const [otpCode, setOtpCode] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default authenticated for demo, can logout
  const [authError, setAuthError] = useState('');

  // Selected Child (multi-child support!)
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Navigation tabs in Parent App
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'fees' | 'naat' | 'notifications' | 'settings'>('dashboard');

  // Modal
  const [viewingFeeReceipt, setViewingFeeReceipt] = useState<FeeRecord | null>(null);

  // Settings
  const [naatEnabled, setNaatEnabled] = useState(true);
  const [arrivalNotificationsEnabled, setArrivalNotificationsEnabled] = useState(true);

  // Filter linked children by parent phone
  const linkedChildren = useMemo(() => {
    const cleanPhone = parentPhone.replace(/\D/g, '');
    return students.filter((s) => {
      const studentCleanPhone = s.parentPhone.replace(/\D/g, '');
      return (
        studentCleanPhone === cleanPhone ||
        cleanPhone.endsWith(studentCleanPhone) ||
        studentCleanPhone.endsWith(cleanPhone)
      );
    });
  }, [students, parentPhone]);

  // Active child record
  const currentChild = useMemo(() => {
    if (selectedChildId) {
      const found = linkedChildren.find((c) => c.id === selectedChildId);
      if (found) return found;
    }
    return linkedChildren[0] || null;
  }, [linkedChildren, selectedChildId]);

  // Active child's tuition batch
  const currentTuition = useMemo(() => {
    if (!currentChild) return null;
    return tuitions.find((t) => t.id === currentChild.tuitionId) || null;
  }, [currentChild, tuitions]);

  // Today string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Today's attendance for current child
  const todayAttendance = useMemo(() => {
    if (!currentChild) return null;
    return (
      attendance.find(
        (a) => a.studentId === currentChild.id && a.date === todayStr
      ) || null
    );
  }, [currentChild, attendance, todayStr]);

  // Today Molisab attendance for child's batch
  const todayMolisabBatchAttendance = useMemo(() => {
    if (!currentChild) return null;
    return (
      molisabAttendance.find(
        (m) => m.tuitionId === currentChild.tuitionId && m.date === todayStr
      ) || null
    );
  }, [currentChild, molisabAttendance, todayStr]);

  // All attendance history for current child
  const childAttendanceHistory = useMemo(() => {
    if (!currentChild) return [];
    return allAttendance.filter((a) => a.studentId === currentChild.id);
  }, [currentChild, allAttendance]);

  // Child Fee records
  const childFees = useMemo(() => {
    if (!currentChild) return [];
    return fees.filter((f) => f.studentId === currentChild.id);
  }, [currentChild, fees]);

  // Current month fee record
  const currentMonthFee = useMemo(() => {
    return childFees[0] || null;
  }, [childFees]);

  // Attendance stats
  const presentCount = useMemo(
    () => childAttendanceHistory.filter((a) => a.status === 'Present').length,
    [childAttendanceHistory]
  );
  const absentCount = useMemo(
    () => childAttendanceHistory.filter((a) => a.status === 'Absent').length,
    [childAttendanceHistory]
  );
  const leaveCount = useMemo(
    () => childAttendanceHistory.filter((a) => a.status === 'Leave').length,
    [childAttendanceHistory]
  );
  const totalDays = presentCount + absentCount;
  const attendanceRate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100;

  // Contact Teacher WhatsApp
  const handleContactTeacher = () => {
    const teacherPhone = (settings.teacherPhone || '+923000000000').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Assalamu Alaikum Albaksh Molsab,\n` +
      `I am the parent of *${currentChild?.fullName || 'my child'}* regarding tuition *${currentTuition?.name || ''}*.\n`
    );
    window.open(`https://wa.me/${teacherPhone}?text=${message}`, '_blank');
  };

  // OTP Login handlers
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentPhone.trim()) {
      setAuthError('Please enter a valid mobile number.');
      return;
    }
    setAuthError('');
    setIsOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setAuthError('Please enter the 4 to 6 digit OTP.');
      return;
    }
    setIsAuthenticated(true);
    setIsOtpSent(false);
  };

  // If Not Authenticated: Show Mobile OTP Login Screen
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <Smartphone className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">PARENTS APP</h2>
            <p className="text-xs text-slate-400">
              Albaksh Molsab Tuition Management System • Secure Guardian Access
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center">
              {authError}
            </div>
          )}

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Registered Parent Mobile Number
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="e.g. 03001234501 or 03021234503"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-10 pr-4 py-2.5 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try test numbers: <strong>03001234501</strong> (2 children), <strong>03021234503</strong>, or <strong>03081234509</strong>.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition active:scale-95"
              >
                Send One-Time Password (OTP)
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div className="text-center">
                <span className="text-slate-400 text-xs">
                  OTP sent to <strong className="text-emerald-400 font-mono">{parentPhone}</strong>
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-lg font-mono rounded-xl bg-slate-800 border border-slate-700 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-emerald-400 text-center mt-1.5 font-medium">
                  Hint: Any test code (e.g. 123456) is accepted in demo mode.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition active:scale-95"
              >
                Verify & Enter Parent Portal
              </button>

              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200"
              >
                ← Change Mobile Number
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4.5rem)]">
      {/* Top Bar for Parents App */}
      <div className="sticky top-16 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'dashboard', label: t.dashboard, icon: Sparkles },
            { id: 'attendance', label: t.attendance, icon: Calendar },
            { id: 'fees', label: t.fees, icon: CreditCard },
            { id: 'naat', label: t.naatPlayer, icon: Music },
            { id: 'notifications', label: t.notifications, icon: Bell },
            { id: 'settings', label: t.settings, icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Multi-Child Selector or Mobile Badge */}
        <div className="flex items-center gap-2">
          {linkedChildren.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-800/90 rounded-xl px-2 py-1 border border-slate-700">
              <User className="w-3 h-3 text-emerald-400 shrink-0" />
              <select
                value={currentChild?.id}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                {linkedChildren.map((child) => (
                  <option key={child.id} value={child.id} className="bg-slate-900 text-white">
                    {child.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setIsAuthenticated(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full flex-1 space-y-6">
        {linkedChildren.length === 0 ? (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="font-bold text-white text-base">No Children Linked</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No registered students match mobile number <strong className="text-white">{parentPhone}</strong>.
              Kindly contact Albaksh Molsab to link your mobile number in the teacher register.
            </p>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200"
            >
              Try Another Mobile Number
            </button>
          </div>
        ) : (
          <>
            {/* Multi-Child Quick Switch Bar if multiple children */}
            {linkedChildren.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Your Children:</span>
                {linkedChildren.map((child) => {
                  const isSelected = child.id === currentChild?.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChildId(child.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{child.fullName}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ============================================================== */}
            {/* PARENT DASHBOARD */}
            {/* ============================================================== */}
            {activeTab === 'dashboard' && currentChild && (
              <div className="space-y-6 animate-in fade-in">
                {/* Child Primary Card */}
                <div className="rounded-3xl bg-gradient-to-r from-emerald-900/90 via-emerald-800/70 to-slate-900 border border-emerald-600/30 p-5 sm:p-6 text-white shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
                        <span>STUDENTS REGISTER</span>
                        <span>•</span>
                        <span>{currentChild.status}</span>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-black text-white">{currentChild.fullName}</h1>
                      <p className="text-xs text-emerald-200/90 mt-1">
                        Batch: <strong className="text-white">{currentTuition?.name || currentChild.tuitionName}</strong>
                      </p>
                      <p className="text-xs text-emerald-300 font-mono flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{currentTuition?.timing || 'Daily Tuition'}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2">
                      <div className="px-3.5 py-2 rounded-2xl bg-black/40 border border-emerald-500/30 text-right">
                        <span className="text-[10px] text-emerald-300 uppercase font-bold block">
                          Today&apos;s Attendance
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {todayAttendance?.status === 'Present' ? (
                            <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Present (حاضر)
                            </span>
                          ) : todayAttendance?.status === 'Absent' ? (
                            <span className="text-sm font-black text-rose-400 flex items-center gap-1">
                              <XCircle className="w-4 h-4" /> Absent (غیر حاضر)
                            </span>
                          ) : todayAttendance?.status === 'Leave' ? (
                            <span className="text-sm font-black text-amber-400 flex items-center gap-1">
                              Leave (رخصت)
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-300">Not Marked Yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
                    <span className="text-[11px] text-slate-400 block">Attendance Rate</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">
                      {attendanceRate}%
                    </span>
                    <span className="text-[10px] text-slate-400">{presentCount} Days Present</span>
                  </div>

                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
                    <span className="text-[11px] text-slate-400 block">Monthly Tuition Fee</span>
                    <span className="text-xl font-black text-white mt-1 block font-mono">
                      Rs. {currentChild.monthlyFee}
                    </span>
                    <span className="text-[10px] text-amber-400">
                      Due: {currentTuition?.feeDueDate || 5}th
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
                    <span className="text-[11px] text-slate-400 block">Current Fee Status</span>
                    <span className={`text-base font-black mt-1 block uppercase ${
                      currentMonthFee?.status === 'Paid'
                        ? 'text-emerald-400'
                        : currentMonthFee?.status === 'Partially Paid'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {currentMonthFee?.status || 'Pending'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Bal: Rs. {currentMonthFee ? currentMonthFee.balance : currentChild.monthlyFee}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
                    <span className="text-[11px] text-slate-400 block">Molisab Today</span>
                    <span className="text-base font-black text-emerald-300 mt-1 block">
                      {todayMolisabBatchAttendance?.status || 'Active Session'}
                    </span>
                    <span className="text-[10px] text-emerald-400">Albaksh Molsab</span>
                  </div>
                </div>

                {/* Naat Player Bar */}
                {naatEnabled && (
                  <NaatPlayer
                    naatTitle={settings.naatTitle}
                    naatUrl={settings.naatUrl}
                  />
                )}

                {/* Recent Notifications for Child */}
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-bold text-sm text-white">Recent Tuition Announcements</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className="text-xs font-semibold text-emerald-400 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {notifications.slice(0, 3).map((notif) => (
                      <div
                        key={notif.id}
                        className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{notif.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teacher Contact Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-700/40 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-serif font-black">
                      AM
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">Have questions for the teacher?</h4>
                      <p className="text-[11px] text-slate-400">Direct message Albaksh Molsab on WhatsApp</p>
                    </div>
                  </div>
                  <button
                    onClick={handleContactTeacher}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* PARENT ATTENDANCE TAB */}
            {/* ============================================================== */}
            {activeTab === 'attendance' && currentChild && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h2 className="text-lg font-bold text-white">{t.attendance} — {currentChild.fullName}</h2>
                  <p className="text-xs text-slate-400">
                    Real-time attendance records updated by Albaksh Molsab.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-center">
                    <span className="text-xs text-slate-400 block">{t.present}</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">{presentCount}</span>
                  </div>
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-center">
                    <span className="text-xs text-slate-400 block">{t.absent}</span>
                    <span className="text-2xl font-black text-rose-400 mt-1 block">{absentCount}</span>
                  </div>
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-center">
                    <span className="text-xs text-slate-400 block">{t.leave}</span>
                    <span className="text-2xl font-black text-amber-400 mt-1 block">{leaveCount}</span>
                  </div>
                </div>

                {/* Attendance History List */}
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
                  <h3 className="font-bold text-sm text-white">Daily Attendance Log</h3>

                  {childAttendanceHistory.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No attendance marked yet for this student.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {childAttendanceHistory.map((att) => (
                        <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white block">{formatDDMMYYYY(att.date)}</span>
                            <span className="text-[11px] text-slate-400">
                              Verified by: {att.markedBy || 'Albaksh Molsab'}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              att.status === 'Present'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : att.status === 'Absent'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {att.status === 'Present'
                              ? t.present
                              : att.status === 'Absent'
                              ? t.absent
                              : t.leave}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* PARENT FEES TAB */}
            {/* ============================================================== */}
            {activeTab === 'fees' && currentChild && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h2 className="text-lg font-bold text-white">{t.fees} — {currentChild.fullName}</h2>
                  <p className="text-xs text-slate-400">
                    Monthly tuition fee status, receipts and payment details.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                  <h3 className="font-bold text-sm text-white">Fee Statements & Receipts</h3>

                  {childFees.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No fee records found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {childFees.map((fee) => (
                        <div
                          key={fee.id}
                          className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-4 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-white text-sm block">{fee.month}</span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Receipt: {fee.receiptNumber}
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                fee.status === 'Paid'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : fee.status === 'Partially Paid'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {fee.status}
                            </span>
                          </div>

                          <div className="bg-slate-900/70 p-3 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Total Tuition Fee:</span>
                              <span className="font-bold text-white">Rs. {fee.totalAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Amount Paid:</span>
                              <span className="font-bold text-emerald-400">Rs. {fee.paidAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Remaining Balance:</span>
                              <span className="font-bold text-amber-400">Rs. {fee.balance.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-750">
                            <div>
                              <span className="text-slate-400 text-[11px] block">
                                Payment Date: <strong className="text-slate-200 font-mono">{fee.paymentDate ? formatDDMMYYYY(fee.paymentDate) : 'Pending payment'}</strong>
                              </span>
                              <span className="text-[10px] text-emerald-400 font-serif">Verified by: ALBAKSH MOLSAB</span>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {fee.status === 'Paid' && (
                                <AlbakshStamp date={fee.paymentDate || fee.updatedAt} size="sm" className="hidden sm:flex" />
                              )}
                              <button
                                onClick={() => setViewingFeeReceipt(fee)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Official Receipt &amp; Stamp</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* NAAT PLAYER TAB */}
            {/* ============================================================== */}
            {activeTab === 'naat' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h2 className="text-lg font-bold text-white">{t.naatPlayer}</h2>
                  <p className="text-xs text-slate-400">
                    Official tuition reminder audio for Albaksh Molsab&apos;s students.
                  </p>
                </div>

                <NaatPlayer
                  naatTitle={settings.naatTitle}
                  naatUrl={settings.naatUrl}
                />

                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3 text-xs text-slate-300">
                  <h4 className="font-bold text-sm text-white">Android Background Playback Policy</h4>
                  <p className="leading-relaxed text-slate-400">
                    Modern Android OS versions enforce battery optimization and restrictions on background audio autoplay without user gesture. To ensure you hear the Naat before tuition, tap <strong>&quot;Play Naat&quot;</strong> when the arrival notification appears on your device.
                  </p>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* PARENT NOTIFICATIONS TAB */}
            {/* ============================================================== */}
            {activeTab === 'notifications' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h2 className="text-lg font-bold text-white">{t.notifications}</h2>
                  <p className="text-xs text-slate-400">
                    All timetable alerts, arrival reminders, and teacher announcements.
                  </p>
                </div>

                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{notif.title}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-semibold uppercase">
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* PARENT SETTINGS TAB */}
            {/* ============================================================== */}
            {activeTab === 'settings' && (
              <div className="space-y-5 animate-in fade-in max-w-xl">
                <div>
                  <h2 className="text-lg font-bold text-white">{t.settings}</h2>
                  <p className="text-xs text-slate-400">
                    Guardian preferences, language selection, and contact options.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 text-xs">
                  {/* Language Selector */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-2">Preferred Language</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'en', label: 'English' },
                        { id: 'ro', label: 'Roman Urdu' },
                        { id: 'ur', label: 'اردو (Urdu)' },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => onLanguageChange(lang.id as AppLanguage)}
                          className={`py-2 px-3 rounded-xl font-bold transition ${
                            language === lang.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Naat playback toggle */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div>
                      <span className="font-semibold text-white block">Tuition Naat Alert</span>
                      <span className="text-[11px] text-slate-400">
                        Play soothing Naat reminder before tuition starts
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNaatEnabled(!naatEnabled)}
                      className={`w-11 h-6 rounded-full transition relative ${
                        naatEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition absolute top-1 ${
                          naatEnabled ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Arrival Notifications toggle */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div>
                      <span className="font-semibold text-white block">Molisab Arrival Notices</span>
                      <span className="text-[11px] text-slate-400">
                        Receive alert 10–15 minutes before tuition
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setArrivalNotificationsEnabled(!arrivalNotificationsEnabled)}
                      className={`w-11 h-6 rounded-full transition relative ${
                        arrivalNotificationsEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white transition absolute top-1 ${
                          arrivalNotificationsEnabled ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Contact Teacher */}
                  <div className="pt-3 border-t border-slate-800">
                    <button
                      onClick={handleContactTeacher}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>{t.contactTeacher}</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="pt-2">
                    <button
                      onClick={() => setIsAuthenticated(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 font-semibold border border-rose-800/40"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out from Guardian Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fee Receipt Modal */}
      {viewingFeeReceipt && (
        <FeeReceiptModal
          fee={viewingFeeReceipt}
          student={currentChild || undefined}
          tuition={currentTuition || undefined}
          onClose={() => setViewingFeeReceipt(null)}
        />
      )}
    </div>
  );
};
