import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Music, Info, BellRing, Upload, Check } from 'lucide-react';

interface NaatPlayerProps {
  naatTitle?: string;
  naatUrl?: string;
  autoPlayTriggered?: boolean;
  onCloseAutoAlert?: () => void;
  compact?: boolean;
}

export const NaatPlayer: React.FC<NaatPlayerProps> = ({
  naatTitle = 'Ae Kaash Main Ban Jaaon Madine Ka Musafir (Naat Sharif)',
  naatUrl = '/naat.mp3',
  autoPlayTriggered = false,
  onCloseAutoAlert,
  compact = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentAudioSrc, setCurrentAudioSrc] = useState<string>(naatUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    setCurrentAudioSrc(naatUrl);
  }, [naatUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (autoPlayTriggered && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          setAutoplayBlocked(true);
        });
    }
  }, [autoPlayTriggered]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch (err) {
        console.warn('Playback error:', err);
        setAutoplayBlocked(true);
      }
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setCurrentAudioSrc(objectUrl);
      setUploadedFileName(file.name);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 200);
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return '0:00';
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={`rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 p-4 sm:p-5 shadow-xl ${compact ? 'text-xs' : ''}`}>
      <audio
        ref={audioRef}
        src={currentAudioSrc}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*"
        className="hidden"
      />

      {/* Auto-play Prompt if triggered by timetable */}
      {autoPlayTriggered && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-amber-500/20 border border-amber-500/40 p-2.5 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>
              <strong>Tuition Alert:</strong> Scheduled Naat reminder is active.
            </span>
          </div>
          {onCloseAutoAlert && (
            <button
              onClick={onCloseAutoAlert}
              className="text-[11px] font-bold text-amber-300 underline hover:text-white"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {autoplayBlocked && (
        <div className="mb-3 rounded-xl bg-slate-800/80 border border-slate-700 p-2.5 text-xs text-slate-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Tap <strong>&quot;Play Naat&quot;</strong> below to listen. (Android requires user touch interaction before playing audio).
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Title and Icon */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${isPlaying ? 'bg-emerald-500 text-slate-950 animate-pulse ring-4 ring-emerald-500/20' : 'bg-emerald-900/60 text-emerald-400 border border-emerald-500/40'}`}>
            <Music className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                OFFICIAL NAAT SHARIF
              </span>
              {uploadedFileName && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Custom Audio
                </span>
              )}
            </div>
            <h4 className="font-black text-white text-sm sm:text-base tracking-wide truncate mt-0.5">
              {uploadedFileName ? uploadedFileName : naatTitle}
            </h4>
            <p className="text-xs text-emerald-300 flex items-center gap-2 mt-0.5 font-medium">
              <span className="font-serif">اے کاش میں بن جاؤں مدینے کا مسافر</span>
              <span>•</span>
              <span className="font-mono text-emerald-400">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Play/Pause & Stop */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Naat</span>
                </>
              )}
            </button>

            <button
              onClick={handleStop}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Stop"
            >
              <Square className="w-4 h-4" />
            </button>

            {/* Custom Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              title="Upload your own custom MP3 audio file"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Change Audio</span>
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
