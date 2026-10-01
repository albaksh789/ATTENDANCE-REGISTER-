import React from 'react';
import { formatDDMMYYYY } from '../utils/dateFormatter';

interface AlbakshStampProps {
  date?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'emerald' | 'blue' | 'purple';
  onClick?: () => void;
  interactive?: boolean;
}

export const AlbakshStamp: React.FC<AlbakshStampProps> = ({
  date,
  size = 'md',
  className = '',
  variant = 'emerald',
  onClick,
  interactive = false,
}) => {
  const formattedDate = formatDDMMYYYY(date);

  const sizeClasses = {
    sm: 'w-24 h-24 text-[8px]',
    md: 'w-32 h-32 text-[10px]',
    lg: 'w-40 h-40 text-[11px]',
  };

  const colorClasses = {
    emerald: 'text-emerald-400 border-emerald-400/80 bg-emerald-950/30 shadow-emerald-950/50',
    blue: 'text-sky-400 border-sky-400/80 bg-sky-950/30 shadow-sky-950/50',
    purple: 'text-purple-400 border-purple-400/80 bg-purple-950/30 shadow-purple-950/50',
  };

  const isClickable = Boolean(onClick || interactive);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`relative rounded-full border-4 border-dashed p-1.5 flex flex-col items-center justify-center text-center font-bold uppercase tracking-wider select-none transform transition-all ${
        isClickable
          ? 'cursor-pointer hover:scale-105 active:scale-95 hover:border-emerald-300 ring-2 ring-emerald-500/30 shadow-lg'
          : '-rotate-3 hover:rotate-0 hover:scale-105'
      } ${sizeClasses[size]} ${colorClasses[variant]} ${className}`}
      title={isClickable ? 'Click to Apply Stamp as Signature' : 'Official Seal: ALBAKSH MOLSAB'}
    >
      {/* Inner solid border ring */}
      <div className="w-full h-full rounded-full border-2 border-current/80 flex flex-col items-center justify-between p-1.5 overflow-hidden">
        {/* Top Arc Title */}
        <div className="pt-0.5 leading-none tracking-tight">
          <span className="block text-[8px] sm:text-[9px] font-black">★ ALBAKSH MOLSAB ★</span>
          <span className="block text-[6.5px] opacity-90 tracking-widest mt-0.5">TUITION ACADEMY</span>
        </div>

        {/* Center Seal Crest */}
        <div className="my-auto text-center leading-tight py-0.5">
          <span className="block text-[11px] sm:text-xs font-serif font-black tracking-normal text-emerald-200">
            مہرِ تصدیق
          </span>
          <div className="w-12 h-0.5 bg-current mx-auto my-0.5 opacity-60"></div>
          <span className="block text-[7px] sm:text-[8px] font-mono tracking-widest font-black text-amber-300">
            {formattedDate}
          </span>
          <span className="block text-[6px] tracking-widest opacity-80 mt-0.5">
            {isClickable ? 'TAP HERE TO SIGN' : 'VERIFIED & SIGNED'}
          </span>
        </div>

        {/* Bottom Arc Title */}
        <div className="pb-0.5 leading-none">
          <span className="block text-[6.5px] opacity-80 tracking-widest">OFFICIAL SEAL</span>
          <span className="block text-[7.5px] sm:text-[8px] font-black tracking-tight">STUDENTS REGISTER</span>
        </div>
      </div>

      {/* Verified Ribbon Dot */}
      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 text-[8px] flex items-center justify-center font-black shadow">
        ✓
      </div>

      {isClickable && (
        <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[7px] font-bold tracking-tight shadow animate-pulse">
          Click to Sign
        </div>
      )}
    </div>
  );
};
