import React, { useEffect, useMemo } from 'react';
import { Calendar, Disc, Radio, Search, Shield, ShoppingBag, X } from 'lucide-react';
import { SectionId, ASSETS } from '../../data/mockData';
import { INITIAL_CMS_ITEMS } from '../../data/Cms';
import { INITIAL_CMS_TOURS } from '../../data/HomeTours';
import { readStoredMerchCatalog } from '../../data/Merch';
import { AUDIO_ASSETS } from '../../data/Radio';

interface NavbarProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  onToggleRadioPlay: () => void;
  isPlaying: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  categoryLabel: string;
  section: SectionId;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onSelectSection,
  searchQuery,
  onSearchChange,
}) => {
  const navItems: { id: SectionId; label: string; sub?: string }[] = [
    { id: 'inicio', label: 'INICIO' },
    { id: 'resenas', label: 'RECOMENDACIONES' },
    { id: 'galeria', label: 'GALERÍA' },
    { id: 'videopodcast', label: 'VIDEOS' },
    { id: 'eventos', label: 'PRÓXIMOS EVENTOS' },
    { id: 'radio', label: 'RADIO' },
    { id: 'merch', label: 'MERCH' },
    { id: 'contacto', label: 'CONTACTO' },
  ];

  // Close search dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && searchQuery) {
        onSearchChange('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, onSearchChange]);

  const globalResults = useMemo<GlobalSearchResult[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    const results: GlobalSearchResult[] = [];

    for (const post of INITIAL_CMS_ITEMS) {
      if (
        post.status === 'PUBLICADO' &&
        (post.disc.toLowerCase().includes(q) ||
          post.band.toLowerCase().includes(q) ||
          post.genre.toLowerCase().includes(q))
      ) {
        results.push({
          id: `rec-${post.id}`,
          title: `${post.band} — ${post.disc}`,
          subtitle: `${post.genre} · ${post.country}`,
          categoryLabel: 'RECOMENDACIÓN',
          section: 'resenas',
        });
      }
    }

    for (const tour of INITIAL_CMS_TOURS) {
      if (
        tour.status === 'PUBLICADO' &&
        (tour.band.toLowerCase().includes(q) ||
          tour.tourName.toLowerCase().includes(q) ||
          tour.venue.toLowerCase().includes(q))
      ) {
        results.push({
          id: `tour-${tour.id}`,
          title: `${tour.band} (${tour.tourName})`,
          subtitle: `${tour.venue} · ${tour.day}/${tour.month}/${tour.year}`,
          categoryLabel: 'GIRA / EVENTO',
          section: 'eventos',
        });
      }
    }

    for (const merch of readStoredMerchCatalog()) {
      if (
        merch.status === 'PUBLICADO' &&
        (merch.name.toLowerCase().includes(q) ||
          merch.category.toLowerCase().includes(q) ||
          merch.code.toLowerCase().includes(q))
      ) {
        results.push({
          id: `merch-${merch.id}`,
          title: merch.name,
          subtitle: `${merch.category} · $${merch.price} MXN`,
          categoryLabel: 'MERCH OFICIAL',
          section: 'merch',
        });
      }
    }

    for (const track of AUDIO_ASSETS) {
      if (
        track.title.toLowerCase().includes(q) ||
        track.band.toLowerCase().includes(q) ||
        track.disc.toLowerCase().includes(q)
      ) {
        results.push({
          id: `radio-${track.id}`,
          title: `${track.band} — ${track.title}`,
          subtitle: `Álbum: ${track.disc}`,
          categoryLabel: 'RADIO 24/7',
          section: 'radio',
        });
      }
    }

    return results.slice(0, 8);
  }, [searchQuery]);

  const handleSelectResult = (section: SectionId) => {
    onSelectSection(section);
    onSearchChange('');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4 relative">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onSelectSection('inicio');
            }}
            className="text-left group flex items-center leading-none cursor-pointer"
          >
            <img
              src={ASSETS.logoWhite}
              alt="Time of Metal"
              className="h-11 sm:h-13 lg:h-14 w-auto object-contain"
            />
          </button>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center justify-center gap-3.5 xl:gap-5 min-w-0">
          {navItems.map((item, idx) => {
            const isActive = activeSection === item.id && !item.sub;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`font-mono text-[11px] tracking-[0.08em] uppercase transition-colors cursor-pointer py-1 border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'text-white border-[#dc2626] font-semibold'
                    : 'text-[#a1a1aa] border-transparent hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Search + CMS/ADMIN */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar bandas, giras, merch..."
              aria-label="Buscador global del sitio"
              className="bg-[#121214] border border-[#27272a] focus:border-[#dc2626] rounded-sm pl-8 pr-7 py-1.5 text-xs font-mono text-[#f4f4f5] placeholder-[#71717a] w-40 lg:w-44 xl:w-56 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Panel desplegable de resultados globales */}
            {searchQuery.trim().length >= 2 && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 border border-zinc-700 bg-[#0B0B0E] shadow-2xl z-50">
                <div className="flex items-center justify-between border-b border-zinc-800 px-3.5 py-2 font-mono text-[10px] uppercase text-zinc-400">
                  <span>Resultados Globales ({globalResults.length})</span>
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="text-zinc-500 hover:text-white cursor-pointer"
                  >
                    Cerrar [ESC]
                  </button>
                </div>
                {globalResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/80 font-mono text-xs">
                    {globalResults.map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => handleSelectResult(res.section)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-[#14090B] transition-colors flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-white font-bold truncate">{res.title}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{res.subtitle}</p>
                        </div>
                        <span className="shrink-0 border border-[#DC2626]/50 bg-[#DC2626]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#DC2626] flex items-center gap-1">
                          {res.section === 'resenas' && <Disc className="w-2.5 h-2.5" />}
                          {res.section === 'eventos' && <Calendar className="w-2.5 h-2.5" />}
                          {res.section === 'merch' && <ShoppingBag className="w-2.5 h-2.5" />}
                          {res.section === 'radio' && <Radio className="w-2.5 h-2.5" />}
                          {res.categoryLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center font-mono text-xs text-zinc-500">
                    No se encontraron coincidencias para "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectSection('cms');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm border font-mono text-[10px] tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'cms'
                ? 'bg-[#dc2626] border-[#ef4444] text-white'
                : 'bg-[#18181b] border-[#3f3f46] text-[#e4e4e7] hover:border-[#71717a]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#dc2626] shrink-0" />
            <span>CMS / ADMIN</span>
          </button>
        </div>
      </div>

      {/* Tablet & Mobile Bottom Section Switcher Bar */}
      <div className="lg:hidden bg-[#121214] border-t border-[#27272a]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'inicio', label: 'INICIO' },
            { id: 'resenas', label: 'RECOMENDACIONES' },
            { id: 'galeria', label: 'GALERÍA' },
            { id: 'videopodcast', label: 'VIDEOS' },
            { id: 'eventos', label: 'PRÓXIMOS EVENTOS' },
            { id: 'radio', label: 'RADIO' },
            { id: 'merch', label: 'MERCH' },
            { id: 'contacto', label: 'CONTACTO' },
            { id: 'cms', label: 'CMS ADMIN' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onSelectSection(tab.id as SectionId);
              }}
              className={`px-2.5 py-1 rounded-sm font-mono text-[10px] whitespace-nowrap uppercase shrink-0 transition-colors cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-[#dc2626] text-white font-semibold'
                  : 'bg-[#18181b] text-[#a1a1aa] border border-[#27272a] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
