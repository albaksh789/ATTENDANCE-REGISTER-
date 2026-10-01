import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, X, ShieldCheck, CheckCircle2, Copy, Download } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white shadow-sm border border-emerald-500/40 transition active:scale-95"
        title="Install Verified App on Android"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
        <span>{isInstalled ? 'App Installed' : 'Install App'}</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Safe & Verified App Installation</h3>
                  <p className="text-xs text-emerald-400">STUDENTS REGISTER — Official Portal</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-4 space-y-4 text-xs text-slate-300">
              {/* Trust Badge */}
              <div className="flex items-center gap-2.5 bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-3 text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>100% Secure &amp; Verified:</strong> No unknown or harmful APK downloads. This official app installs safely directly through your browser.
                </span>
              </div>

              {/* Direct Install Button if ready */}
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowGuide(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Tap Here to Install App Now</span>
                </button>
              )}

              {/* Instructions */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  How to Install on Android Phone:
                </h4>
                <div className="space-y-2 bg-slate-850 rounded-xl p-3 border border-slate-800">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p className="text-slate-300">
                      Open this website in <strong>Google Chrome</strong> on your Android phone.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p className="text-slate-300">
                      Tap the <strong>three dots (⋮)</strong> menu in the top-right corner of Chrome.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p className="text-slate-300">
                      Select <strong>&quot;Install app&quot;</strong> (or <strong>&quot;Add to Home screen&quot;</strong>).
                    </p>
                  </div>
                </div>
              </div>

              {isIOS && (
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                  <span className="font-semibold text-white">Apple iPhone / iPad:</span>
                  <p className="text-slate-400 mt-1">
                    Tap the <strong>Share</strong> button at bottom of Safari, scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleCopyUrl}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
                >
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span>{copied ? 'Link Copied!' : 'Copy Link to Phone'}</span>
                </button>
                <button
                  onClick={() => setShowGuide(false)}
                  className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
