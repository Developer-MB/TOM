import React from 'react';
import { Search, Shield, Play } from 'lucide-react';
import { SectionId } from '../data/mockData';

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
  onToggleRadioPlay,
  isPlaying,
  searchQuery,
  onSearchChange,
}) => {
  const navItems: { id: SectionId; label: string; sub?: string }[] = [
    { id: 'inicio', label: 'INICIO' },
    { id: 'inicio', label: 'NOTICIAS', sub: 'noticias' },
    { id: 'resenas', label: 'RESEÑAS DE DISCOS' },
    { id: 'galeria', label: 'GALERÍA DE FOTOS' },
    { id: 'videopodcast', label: 'VIDEOPODCAST' },
    { id: 'inicio', label: 'PRÓXIMOS EVENTOS', sub: 'eventos' },
    { id: 'radio', label: 'RADIO EN VIVO' },
  ];

  const handleNavClick = (item: { id: SectionId; label: string; sub?: string }) => {
    onSelectSection(item.id);
    if (item.sub === 'noticias') {
      setTimeout(() => {
        document.getElementById('noticias-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (item.sub === 'eventos') {
      setTimeout(() => {
        document.getElementById('eventos-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand + Live Pill */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => {
              onSelectSection('inicio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-left group flex flex-col leading-none"
          >
            <span className="font-display font-extrabold text-lg tracking-tight text-white group-hover:text-[#ef4444] transition-colors">
              OF METAL
            </span>
            <span className="font-mono text-[9px] tracking-[0.15em] text-[#71717a] uppercase mt-0.5">
              PORTAL PESADO & RADIO
            </span>
          </button>

          {/* ON AIR Widget */}
          <div className="hidden xl:flex items-center gap-2.5 bg-[#121214] border border-[#27272a] rounded px-2.5 py-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
              <span className="font-mono text-[10px] font-bold text-[#f4f4f5] leading-tight uppercase">
                ON<br />AIR
              </span>
            </div>
            <span className="h-4 w-[1px] bg-[#27272a]" />
            <span className="font-mono text-[11px] text-[#a1a1aa] truncate max-w-[130px]">
              Death Metal Sanc...
            </span>
            <button
              onClick={() => {
                onToggleRadioPlay();
                onSelectSection('radio');
              }}
              className="flex items-center gap-1 bg-[#dc2626] hover:bg-[#ef4444] text-white font-mono text-[10px] font-semibold px-2.5 py-1 rounded-sm transition-colors cursor-pointer"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>{isPlaying ? 'EN VIVO' : 'SINTONIZAR'}</span>
            </button>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 overflow-x-auto">
          {navItems.map((item, idx) => {
            const isActive =
              activeSection === item.id && !item.sub;
            return (
              <button
                key={idx}
                onClick={() => handleNavClick(item)}
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
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar bandas, álbumes, no..."
              className="bg-[#121214] border border-[#27272a] focus:border-[#dc2626] rounded-sm pl-8 pr-3 py-1.5 text-xs font-mono text-[#f4f4f5] placeholder-[#71717a] w-48 xl:w-56 outline-none transition-colors"
            />
          </div>

          <button
            onClick={() => {
              onSelectSection('cms');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-mono text-[10px] tracking-wider uppercase transition-colors cursor-pointer ${
              activeSection === 'cms'
                ? 'bg-[#dc2626] border-[#ef4444] text-white'
                : 'bg-[#18181b] border-[#3f3f46] text-[#e4e4e7] hover:border-[#71717a]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#dc2626]" />
            <span>CMS / ADMIN</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Section Switcher Bar */}
      <div className="flex lg:hidden items-center gap-2 px-4 py-2 bg-[#121214] border-t border-[#27272a] overflow-x-auto">
        {[
          { id: 'inicio', label: 'INICIO' },
          { id: 'resenas', label: 'JUICIO CRÍTICO (RESEÑAS)' },
          { id: 'galeria', label: 'GALERÍA DE FOTOS' },
          { id: 'videopodcast', label: 'VIDEOPODCAST 4K' },
          { id: 'radio', label: 'RADIO 24/7' },
          { id: 'cms', label: 'CMS ADMIN' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              onSelectSection(tab.id as SectionId);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-2.5 py-1 rounded-sm font-mono text-[10px] whitespace-nowrap uppercase ${
              activeSection === tab.id
                ? 'bg-[#dc2626] text-white font-semibold'
                : 'bg-[#18181b] text-[#a1a1aa] border border-[#27272a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
