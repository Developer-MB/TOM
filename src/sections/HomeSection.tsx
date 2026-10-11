import React, { useState } from 'react';
import { AudioTrack, SectionId, UPCOMING_TOURS } from '../data/mockData';
import HeadHome from '../components/organism/HeadHome';
import HeadResenias from '../components/organism/HeadResenias';
import ContentResenia from '../components/organism/ContentResenia';
import ContentVideo from '../components/organism/ContentVideo';
import ContentGallery from '../components/organism/ContentGallery';
import NextTour from '../components/organism/NextTour';

interface HomeSectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectSection: (section: SectionId) => void;
  onPlayCustomTrack: (track: Partial<AudioTrack>) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onSelectSection,
  onPlayCustomTrack,
}) => {
  const [podcastPlaying, setPodcastPlaying] = useState(false);

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-10 pb-12 border-b border-[#27272a] overflow-hidden">
        <HeadHome
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onSelectSection={onSelectSection}
          onPlayCustomTrack={onPlayCustomTrack}
        />
      </section>

      {/* ÚLTIMA HORA DEL METAL + DOUBLE AUDIO DOCK OVERLAY */}
      <section id="noticias-section" className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <HeadResenias onSelectSection={onSelectSection} />
      </section>

      {/* RESEÑAS DE DISCOS DESTACADAS */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <ContentResenia
          onSelectSection={onSelectSection}
          setReviewFilter={(filter: 'TODOS' | 'DEATH' | 'BLACK' | 'THRASH') => {
            void filter;
          }}
        />
      </section>

      {/* VIDEOPODCAST OFICIAL FEATURE MODULE */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <ContentVideo podcastPlaying={podcastPlaying} setPodcastPlaying={setPodcastPlaying} />
      </section>

      {/* GALERÍA DE CONCIERTOS RECIENTES */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <ContentGallery onSelectSection={onSelectSection} />
      </section>

      {/* PRÓXIMOS EVENTOS & GIRAS */}
      <section id="eventos-section" className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <NextTour />
      </section>
    </div>
  );
};
