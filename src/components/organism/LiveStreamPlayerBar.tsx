import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { AudioTrack, SectionId } from '../../data/mockData';

interface LiveStreamPlayerBarProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNavigateToRadio?: (section: SectionId) => void;
}

export const LiveStreamPlayerBar: React.FC<LiveStreamPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
}) => {
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(65);

  return (
    <div className="w-full bg-[#121214]/95 backdrop-blur-md border-y border-[#27272a] px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
      {/* Left: Play/Pause + Track Info */}
      <div className="flex items-center gap-3 min-w-[240px]">
        <button
          onClick={onTogglePlay}
          className="w-8 h-8 rounded-full bg-[#dc2626] hover:bg-[#ef4444] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer crimson-glow-sm"
          aria-label={isPlaying ? 'Pausar stream' : 'Reproducir stream'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>
        <div className="leading-tight">
          <div className="flex items-center gap-1.5 font-mono text-xs text-white font-semibold">
            <span className="text-[#ef4444] uppercase">LIVE STREAM</span>
            <span className="text-[#71717a]">-</span>
            <span>
              {currentTrack.artist} - {currentTrack.title}
            </span>
          </div>
          <p className="font-mono text-[10px] text-[#71717a]">
            {currentTrack.album}
          </p>
        </div>
      </div>

      {/* Center: Scrub Bar */}
      <div className="flex-1 max-w-xl flex items-center gap-3">
        <span className="font-mono text-[10px] text-[#a1a1aa]">
          {currentTrack.currentTime}
        </span>
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            setProgress(Math.round(pct));
          }}
          className="flex-1 h-1 bg-[#27272a] rounded-full overflow-hidden cursor-pointer relative"
        >
          <div
            className="h-full bg-[#dc2626] transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-[#71717a]">
          {currentTrack.duration}
        </span>
      </div>

      {/* Right: Volume + FLAC Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMuted(!muted)}
          className="text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
          aria-label="Silenciar"
        >
          {muted ? <VolumeX className="w-4 h-4 text-[#ef4444]" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 bg-[#18181b] border border-[#3f3f46] text-[#a1a1aa] rounded-sm">
          {currentTrack.bitrate}
        </span>
      </div>
    </div>
  );
};
