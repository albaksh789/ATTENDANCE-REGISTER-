import React, { useState } from 'react';
import { AttendanceStatus } from '../types';
import { Check, X, Clock, Sparkles } from 'lucide-react';

interface AttendanceStatusButtonProps {
  status: AttendanceStatus;
  isSelected: boolean;
  onClick: () => void;
  label: string;
  compact?: boolean;
}

export const AttendanceStatusButton: React.FC<AttendanceStatusButtonProps> = ({
  status,
  isSelected,
  onClick,
  label,
  compact = false,
}) => {
  const [justPressed, setJustPressed] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setJustPressed(true);
    onClick();
    setTimeout(() => {
      setJustPressed(false);
    }, 450);
  };

  // Status-specific themes
  const config = {
    Present: {
      activeBg: 'bg-emerald-600 text-white border-emerald-400/80 shadow-emerald-950/60',
      activeRing: 'ring-2 ring-emerald-400/60',
      glowClass: 'anim-green-glow',
      iconAnim: 'anim-icon-check',
      Icon: Check,
      tagColor: 'text-emerald-200',
      indicatorBg: 'bg-emerald-400',
    },
    Absent: {
      activeBg: 'bg-rose-600 text-white border-rose-400/80 shadow-rose-950/60',
      activeRing: 'ring-2 ring-rose-400/60',
      glowClass: 'anim-red-glow',
      iconAnim: 'anim-icon-shake',
      Icon: X,
      tagColor: 'text-rose-200',
      indicatorBg: 'bg-rose-400',
    },
    Leave: {
      activeBg: 'bg-amber-600 text-white border-amber-400/80 shadow-amber-950/60',
      activeRing: 'ring-2 ring-amber-400/60',
      glowClass: 'anim-amber-glow',
      iconAnim: 'anim-button-pop',
      Icon: Clock,
      tagColor: 'text-amber-200',
      indicatorBg: 'bg-amber-400',
    },
  }[status];

  const IconComponent = config.Icon;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative overflow-hidden group flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all duration-200 select-none border active:scale-90 active:duration-75 ${
        compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
      } ${
        isSelected
          ? `${config.activeBg} ${config.activeRing} shadow-md font-black`
          : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750 border-slate-700/60'
      } ${justPressed ? `anim-button-pop ${config.glowClass}` : ''}`}
      title={`Mark as ${status}`}
    >
      {/* Expanding Ripple Ring on Press */}
      {justPressed && (
        <span
          className={`absolute inset-0 rounded-xl pointer-events-none animate-ping opacity-35 ${config.indicatorBg}`}
        />
      )}

      {/* Animated Icon Indicator */}
      <span className="flex items-center justify-center">
        {isSelected ? (
          <IconComponent
            className={`w-3.5 h-3.5 shrink-0 stroke-[2.5] ${
              justPressed ? config.iconAnim : 'animate-in zoom-in-75 duration-150'
            }`}
          />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-slate-400 transition" />
        )}
      </span>

      {/* Label Text */}
      <span className="tracking-tight">{label}</span>

      {/* Micro-sparkle pulse on active click */}
      {justPressed && (
        <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-0.5 -right-0.5 animate-spin duration-300 pointer-events-none" />
      )}
    </button>
  );
};
