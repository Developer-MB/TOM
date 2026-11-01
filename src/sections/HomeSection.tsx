import React from 'react';
import { SectionId } from '../data/mockData';
import HeadHome from '../components/Home/HeadHome';
import HeadResenias from '../components/Home/HeadResenias';
import ContentResenia from '../components/Home/ContentResenia';
import ContentVideo from '../components/Home/ContentVideo';
import ContentGallery from '../components/Home/ContentGallery';
import NextTour from '../components/Tours/NextTour';

interface HomeSectionProps {
  onSelectSection: (section: SectionId) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onSelectSection,
}) => {
  return (
    <div className="space-y-16">
      {/* HERO SECTION */}
      <section className="relative pb-12 border-b border-[#27272a] overflow-hidden">
        <HeadHome
          onSelectSection={onSelectSection}
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
        <ContentVideo
          onSelectSection={onSelectSection}
        />
      </section>

      {/* GALERÍA DE CONCIERTOS RECIENTES */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <ContentGallery onSelectSection={onSelectSection} />
      </section>

      {/* PRÓXIMOS EVENTOS & GIRAS */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <NextTour onSelectSection={onSelectSection} />
      </section>
    </div>
  );
};
