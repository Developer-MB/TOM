import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { AudioTrack, SectionId } from '../data/mockData';
import HeadGallery from '../components/Gallery/HeadGallery';
import BigPhoto from '../components/Gallery/BigPhoto';
import FilterGallery from '../components/organism/FilterGallery';

interface GallerySectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectSection: (section: SectionId) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = () => {
  const [lightboxItem, setLightboxItem] = useState<{
    title: string;
    venue: string;
    date: string;
    photographer: string;
    image: string;
    exif: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-[#000] text-[#F4F4F6]">
      {/* SECTION HEADER */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <HeadGallery />
      </section>

      {/* FEATURED MONUMENTAL GALLERY */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-8">
        <BigPhoto />
      </section>

      {/* FILTER BAR & SEARCH */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-8">
        {/* 6-CARD PHOTO GALLERY GRID */}
        <FilterGallery />
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full border border-zinc-800 bg-[#0B0B0E] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block">
                  VISOR DE NEGATIVOS RAW // {lightboxItem.venue} ({lightboxItem.date})
                </span>
                <h4 className="font-display font-black text-lg uppercase text-white">
                  {lightboxItem.title}
                </h4>
              </div>
              <button
                onClick={() => setLightboxItem(null)}
                className="p-2 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[16/9] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={lightboxItem.image}
                alt={lightboxItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-6 py-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="text-zinc-400">
                FOTÓGRAFO: <span className="text-white font-bold">{lightboxItem.photographer}</span>{' '}
              </div>
              <button
                onClick={() => setLightboxItem(null)}
                className="bg-zinc-900 hover:bg-[#DC2626] text-white border border-zinc-700 px-4 py-2 uppercase tracking-wider text-[11px] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> CERRAR VISOR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
