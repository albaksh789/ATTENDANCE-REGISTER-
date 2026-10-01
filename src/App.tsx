/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Tuition,
  Student,
  AttendanceRecord,
  MolisabAttendanceRecord,
  FeeRecord,
  NotificationRecord,
  AppSettings,
  AppLanguage,
} from './types';
import {
  subscribeTuitions,
  subscribeStudents,
  subscribeAttendance,
  subscribeAllAttendance,
  subscribeMolisabAttendance,
  subscribeAllMolisabAttendance,
  subscribeFees,
  subscribeNotifications,
  subscribeSettings,
  testConnection,
  seedDatabaseIfEmpty,
} from './services/dataService';
import {
  INITIAL_TUITIONS,
  INITIAL_STUDENTS,
  INITIAL_SETTINGS,
  INITIAL_FEES,
} from './data/initialData';
import { translations } from './utils/translations';
import { MolisabApp } from './components/MolisabApp/MolisabApp';
import { ParentsApp } from './components/ParentsApp/ParentsApp';
import { MobileOtpLogin } from './components/Auth/MobileOtpLogin';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  GraduationCap,
  Users,
  Smartphone,
  Globe,
  ShieldCheck,
  Sparkles,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface AuthUser {
  role: 'molisab' | 'parents';
  phone: string;
  name: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('sr_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [appMode, setAppMode] = useState<'molisab' | 'parents'>(() => {
    const saved = localStorage.getItem('sr_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role) return parsed.role;
      } catch {}
    }
    return 'molisab';
  });
  const [language, setLanguage] = useState<AppLanguage>('en');

  // Real-time Cloud Data States with robust initial fallbacks
  const [tuitions, setTuitions] = useState<Tuition[]>(INITIAL_TUITIONS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [todayMolisabAttendance, setTodayMolisabAttendance] = useState<MolisabAttendanceRecord[]>([]);
  const [allMolisabAttendance, setAllMolisabAttendance] = useState<MolisabAttendanceRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>(INITIAL_FEES);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [cloudSynced, setCloudSynced] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // 1. Test connection to Firestore
    testConnection();

    // 2. Auto-seed cloud database if empty
    seedDatabaseIfEmpty().catch((err) => console.warn('Seed notice:', err));

    // 3. Attach real-time Firestore listeners
    const unsubTuitions = subscribeTuitions(
      (data) => {
        if (data && data.length > 0) {
          setTuitions(data);
          setCloudSynced(true);
        }
      },
      (err) => console.warn('Tuitions sync notice:', err.message)
    );

    const unsubStudents = subscribeStudents(
      (data) => {
        if (data && data.length > 0) {
          setStudents(data);
          setCloudSynced(true);
        }
      },
      (err) => console.warn('Students sync notice:', err.message)
    );

    const unsubTodayAtt = subscribeAttendance(
      todayStr,
      (data) => setTodayAttendance(data),
      (err) => console.warn('Today attendance sync notice:', err.message)
    );

    const unsubAllAtt = subscribeAllAttendance(
      (data) => setAllAttendance(data),
      (err) => console.warn('All attendance sync notice:', err.message)
    );

    const unsubTodayMolisab = subscribeMolisabAttendance(
      todayStr,
      (data) => setTodayMolisabAttendance(data),
      (err) => console.warn('Molisab attendance sync notice:', err.message)
    );

    const unsubAllMolisab = subscribeAllMolisabAttendance(
      (data) => setAllMolisabAttendance(data),
      (err) => console.warn('All Molisab attendance sync notice:', err.message)
    );

    const unsubFees = subscribeFees(
      (data) => {
        if (data && data.length > 0) setFees(data);
      },
      (err) => console.warn('Fees sync notice:', err.message)
    );

    const unsubNotifs = subscribeNotifications(
      (data) => setNotifications(data),
      (err) => console.warn('Notifications sync notice:', err.message)
    );

    const unsubSettings = subscribeSettings(
      (data) => setSettings(data),
      (err) => console.warn('Settings sync notice:', err.message)
    );

    return () => {
      unsubTuitions();
      unsubStudents();
      unsubTodayAtt();
      unsubAllAtt();
      unsubTodayMolisab();
      unsubAllMolisab();
      unsubFees();
      unsubNotifs();
      unsubSettings();
    };
  }, [todayStr]);

  const t = translations[language];

  return (
    <div
      dir={language === 'ur' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans"
    >
      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Main App Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 border border-emerald-400/40 p-1 flex items-center justify-center shadow-lg shadow-emerald-950/50 shrink-0">
            <img src="/icon.svg" alt="Students Register Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm sm:text-base tracking-wider text-white">
                STUDENTS REGISTER
              </span>
              <span className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                cloudSynced
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {cloudSynced ? 'CLOUD CONNECTED' : 'LOCAL CACHE READY'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold tracking-wide">
              ALBAKSH MOLSAB TUITION SYSTEM
            </p>
          </div>
        </div>

        {/* Center / Right Controls: App Mode Toggle, Language, Install PWA */}
        <div className="flex items-center gap-2">
          {/* App Switcher: Molisab App vs Parents App */}
          <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 flex items-center shadow-inner">
            <button
              onClick={() => setAppMode('molisab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                appMode === 'molisab'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Molisab App (Teacher)</span>
              <span className="sm:hidden">Teacher</span>
            </button>

            <button
              onClick={() => setAppMode('parents')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                appMode === 'parents'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Parents App (Guardian)</span>
              <span className="sm:hidden">Parents</span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/80 rounded-xl px-2 py-1 border border-slate-700/80">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="ro" className="bg-slate-900 text-white">Roman Urdu</option>
              <option value="ur" className="bg-slate-900 text-white">اردو (Urdu)</option>
            </select>
          </div>

          {/* Android PWA / APK Install Button */}
          <PWAInstallButton />

          {/* User Status & Logout */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 font-semibold truncate max-w-[120px]">{currentUser.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono">({currentUser.phone})</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('sr_auth_user');
                  setCurrentUser(null);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition active:scale-95"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Main Views or Login Screen */}
      {!currentUser ? (
        <main className="flex-1 flex flex-col">
          <MobileOtpLogin
            onLogin={(user) => {
              setCurrentUser(user);
              setAppMode(user.role);
            }}
            language={language}
            students={students}
          />
        </main>
      ) : (
        <main className="flex-1 flex flex-col">
          {appMode === 'molisab' ? (
            <MolisabApp
              tuitions={tuitions}
              students={students}
              attendance={todayAttendance}
              allAttendance={allAttendance}
              molisabAttendance={todayMolisabAttendance}
              allMolisabAttendance={allMolisabAttendance}
              fees={fees}
              notifications={notifications}
              settings={settings}
              language={language}
              onUpdateTuitions={(updated) => setTuitions(updated)}
              onUpdateStudents={(updated) => setStudents(updated)}
            />
          ) : (
            <ParentsApp
              students={students}
              tuitions={tuitions}
              attendance={todayAttendance}
              allAttendance={allAttendance}
              molisabAttendance={allMolisabAttendance}
              fees={fees}
              notifications={notifications}
              settings={settings}
              language={language}
              onLanguageChange={(l) => setLanguage(l)}
              defaultParentPhone={currentUser.phone}
            />
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 bg-slate-950">
        <p>
          STUDENTS REGISTER — Tuition Management System for <strong className="text-slate-300">ALBAKSH MOLSAB</strong>
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Connected to Firebase Cloud Firestore • Android PWA & APK Ready • Real-Time Database Sync
        </p>
      </footer>
    </div>
  );
}
