import React, { useState, useMemo } from 'react';
import {
  Tuition,
  Student,
  AttendanceRecord,
  MolisabAttendanceRecord,
  FeeRecord,
  NotificationRecord,
  AppSettings,
  AttendanceStatus,
  AppLanguage,
} from '../../types';
import {
  saveTuition,
  deleteTuition,
  saveStudent,
  deleteStudent,
  saveAttendanceRecord,
  saveMolisabAttendanceRecord,
  saveFeeRecord,
  saveNotificationRecord,
  saveSettings,
  seedDatabaseIfEmpty,
} from '../../services/dataService';
import { translations } from '../../utils/translations';
import { AddEditTuitionModal } from './AddEditTuitionModal';
import { AddEditStudentModal } from './AddEditStudentModal';
import { PaymentModal } from './PaymentModal';
import { FeeReceiptModal } from '../FeeReceiptModal';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';
import { SignaturePad } from '../SignaturePad';
import { AlbakshStamp } from '../AlbakshStamp';
import { AttendanceStatusButton } from '../AttendanceStatusButton';
import { formatDDMMYYYY } from '../../utils/dateFormatter';
import { generateStampSignatureDataUrl } from '../../utils/stampGenerator';
import { NaatPlayer } from '../NaatPlayer';
import {
  Users,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Bell,
  FileSpreadsheet,
  Settings,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Printer,
  Share2,
  Trash2,
  Edit,
  PenTool,
  Calendar,
  Sparkles,
  Download,
  Phone,
  RefreshCw,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface MolisabAppProps {
  tuitions: Tuition[];
  students: Student[];
  attendance: AttendanceRecord[];
  allAttendance: AttendanceRecord[];
  molisabAttendance: MolisabAttendanceRecord[];
  allMolisabAttendance: MolisabAttendanceRecord[];
  fees: FeeRecord[];
  notifications: NotificationRecord[];
  settings: AppSettings;
  language: AppLanguage;
  onUpdateTuitions?: (tuitions: Tuition[]) => void;
  onUpdateStudents?: (students: Student[]) => void;
}

export const MolisabApp: React.FC<MolisabAppProps> = ({
  tuitions,
  students,
  attendance,
  allAttendance,
  molisabAttendance,
  allMolisabAttendance,
  fees,
  notifications,
  settings,
  language,
  onUpdateTuitions,
  onUpdateStudents,
}) => {
  const t = translations[language];

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'tuitions' | 'students' | 'attendance' | 'molisab' | 'fees' | 'notifications' | 'reports' | 'settings'
  >('dashboard');

  // Modals state
  const [selectedTuitionForEdit, setSelectedTuitionForEdit] = useState<Tuition | null | undefined>(undefined);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null | undefined>(undefined);
  const [tuitionToDelete, setTuitionToDelete] = useState<Tuition | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<FeeRecord | null>(null);
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState<FeeRecord | null>(null);

  const handleSaveTuition = async (tuition: Tuition) => {
    const exists = tuitions.some((t) => t.id === tuition.id);
    const updated = exists
      ? tuitions.map((t) => (t.id === tuition.id ? tuition : t))
      : [...tuitions, tuition];
    onUpdateTuitions?.(updated);
    setSelectedTuitionForEdit(undefined);
    try {
      await saveTuition(tuition);
    } catch (err) {
      console.warn('Save tuition background sync:', err);
    }
  };

  const handleConfirmDeleteTuition = async () => {
    if (!tuitionToDelete) return;
    const idToDelete = tuitionToDelete.id;
    const updated = tuitions.filter((t) => t.id !== idToDelete);
    onUpdateTuitions?.(updated);
    setTuitionToDelete(null);
    try {
      await deleteTuition(idToDelete);
    } catch (err) {
      console.warn('Delete tuition background sync:', err);
    }
  };

  const handleSaveStudent = async (student: Student) => {
    const exists = students.some((s) => s.id === student.id);
    const updated = exists
      ? students.map((s) => (s.id === student.id ? student : s))
      : [...students, student];
    onUpdateStudents?.(updated);
    setSelectedStudentForEdit(undefined);
    try {
      await saveStudent(student);
    } catch (err) {
      console.warn('Save student background sync:', err);
    }
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    const idToDelete = studentToDelete.id;
    const updated = students.filter((s) => s.id !== idToDelete);
    onUpdateStudents?.(updated);
    setStudentToDelete(null);
    try {
      await deleteStudent(idToDelete);
    } catch (err) {
      console.warn('Delete student background sync:', err);
    }
  };

  // Attendance state
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr);
  const [selectedTuitionIdForAttendance, setSelectedTuitionIdForAttendance] = useState<string>(
    tuitions[0]?.id || ''
  );
  const [tempAttendance, setTempAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Molisab Attendance state
  const [molisabStatus, setMolisabStatus] = useState<AttendanceStatus>('Present');
  const [molisabTuitionId, setMolisabTuitionId] = useState<string>(tuitions[0]?.id || '');
  const [molisabSignature, setMolisabSignature] = useState<string>('');
  const [molisabNotes, setMolisabNotes] = useState<string>('');
  const [molisabSavedSuccess, setMolisabSavedSuccess] = useState(false);

  // Click Stamp to Auto-Sign handler
  const handleApplyStampAsSignature = () => {
    const stampData = generateStampSignatureDataUrl(attendanceDate);
    setMolisabSignature(stampData);
  };

  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentTuitionFilter, setStudentTuitionFilter] = useState('ALL');
  const [feeStatusFilter, setFeeStatusFilter] = useState<'ALL' | 'Paid' | 'Pending' | 'Partially Paid'>('ALL');

  // Notification Broadcast state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifBatchId, setNotifBatchId] = useState('ALL');
  const [notifType, setNotifType] = useState<'arrival' | 'holiday' | 'leave' | 'fee' | 'announcement'>('arrival');
  const [notifSentNotice, setNotifSentNotice] = useState(false);

  // Settings state
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Compute Dashboard Metrics
  const activeStudents = useMemo(() => students.filter((s) => s.status === 'Active'), [students]);

  // Today's attendance calculation
  const todayRecords = useMemo(
    () => attendance.filter((a) => a.date === todayStr),
    [attendance, todayStr]
  );
  const todayPresentCount = useMemo(
    () => todayRecords.filter((a) => a.status === 'Present').length,
    [todayRecords]
  );
  const todayAbsentCount = useMemo(
    () => todayRecords.filter((a) => a.status === 'Absent').length,
    [todayRecords]
  );

  // Today Molisab record
  const todayMolisabRecord = useMemo(
    () => molisabAttendance.find((m) => m.date === todayStr),
    [molisabAttendance, todayStr]
  );

  // Financial metrics
  const totalFeesExpected = useMemo(
    () => fees.reduce((acc, f) => acc + (f.totalAmount || 0), 0),
    [fees]
  );
  const totalFeesReceived = useMemo(
    () => fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0),
    [fees]
  );
  const totalFeesPending = useMemo(
    () => fees.reduce((acc, f) => acc + (f.balance || 0), 0),
    [fees]
  );

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.parentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.parentPhone.includes(studentSearch);
      const matchesBatch =
        studentTuitionFilter === 'ALL' || s.tuitionId === studentTuitionFilter;
      return matchesSearch && matchesBatch;
    });
  }, [students, studentSearch, studentTuitionFilter]);

  // Filtered Fees
  const filteredFees = useMemo(() => {
    return fees.filter((f) => {
      const matchesStatus =
        feeStatusFilter === 'ALL' || f.status === feeStatusFilter;
      return matchesStatus;
    });
  }, [fees, feeStatusFilter]);

  // Students in selected tuition for attendance
  const studentsForAttendance = useMemo(() => {
    return students.filter(
      (s) => s.tuitionId === selectedTuitionIdForAttendance && s.status === 'Active'
    );
  }, [students, selectedTuitionIdForAttendance]);

  // Attendance for selected date & tuition
  const currentBatchAttendanceMap = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    attendance
      .filter(
        (a) => a.date === attendanceDate && a.tuitionId === selectedTuitionIdForAttendance
      )
      .forEach((a) => {
        map[a.studentId] = a.status;
      });
    return map;
  }, [attendance, attendanceDate, selectedTuitionIdForAttendance]);

  const handleMarkStudentAttendance = (studentId: string, status: AttendanceStatus) => {
    setTempAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const newMap: Record<string, AttendanceStatus> = {};
    studentsForAttendance.forEach((s) => {
      newMap[s.id] = 'Present';
    });
    setTempAttendance(newMap);
  };

  const handleSaveAttendance = async () => {
    if (!selectedTuitionIdForAttendance || studentsForAttendance.length === 0) return;
    setSavingAttendance(true);

    try {
      const selectedBatch = tuitions.find((t) => t.id === selectedTuitionIdForAttendance);

      for (const student of studentsForAttendance) {
        const status =
          tempAttendance[student.id] ||
          currentBatchAttendanceMap[student.id] ||
          'Present';

        const recordId = `att-${student.id}-${attendanceDate}`;
        const record: AttendanceRecord = {
          id: recordId,
          tuitionId: selectedTuitionIdForAttendance,
          studentId: student.id,
          studentName: student.fullName,
          date: attendanceDate,
          status,
          markedBy: 'ALBAKSH MOLSAB',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveAttendanceRecord(record);
      }

      setSavingAttendance(false);
      alert('Attendance saved successfully to cloud!');
    } catch (err) {
      setSavingAttendance(false);
      console.error(err);
      alert('Error saving attendance. Please check network.');
    }
  };

  const handleSaveMolisabAttendance = async () => {
    if (!molisabTuitionId) return;
    const selectedBatch = tuitions.find((t) => t.id === molisabTuitionId);

    const record: MolisabAttendanceRecord = {
      id: `molisab-${molisabTuitionId}-${attendanceDate}`,
      tuitionId: molisabTuitionId,
      tuitionName: selectedBatch?.name || 'Tuition Batch',
      date: attendanceDate,
      status: molisabStatus,
      signatureUrl: molisabStatus === 'Present' ? molisabSignature : undefined,
      notes: molisabNotes,
      markedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await saveMolisabAttendanceRecord(record);
    setMolisabSavedSuccess(true);
    setTimeout(() => setMolisabSavedSuccess(false), 3000);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    const notif: NotificationRecord = {
      id: `notif-${Date.now()}`,
      tuitionId: notifBatchId === 'ALL' ? undefined : notifBatchId,
      targetType: notifBatchId === 'ALL' ? 'all' : 'batch',
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      type: notifType,
      createdAt: new Date().toISOString(),
    };

    await saveNotificationRecord(notif);
    setNotifTitle('');
    setNotifMessage('');
    setNotifSentNotice(true);
    setTimeout(() => setNotifSentNotice(false), 3000);
  };

  const handleSendWhatsAppFeeReminder = (fee: FeeRecord) => {
    const student = students.find((s) => s.id === fee.studentId);
    const parentPhone = (student?.parentPhone || fee.parentPhone || '').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Assalamu Alaikum Respected Parent,\n` +
      `This is a kind fee reminder from ALBAKSH MOLSAB for your child *${fee.studentName}* for the month of *${fee.month}*.\n` +
      `Total Fee: Rs. ${fee.totalAmount.toLocaleString()}\n` +
      `Paid: Rs. ${fee.paidAmount.toLocaleString()}\n` +
      `Pending Balance: Rs. ${fee.balance.toLocaleString()}\n` +
      `Due Date: ${fee.year}-${fee.month}\n` +
      `Kindly deposit at your earliest convenience. JazakAllah Khair.\n` +
      `Albaksh Molsab`
    );

    const url = parentPhone
      ? `https://wa.me/${parentPhone.startsWith('92') || parentPhone.startsWith('91') ? parentPhone : `92${parentPhone.replace(/^0/, '')}`}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(url, '_blank');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(currentSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleSeedData = async () => {
    if (window.confirm('Reset/Seed 9 tuition batches and 32 students in cloud database?')) {
      await seedDatabaseIfEmpty();
      alert('Cloud database seeded with 9 batches and 32 students!');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4.5rem)]">
      {/* Top Tab Bar for Molisab App */}
      <div className="sticky top-16 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: t.dashboard, icon: Sparkles },
          { id: 'tuitions', label: t.tuitions, icon: BookOpen },
          { id: 'students', label: t.students, icon: Users },
          { id: 'attendance', label: t.attendance, icon: CalendarCheck },
          { id: 'molisab', label: t.molisabAttendance, icon: PenTool },
          { id: 'fees', label: t.fees, icon: CreditCard },
          { id: 'notifications', label: t.notifications, icon: Bell },
          { id: 'reports', label: t.reports, icon: FileSpreadsheet },
          { id: 'settings', label: t.settings, icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-1 space-y-6">
        {/* ============================================================== */}
        {/* 1. DASHBOARD TAB */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-900/90 via-emerald-800/70 to-slate-900 border border-emerald-600/30 p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Teacher / Admin Dashboard</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Assalamu Alaikum, {t.teacherTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl">
                    Students Register Tuition Management Portal. Real-time sync with Parents App, daily attendance tracking, fee receipts, and timetable alerts.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedStudentForEdit(null)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.addStudent}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 shadow-sm transition active:scale-95"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{t.markAttendance}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">{t.totalTuitions}</span>
                <span className="text-2xl font-black text-white mt-1 block">{tuitions.length}</span>
                <span className="text-[10px] text-emerald-400 font-medium">9 active batches</span>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">{t.totalStudents}</span>
                <span className="text-2xl font-black text-white mt-1 block">{students.length}</span>
                <span className="text-[10px] text-emerald-400 font-medium">{activeStudents.length} active registered</span>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">{t.todayPresent}</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">{todayPresentCount}</span>
                <span className="text-[10px] text-slate-400 font-medium">Date: {todayStr}</span>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">{t.todayAbsent}</span>
                <span className="text-2xl font-black text-rose-400 mt-1 block">{todayAbsentCount}</span>
                <span className="text-[10px] text-slate-400 font-medium">Unexcused</span>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">{t.receivedFees}</span>
                <span className="text-xl font-black text-emerald-300 mt-1 block truncate">
                  Rs. {totalFeesReceived.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">This month</span>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
                <span className="text-[11px] font-semibold text-slate-400 block">{t.pendingFees}</span>
                <span className="text-xl font-black text-amber-400 mt-1 block truncate">
                  Rs. {totalFeesPending.toLocaleString()}
                </span>
                <span className="text-[10px] text-amber-300 font-medium">Outstanding</span>
              </div>
            </div>

            {/* Audio Naat Player Bar */}
            <NaatPlayer
              naatTitle={settings.naatTitle}
              naatUrl={settings.naatUrl}
            />

            {/* Upcoming Schedules & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Tuition Batches */}
              <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">{t.upcomingSchedules}</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('tuitions')}
                    className="text-xs font-semibold text-emerald-400 hover:underline"
                  >
                    View All Batches
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tuitions.slice(0, 6).map((tuition) => {
                    const batchStudents = students.filter((s) => s.tuitionId === tuition.id);
                    return (
                      <div
                        key={tuition.id}
                        className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3.5 hover:border-emerald-500/40 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-white truncate">{tuition.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                              {tuition.days || 'Daily'}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-300 font-mono flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            <span>{tuition.timing}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Students: <strong className="text-slate-200">{batchStudents.length} enrolled</strong> • Fee Due: <strong className="text-amber-300">{tuition.feeDueDate}th</strong>
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedTuitionIdForAttendance(tuition.id);
                                setActiveTab('attendance');
                              }}
                              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                            >
                              Attendance →
                            </button>
                            <button
                              onClick={() => {
                                setMolisabTuitionId(tuition.id);
                                setActiveTab('molisab');
                              }}
                              className="text-[11px] font-semibold text-slate-300 hover:text-white"
                            >
                              Sign Session
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedTuitionForEdit(tuition)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
                              title="Edit Batch"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setTuitionToDelete(tuition)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                <h3 className="font-bold text-sm text-white">{t.quickActions}</h3>

                <div className="space-y-2.5">
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-emerald-400 transition">
                          Mark Daily Attendance
                        </span>
                        <span className="text-[11px] text-slate-400">Save date-wise student records</span>
                      </div>
                    </div>
                    <span className="text-slate-500 group-hover:text-slate-300">→</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('molisab')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <PenTool className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-emerald-400 transition">
                          Molisab Sign-In & Attendance
                        </span>
                        <span className="text-[11px] text-slate-400">Digital touchscreen signature pad</span>
                      </div>
                    </div>
                    <span className="text-slate-500 group-hover:text-slate-300">→</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('fees')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-amber-400 transition">
                          Collect Tuition Fees
                        </span>
                        <span className="text-[11px] text-slate-400">Receipts & WhatsApp reminders</span>
                      </div>
                    </div>
                    <span className="text-slate-500 group-hover:text-slate-300">→</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-blue-400 transition">
                          Send Arrival Notification
                        </span>
                        <span className="text-[11px] text-slate-400">Alert parents 10m before tuition</span>
                      </div>
                    </div>
                    <span className="text-slate-500 group-hover:text-slate-300">→</span>
                  </button>

                  <button
                    onClick={handleSeedData}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-dashed border-slate-700 transition group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-300 block">
                          Seed / Restore 9 Batches (32 Students)
                        </span>
                        <span className="text-[10px] text-slate-500">Populate default verified dataset</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. TUITIONS & BATCHES TAB */}
        {/* ============================================================== */}
        {activeTab === 'tuitions' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">{t.tuitions}</h2>
                <p className="text-xs text-slate-400">
                  Manage all tuition batches, class timings, and monthly fee dates.
                </p>
              </div>
              <button
                onClick={() => setSelectedTuitionForEdit(null)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addTuition}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tuitions.map((tuition) => {
                const batchStudents = students.filter((s) => s.tuitionId === tuition.id);
                return (
                  <div
                    key={tuition.id}
                    className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3.5 hover:border-emerald-500/50 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-white">{tuition.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold whitespace-nowrap">
                          {tuition.days || 'Daily'}
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-1 text-xs">
                        <p className="text-emerald-300 font-mono flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{tuition.timing}</span>
                        </p>
                        <p className="text-slate-300">
                          Fee Due Date: <strong className="text-amber-300">{tuition.feeDueDate}th of month</strong>
                        </p>
                        <p className="text-slate-400">
                          Teacher: <span className="text-slate-200">{tuition.teacherName || 'ALBAKSH MOLSAB'}</span>
                        </p>
                        {tuition.notes && (
                          <p className="text-slate-400 italic text-[11px] mt-1 bg-slate-950/40 p-2 rounded-lg">
                            {tuition.notes}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 bg-slate-800/60 rounded-xl p-2.5 text-xs flex justify-between items-center">
                        <span className="text-slate-400">Assigned Students:</span>
                        <span className="font-bold text-white font-mono">{batchStudents.length} Students</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedTuitionIdForAttendance(tuition.id);
                          setActiveTab('attendance');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold"
                      >
                        Attendance
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedTuitionForEdit(tuition)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit Batch"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTuitionToDelete(tuition)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. STUDENTS REGISTER TAB */}
        {/* ============================================================== */}
        {activeTab === 'students' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">{t.students}</h2>
                <p className="text-xs text-slate-400">
                  Search, filter, view and manage registered students and parent records.
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForEdit(null)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addStudent}</span>
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder={t.searchStudents}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9.5 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <select
                  value={studentTuitionFilter}
                  onChange={(e) => setStudentTuitionFilter(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Batches ({students.length})</option>
                  {tuitions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students Table / Grid */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700/60">
                    <tr>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Tuition Batch</th>
                      <th className="py-3 px-4">Parent / Guardian</th>
                      <th className="py-3 px-4">Parent Mobile</th>
                      <th className="py-3 px-4">Monthly Fee</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500">
                          No students matching your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => {
                        const batch = tuitions.find((t) => t.id === s.tuitionId);
                        return (
                          <tr key={s.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                              {s.fullName}
                            </td>
                            <td className="py-3 px-4 text-emerald-300 whitespace-nowrap">
                              {batch?.name || s.tuitionName}
                            </td>
                            <td className="py-3 px-4 text-slate-200">{s.parentName}</td>
                            <td className="py-3 px-4 font-mono text-slate-300">
                              <a
                                href={`tel:${s.parentPhone}`}
                                className="hover:text-emerald-400 flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-emerald-500" />
                                <span>{s.parentPhone}</span>
                              </a>
                            </td>
                            <td className="py-3 px-4 font-bold text-white font-mono">
                              Rs. {s.monthlyFee.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.status === 'Active'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {s.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedStudentForEdit(s)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setStudentToDelete(s)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. DAILY STUDENT ATTENDANCE TAB */}
        {/* ============================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">{t.attendance}</h2>
                <p className="text-xs text-slate-400">
                  Mark daily attendance date-wise. Instantly synced with the cloud and visible in Parents App.
                </p>
              </div>
            </div>

            {/* Controls: Date & Tuition Batch Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Select Attendance Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Select Tuition Batch
                </label>
                <select
                  value={selectedTuitionIdForAttendance}
                  onChange={(e) => {
                    setSelectedTuitionIdForAttendance(e.target.value);
                    setTempAttendance({});
                  }}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {tuitions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.timing})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => setTempAttendance({})}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Attendance List */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-xs text-slate-300">
                  Students in this Batch ({studentsForAttendance.length})
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  Date: {formatDDMMYYYY(attendanceDate)}
                </span>
              </div>

              {studentsForAttendance.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No active students enrolled in this batch yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {studentsForAttendance.map((student) => {
                    const currentStatus =
                      tempAttendance[student.id] ||
                      currentBatchAttendanceMap[student.id] ||
                      'Present';

                    return (
                      <div
                        key={student.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-white">{student.fullName}</h4>
                          <p className="text-xs text-slate-400">
                            Parent: {student.parentName} • Ph: {student.parentPhone}
                          </p>
                        </div>

                        {/* Status Toggle Buttons with subtle animations */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          {(['Present', 'Absent', 'Leave'] as AttendanceStatus[]).map((status) => {
                            const isSelected = currentStatus === status;
                            const label =
                              status === 'Present'
                                ? t.present
                                : status === 'Absent'
                                ? t.absent
                                : t.leave;
                            return (
                              <AttendanceStatusButton
                                key={status}
                                status={status}
                                isSelected={isSelected}
                                onClick={() => handleMarkStudentAttendance(student.id, status)}
                                label={label}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {studentsForAttendance.length > 0 && (
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={handleSaveAttendance}
                    disabled={savingAttendance}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg shadow-emerald-950/50 transition active:scale-95 disabled:opacity-50"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{savingAttendance ? 'Saving to Cloud...' : t.saveAttendance}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. MOLISAB ATTENDANCE & SIGNATURE TAB */}
        {/* ============================================================== */}
        {activeTab === 'molisab' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">{t.molisabAttendance}</h2>
                <p className="text-xs text-slate-400">
                  Mark Molisab&apos;s daily attendance and sign with the touchscreen pad for each tuition session.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sign-in Form */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                <h3 className="font-bold text-sm text-white">Record Teacher Session Attendance</h3>

                {molisabSavedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Molisab session attendance & signature saved successfully!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Session Date</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tuition Batch</label>
                    <select
                      value={molisabTuitionId}
                      onChange={(e) => setMolisabTuitionId(e.target.value)}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {tuitions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold text-xs mb-2">
                    Molisab Attendance Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Present', 'Absent', 'Leave'] as AttendanceStatus[]).map((status) => {
                      const isSelected = molisabStatus === status;
                      const label =
                        status === 'Present'
                          ? t.present
                          : status === 'Absent'
                          ? t.absent
                          : t.leave;
                      return (
                        <AttendanceStatusButton
                          key={status}
                          status={status}
                          isSelected={isSelected}
                          onClick={() => setMolisabStatus(status)}
                          label={label}
                        />
                      );
                    })}
                  </div>
                </div>

                {molisabStatus === 'Present' ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <label className="block text-slate-300 font-semibold text-xs">
                        Touchscreen Signature (Draw manually OR Click Stamp to Auto-Sign)
                      </label>
                      <button
                        type="button"
                        onClick={handleApplyStampAsSignature}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition active:scale-95 shadow-sm self-start sm:self-auto"
                        title="Click Stamp to Sign"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Click Stamp to Sign (مہر سے دستخط)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <div className="md:col-span-2">
                        <SignaturePad onSave={(dataUrl) => setMolisabSignature(dataUrl)} />
                      </div>

                      {/* Interactive Stamp: Clicking this applies stamp as signature! */}
                      <div
                        onClick={handleApplyStampAsSignature}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 text-center cursor-pointer transition active:scale-95 group shadow-lg"
                        title="Click this Stamp to Sign!"
                      >
                        <span className="text-[10px] text-emerald-300 font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                          Tap Stamp to Sign
                        </span>
                        <AlbakshStamp
                          date={attendanceDate}
                          size="md"
                          interactive
                          onClick={handleApplyStampAsSignature}
                        />
                        <span className="text-[9px] text-emerald-400/90 mt-1 font-semibold group-hover:text-emerald-300">
                          مہر پر کلک کر کے سائن کریں
                        </span>
                      </div>
                    </div>

                    {molisabSignature && (
                      <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between gap-3 animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-emerald-300 block">
                              Signature Captured &amp; Verified!
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Official ALBAKSH MOLSAB stamp/sign attached.
                            </span>
                          </div>
                        </div>
                        <img
                          src={molisabSignature}
                          alt="Captured Signature"
                          className="h-12 w-auto object-contain rounded-lg bg-slate-900/60 p-1 border border-emerald-500/20"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 font-semibold text-xs mb-1">
                      Reason for Absence / Leave (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={molisabNotes}
                      onChange={(e) => setMolisabNotes(e.target.value)}
                      placeholder="e.g. Travel, urgent task, unwell..."
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveMolisabAttendance}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                >
                  Save Molisab Attendance
                </button>
              </div>

              {/* History of Molisab Attendance */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                <h3 className="font-bold text-sm text-white">Recent Molisab Attendance & Signatures</h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {allMolisabAttendance.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No records saved yet.
                    </div>
                  ) : (
                    allMolisabAttendance.map((rec) => (
                      <div
                        key={rec.id}
                        className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3.5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{rec.tuitionName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.status === 'Present'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : rec.status === 'Absent'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span>Date: <strong className="text-slate-200 font-mono">{formatDDMMYYYY(rec.date)}</strong></span>
                          <span>Time: {new Date(rec.markedAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          {rec.signatureUrl ? (
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">Teacher Signature:</span>
                              <img
                                src={rec.signatureUrl}
                                alt="Teacher Signature"
                                className="h-10 object-contain invert"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs italic">Marked {rec.status}</span>
                          )}
                          <AlbakshStamp date={rec.date} size="sm" />
                        </div>
                        {rec.notes && <p className="text-slate-400 italic">Note: {rec.notes}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. FEES MANAGEMENT TAB */}
        {/* ============================================================== */}
        {activeTab === 'fees' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">{t.fees}</h2>
                <p className="text-xs text-slate-400">
                  Track student fee statuses, record full/partial payments, generate digital receipts, and dispatch WhatsApp reminders.
                </p>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
                <span className="text-xs text-slate-400">Total Expected Monthly Fees</span>
                <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                  Rs. {totalFeesExpected.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400">{fees.length} students billed</span>
              </div>

              <div className="rounded-2xl bg-emerald-950/40 border border-emerald-800/40 p-4">
                <span className="text-xs text-emerald-300">Total Received Fees</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                  Rs. {totalFeesReceived.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-400/80">
                  {totalFeesExpected > 0
                    ? Math.round((totalFeesReceived / totalFeesExpected) * 100)
                    : 0}
                  % Collection Rate
                </span>
              </div>

              <div className="rounded-2xl bg-amber-950/40 border border-amber-800/40 p-4">
                <span className="text-xs text-amber-300">Total Outstanding Balance</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 mt-1 block">
                  Rs. {totalFeesPending.toLocaleString()}
                </span>
                <span className="text-[11px] text-amber-400/80">Pending from parents</span>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2">
              {(['ALL', 'Paid', 'Pending', 'Partially Paid'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFeeStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    feeStatusFilter === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL'
                    ? 'All Students'
                    : st === 'Paid'
                    ? t.paid
                    : st === 'Pending'
                    ? t.pending
                    : t.partiallyPaid}
                </button>
              ))}
            </div>

            {/* Fees Table */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700/60">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Billing Month</th>
                      <th className="py-3 px-4">Monthly Fee</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Balance</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredFees.map((fee) => {
                      const student = students.find((s) => s.id === fee.studentId);
                      return (
                        <tr key={fee.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{fee.studentName}</span>
                            <span className="text-[11px] text-slate-400">{student?.parentPhone}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-medium">{fee.month}</td>
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            Rs. {fee.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                            Rs. {fee.paidAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-amber-400 font-bold">
                            Rs. {fee.balance.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                fee.status === 'Paid'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : fee.status === 'Partially Paid'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {fee.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedFeeForPayment(fee)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition"
                              >
                                Record Fee
                              </button>
                              <button
                                onClick={() => setSelectedFeeForReceipt(fee)}
                                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                                title="View Digital Receipt"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleSendWhatsAppFeeReminder(fee)}
                                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/60 transition"
                                title="Send WhatsApp Reminder"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 7. NOTIFICATIONS & ALERTS TAB */}
        {/* ============================================================== */}
        {activeTab === 'notifications' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">{t.notifications}</h2>
                <p className="text-xs text-slate-400">
                  Broadcast tuition arrival alerts, holiday notices, and important announcements to parents.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Send Notification Card */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                <h3 className="font-bold text-sm text-white">Broadcast Announcement / Arrival Alert</h3>

                {notifSentNotice && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Notification broadcast sent to Parents App!</span>
                  </div>
                )}

                <form onSubmit={handleSendNotification} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Target Audience</label>
                    <select
                      value={notifBatchId}
                      onChange={(e) => setNotifBatchId(e.target.value)}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ALL">All Parents & Tuitions</option>
                      {tuitions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Notification Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'arrival', label: 'Molisab Arriving' },
                        { id: 'holiday', label: 'Holiday' },
                        { id: 'leave', label: 'Molisab Leave' },
                        { id: 'fee', label: 'Fee Reminder' },
                        { id: 'announcement', label: 'General Notice' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setNotifType(type.id as typeof notifType);
                            if (type.id === 'arrival') {
                              setNotifTitle('Molisab Arriving Shortly');
                              setNotifMessage(
                                'Assalamu Alaikum. Molisab will be arriving for tuition shortly. Please ensure your child is ready with wudu and book.'
                              );
                            } else if (type.id === 'holiday') {
                              setNotifTitle('Tuition Holiday Notice');
                              setNotifMessage(
                                'Assalamu Alaikum. Please note that tuition will remain closed today on account of holiday. JazakAllah khair.'
                              );
                            }
                          }}
                          className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition ${
                            notifType === type.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="e.g. Molisab Arriving in 10 Minutes"
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Message Content *</label>
                    <textarea
                      rows={4}
                      required
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      placeholder="Assalamu Alaikum..."
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Notification to Parents</span>
                  </button>
                </form>
              </div>

              {/* Notification Logs */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                <h3 className="font-bold text-sm text-white">Sent Notifications History</h3>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No notifications broadcasted yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3.5 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{n.title}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-semibold uppercase">
                            {n.type}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 8. REPORTS & EXPORT TAB */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">{t.reports}</h2>
                <p className="text-xs text-slate-400">
                  Comprehensive student attendance rates, batch performance, and fee collection summaries.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
            </div>

            {/* Attendance & Fee Summary Table */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <h3 className="font-bold text-sm text-white">Student Attendance Rate & Fee Summary</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Tuition Batch</th>
                      <th className="py-2.5 px-3">Present Days</th>
                      <th className="py-2.5 px-3">Absent Days</th>
                      <th className="py-2.5 px-3">Attendance %</th>
                      <th className="py-2.5 px-3">Monthly Fee</th>
                      <th className="py-2.5 px-3">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students.map((student) => {
                      const studentAtt = allAttendance.filter((a) => a.studentId === student.id);
                      const presents = studentAtt.filter((a) => a.status === 'Present').length;
                      const absents = studentAtt.filter((a) => a.status === 'Absent').length;
                      const totalDays = presents + absents;
                      const pct = totalDays > 0 ? Math.round((presents / totalDays) * 100) : 100;
                      const studentFee = fees.find((f) => f.studentId === student.id);

                      return (
                        <tr key={student.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-bold text-white">{student.fullName}</td>
                          <td className="py-2.5 px-3 text-slate-300">{student.tuitionName}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{presents}</td>
                          <td className="py-2.5 px-3 font-mono text-rose-400 font-bold">{absents}</td>
                          <td className="py-2.5 px-3 font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                pct >= 80
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : pct >= 60
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">Rs. {student.monthlyFee}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                            Rs. {studentFee ? studentFee.balance : 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 9. SETTINGS TAB */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-5 animate-in fade-in max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">{t.settings}</h2>
              <p className="text-xs text-slate-400">
                Configure Naat playback, alert schedules, and notification templates for Albaksh Molsab academy.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Settings saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Teacher / Academy Name</label>
                <input
                  type="text"
                  value={currentSettings.teacherName}
                  onChange={(e) =>
                    setCurrentSettings({ ...currentSettings, teacherName: e.target.value })
                  }
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Naat Audio Title</label>
                <input
                  type="text"
                  value={currentSettings.naatTitle}
                  onChange={(e) =>
                    setCurrentSettings({ ...currentSettings, naatTitle: e.target.value })
                  }
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Naat Audio URL (.mp3)</label>
                <input
                  type="url"
                  value={currentSettings.naatUrl}
                  onChange={(e) =>
                    setCurrentSettings({ ...currentSettings, naatUrl: e.target.value })
                  }
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Naat Alert Schedule (Mins Before Tuition)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={currentSettings.naatScheduleMinutes}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        naatScheduleMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Arrival Notice (Mins Before Tuition)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={currentSettings.arrivalNoticeMinutes}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        arrivalNoticeMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTuitionForEdit !== undefined && (
        <AddEditTuitionModal
          tuition={selectedTuitionForEdit}
          onSave={handleSaveTuition}
          onClose={() => setSelectedTuitionForEdit(undefined)}
        />
      )}

      {selectedStudentForEdit !== undefined && (
        <AddEditStudentModal
          student={selectedStudentForEdit}
          tuitions={tuitions}
          onSave={handleSaveStudent}
          onClose={() => setSelectedStudentForEdit(undefined)}
        />
      )}

      {/* In-App Delete Confirmation Modals */}
      <ConfirmDeleteModal
        isOpen={!!tuitionToDelete}
        title={tuitionToDelete?.name || ''}
        itemType="tuition batch"
        onConfirm={handleConfirmDeleteTuition}
        onCancel={() => setTuitionToDelete(null)}
      />

      <ConfirmDeleteModal
        isOpen={!!studentToDelete}
        title={studentToDelete?.fullName || ''}
        itemType="student record"
        onConfirm={handleConfirmDeleteStudent}
        onCancel={() => setStudentToDelete(null)}
      />

      {selectedFeeForPayment && (
        <PaymentModal
          fee={selectedFeeForPayment}
          student={students.find((s) => s.id === selectedFeeForPayment.studentId)}
          onSave={async (fee) => {
            await saveFeeRecord(fee);
            setSelectedFeeForPayment(null);
            setSelectedFeeForReceipt(fee);
          }}
          onClose={() => setSelectedFeeForPayment(null)}
        />
      )}

      {selectedFeeForReceipt && (
        <FeeReceiptModal
          fee={selectedFeeForReceipt}
          student={students.find((s) => s.id === selectedFeeForReceipt.studentId)}
          tuition={tuitions.find((t) => t.id === selectedFeeForReceipt.tuitionId)}
          onClose={() => setSelectedFeeForReceipt(null)}
        />
      )}
    </div>
  );
};
