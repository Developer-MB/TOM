import React from 'react';
import { SectionId } from '../data/mockData';
import HeadHome from '../components/Home/HeadHome';
import HeadResenias from '../components/Home/HeadResenias';
import ContentResenia from '../components/Home/ContentResenia';
import ContentVideo from '../components/Home/ContentVideo';
import ContentGallery from '../components/Home/ContentGallery';
import NextTour from '../components/Tours/NextTour';
import type { CmsPostItem } from '../data/Cms';
import type { HomeGalleryItem } from '../data/HomePics';

interface HomeSectionProps {
  onSelectSection: (section: SectionId) => void;
  reviews: CmsPostItem[];
  galleries: HomeGalleryItem[];
  isLoadingReviews: boolean;
  reviewsError: string | null;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  onSelectSection,
  reviews,
  galleries,
  isLoadingReviews,
  reviewsError,
}) => {
  const recentGalleries = [...galleries]
    .sort((first, second) => {
      const firstPublishedAt = Date.parse(first.publish ?? '');
      const secondPublishedAt = Date.parse(second.publish ?? '');
      const firstHasValidDate = Number.isFinite(firstPublishedAt);
      const secondHasValidDate = Number.isFinite(secondPublishedAt);

      if (firstHasValidDate && secondHasValidDate) return secondPublishedAt - firstPublishedAt;
      if (firstHasValidDate) return -1;
      if (secondHasValidDate) return 1;
      return 0;
    })
    .slice(0, 3);

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
        <ContentResenia
          reviews={reviews}
          isLoading={isLoadingReviews}
          error={reviewsError}
        />
      </section>

      {/* VIDEOPODCAST */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <ContentVideo
          onSelectSection={onSelectSection}
        />
      </section>

      {/* GALERÍA DE CONCIERTOS RECIENTES */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <ContentGallery galleries={recentGalleries} onSelectSection={onSelectSection} />
      </section>

      {/* PRÓXIMOS EVENTOS & GIRAS */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <NextTour onSelectSection={onSelectSection} />
      </section>
    </div>
  );
};
