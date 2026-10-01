import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md border border-amber-400/40 animate-pulse">
      <WifiOff className="w-4 h-4 shrink-0 text-white" />
      <span>Offline Mode — Cached records are active. Auto-sync will resume when connected.</span>
    </div>
  );
};
