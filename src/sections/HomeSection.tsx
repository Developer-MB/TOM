import React, { useState } from 'react';
import { AudioTrack, SectionId } from '../data/mockData';
import HeadHome from '../components/Home/HeadHome';
import HeadResenias from '../components/Home/HeadResenias';
import ContentResenia from '../components/Home/ContentResenia';
import ContentVideo from '../components/Home/ContentVideo';
import ContentGallery from '../components/Home/ContentGallery';
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
    <div className="space-y-16">
      {/* HERO SECTION */}
      <section className="relative pb-12 border-b border-[#27272a] overflow-hidden">
        <HeadHome
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onSelectSection={onSelectSection}
          onPlayCustomTrack={onPlayCustomTrack}
        />
      </section>

      {/* SECCION MUSICA*/}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <HeadResenias onSelectSection={onSelectSection} />
      </section>

      {/* TIME OF NEW MUSIC */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <ContentResenia />
      </section>

      {/* VIDEOPODCAST */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <ContentVideo podcastPlaying={podcastPlaying} setPodcastPlaying={setPodcastPlaying} />
      </section>

      {/* GALERÍA DE CONCIERTOS RECIENTES */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <ContentGallery onSelectSection={onSelectSection} />
      </section>

      {/* PRÓXIMOS EVENTOS & GIRAS */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <NextTour />
      </section>
    </div>
  );
};
