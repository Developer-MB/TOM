import React from 'react';
import { Search, Shield } from 'lucide-react';
import { SectionId, ASSETS } from '../../data/mockData';

interface NavbarProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  onToggleRadioPlay: () => void;
  isPlaying: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
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
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
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
        <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 min-w-0">
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
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar bandas, álbumes..."
              className="bg-[#121214] border border-[#27272a] focus:border-[#dc2626] rounded-sm pl-8 pr-3 py-1.5 text-xs font-mono text-[#f4f4f5] placeholder-[#71717a] w-40 lg:w-44 xl:w-56 outline-none transition-colors"
            />
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
