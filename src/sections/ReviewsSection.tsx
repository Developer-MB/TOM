import React from 'react';
import {
  AudioTrack,
  SectionId,
} from '../data/mockData';
import HeadRec from '../components/organism/HeadRec';
import MonthDisc from '../components/organism/MonthDisc';
import LastDisc from '../components/organism/LastDisc';

interface ReviewsSectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectSection: (section: SectionId) => void;
  onPlayCustomTrack: (track: Partial<AudioTrack>) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-6 pb-20 space-y-12">
      <HeadRec />

      {/* DISCO DEL MES // HIGHLIGHT EDITORIAL */}
      <MonthDisc />

      {/* ÚLTIMOS LANZAMIENTOS EVALUADOS (6 CARDS) */}
      <LastDisc />

    </div>
  );
};
