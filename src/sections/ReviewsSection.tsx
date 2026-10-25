import React, { useState } from 'react';
import {
  AudioTrack,
  SectionId,
} from '../data/mockData';
import HeadRec from '../components/Reviews/HeadRec';
import LastDisc from '../components/Reviews/LastDisc';
import type { ReviewFilters } from '../components/Reviews/Filter';

interface ReviewsSectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectSection: (section: SectionId) => void;
  onPlayCustomTrack: (track: Partial<AudioTrack>) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = () => {
  const [filters, setFilters] = useState<ReviewFilters>({
    searchTerm: '',
    sortOrder: 'recent',
    year: 'TODOS',
    country: 'TODOS',
    genre: 'TODOS',
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-6 pb-20 space-y-12">
      <HeadRec filters={filters} onFiltersChange={setFilters} />
      {/* DISCO DEL MES // HIGHLIGHT EDITORIAL */}
      {/* <MonthDisc /> */}
      {/* ÚLTIMOS LANZAMIENTOS EVALUADOS (6 CARDS) */}
      <LastDisc filters={filters} />
    </div>
  );
};
