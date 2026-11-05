import React from 'react';
import { AudioTrack } from '../data/mockData';
import HeadRadio from '../components/Radio/HeadRadio';
import ContentRadio from '../components/Radio/ContentRadio';

interface RadioSectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  audioAnalyser: AnalyserNode | null;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onSelectTrack: (track: Partial<AudioTrack>) => void;
}

export const RadioSection: React.FC<RadioSectionProps> = ({
  currentTrack,
  isPlaying,
  audioAnalyser,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  onSelectTrack,
}) => {
  return (
    <div className="min-h-screen bg-black text-[#F4F4F6]">
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-zinc-800/80">
          <HeadRadio />
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <ContentRadio
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          audioAnalyser={audioAnalyser}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          volume={volume}
          onVolumeChange={onVolumeChange}
          onSelectTrack={onSelectTrack}
        />
      </section>
    </div>
  );
};
