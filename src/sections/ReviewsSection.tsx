import React, { useState } from 'react';
import {
  AudioTrack,
  SectionId,
} from '../data/mockData';
import HeadRec from '../components/Reviews/HeadRec';
import LastDisc from '../components/Reviews/LastDisc';
import type { ReviewFilters } from '../components/Reviews/Filter';
import type { CmsPostItem } from '../data/Cms';

interface ReviewsSectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectSection: (section: SectionId) => void;
  onPlayCustomTrack: (track: Partial<AudioTrack>) => void;
  reviews: CmsPostItem[];
  isLoadingReviews: boolean;
  reviewsError: string | null;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  isLoadingReviews,
  reviewsError,
}) => {
  const [filters, setFilters] = useState<ReviewFilters>({
    searchTerm: '',
    sortOrder: 'recent',
    year: 'TODOS',
    country: 'TODOS',
    genre: 'TODOS',
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-6 pb-20 space-y-12">
      <HeadRec reviews={reviews} filters={filters} onFiltersChange={setFilters} />
      {/* DISCO DEL MES // HIGHLIGHT EDITORIAL */}
      {/* <MonthDisc /> */}
      {/* ÚLTIMOS LANZAMIENTOS EVALUADOS (6 CARDS) */}
      {reviewsError ? (
        <p role="alert" className="border border-red-900 bg-red-950/40 p-5 text-sm text-red-300">
          No se pudieron cargar las recomendaciones: {reviewsError}
        </p>
      ) : isLoadingReviews ? (
        <p className="border border-[#27272a] bg-[#121214] p-5 text-sm text-[#a1a1aa]">
          Cargando recomendaciones…
        </p>
      ) : (
        <LastDisc reviews={reviews} filters={filters} />
      )}
    </div>
  );
};
