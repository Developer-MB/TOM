import React from 'react';
import { Radio, Youtube, Disc, Rss } from 'lucide-react';
import { SectionId } from '../data/mockData';

interface FooterProps {
  onSelectSection: (section: SectionId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectSection }) => {
  const navTo = (sec: SectionId) => {
    onSelectSection(sec);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#09090b] border-t border-[#27272a] pt-14 pb-10 text-[#a1a1aa]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#18181b]">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#dc2626] flex items-center justify-center text-white font-mono text-xs font-bold">
                ((•))
              </div>
              <span className="font-display font-extrabold text-lg tracking-wider text-white uppercase">
                TIME OF METAL
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#a1a1aa] max-w-md">
              El bastión definitivo de la música extrema. Crítica mordaz, lanzamientos globales, coberturas exclusivas desde el foso y transmisión ininterrumpida de metal pesado las 24 horas.
            </p>
            <div className="pt-1 flex items-center gap-2 font-mono text-[10px] text-[#71717a] uppercase">
              <span>FRECUENCIA:</span>
              <span className="px-2 py-0.5 bg-[#121214] border border-[#27272a] text-[#e4e4e7] rounded-sm">
                FLAC 24-BIT HQ
              </span>
            </div>
          </div>

          {/* Navegación */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              NAVEGACIÓN
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navTo('inicio')} className="hover:text-white transition-colors cursor-pointer">
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => navTo('inicio')} className="hover:text-white transition-colors cursor-pointer">
                  Noticias Globales
                </button>
              </li>
              <li>
                <button onClick={() => navTo('resenas')} className="hover:text-white transition-colors cursor-pointer">
                  Reseñas de Discos
                </button>
              </li>
              <li>
                <button onClick={() => navTo('galeria')} className="hover:text-white transition-colors cursor-pointer">
                  Galerías de Conciertos
                </button>
              </li>
              <li>
                <button onClick={() => navTo('videopodcast')} className="hover:text-white transition-colors cursor-pointer">
                  Videopodcast Oficial
                </button>
              </li>
            </ul>
          </div>

          {/* Transmisión */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              TRANSMISIÓN
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navTo('radio')} className="hover:text-white transition-colors cursor-pointer">
                  Radio Online 24/7
                </button>
              </li>
              <li>
                <button onClick={() => navTo('inicio')} className="hover:text-white transition-colors cursor-pointer">
                  Cartelera de Giras
                </button>
              </li>
              <li>
                <button onClick={() => navTo('cms')} className="hover:text-white transition-colors cursor-pointer">
                  Acceso Redacción
                </button>
              </li>
              <li>
                <button onClick={() => navTo('resenas')} className="hover:text-white transition-colors cursor-pointer">
                  Prensa y Promotores
                </button>
              </li>
            </ul>
          </div>

          {/* Comunidad */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              COMUNIDAD
            </h4>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Únete al moshpit digital y recibe el boletín semanal de lanzamientos oscuros.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {[Radio, Youtube, Disc, Rss].map((Icon, i) => (
                <button
                  key={i}
                  onClick={() => navTo('radio')}
                  className="w-8 h-8 rounded-sm bg-[#121214] border border-[#27272a] hover:border-[#dc2626] flex items-center justify-center text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-[#71717a]">
          <div>
            © 2025 TIME OF METAL. Todos los derechos reservados. · Dedicado a la preservación del Underground Internacional.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navTo('inicio')} className="hover:text-[#a1a1aa] cursor-pointer">Términos de Uso</button>
            <button onClick={() => navTo('inicio')} className="hover:text-[#a1a1aa] cursor-pointer">Privacidad</button>
            <button onClick={() => navTo('resenas')} className="hover:text-[#a1a1aa] cursor-pointer">Manifiesto Editorial</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
