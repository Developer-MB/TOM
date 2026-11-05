import React from 'react';
import { Youtube } from 'lucide-react';
import { SectionId } from '../../data/mockData';

interface FooterProps {
  onSelectSection: (section: SectionId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectSection }) => {
  const navTo = (sec: SectionId) => {
    onSelectSection(sec);
  };

  const hoy = new Date();
  const anioActual = hoy.getFullYear();

  return (
    <footer className="w-full bg-[#09090b] border-t border-[#27272a] pt-12 sm:pt-14 pb-10 text-[#a1a1aa]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 sm:pb-12 border-b border-[#18181b]">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#dc2626] flex items-center justify-center text-white font-mono text-xs font-bold shrink-0">
                ((•))
              </div>
              <span className="font-display font-extrabold text-lg tracking-wider text-white uppercase">
                TIME OF METAL
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#a1a1aa] max-w-md">
              El bastión definitivo de la música extrema. Crítica mordaz, lanzamientos globales, coberturas exclusivas desde el foso y transmisión ininterrumpida de metal pesado las 24 horas.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#71717a] uppercase">
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
                <button onClick={() => navTo('resenas')} className="hover:text-white transition-colors cursor-pointer">
                  Recomendaciones
                </button>
              </li>
              <li>
                <button onClick={() => navTo('galeria')} className="hover:text-white transition-colors cursor-pointer">
                  Galería
                </button>
              </li>
              <li>
                <button onClick={() => navTo('videopodcast')} className="hover:text-white transition-colors cursor-pointer">
                  Videopodcast
                </button>
              </li>
              <li>
                <button onClick={() => navTo('eventos')} className="hover:text-white transition-colors cursor-pointer">
                  Próximos Eventos
                </button>
              </li>
              <li>
                <button onClick={() => navTo('merch')} className="hover:text-white transition-colors cursor-pointer">
                  Mercancía
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
                  Radio
                </button>
              </li>
            </ul>
          </div>

          {/* Comunidad */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              COMUNIDAD
            </h4>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Únete al moshpit digital y recibe el boletín semanal de lanzamientos oscuros.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2" role="group" aria-label="Redes sociales">
              {[
                {
                  label: 'YouTube',
                  className: 'hover:text-[#FF0000] hover:border-[#FF0000]',
                  icon: (
                    <a href="https://www.youtube.com/@TimeOfMetal-mx" target="_blank" rel="noopener noreferrer" className="text-inherit">
                      <Youtube className="w-4 h-4" aria-hidden="true" />
                    </a>
                  ),
                },
                {
                  label: 'Facebook',
                  className: 'hover:text-[#1877F2] hover:border-[#1877F2]',
                  icon: (
                    <a href="https://www.facebook.com/p/Time-Of-Metal-61566383783967/" target="_blank" rel="noopener noreferrer" className="text-inherit">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                        <path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4Z" />
                      </svg>
                    </a>
                  ),
                },
                {
                  label: 'TikTok',
                  className: 'hover:text-[#25F4EE] hover:border-[#25F4EE]',
                  icon: (
                    <a href="https://www.tiktok.com/@timeofmetal" target="_blank" rel="noopener noreferrer" className="text-inherit">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                        <path fill="currentColor" d="M19.6 8.2a6.7 6.7 0 0 1-4-1.3v8.2a5.6 5.6 0 1 1-5.6-5.6c.4 0 .8 0 1.2.1v3.1a2.6 2.6 0 1 0 1.4 2.4V3h3.1c.2 2 1.7 3.6 3.9 3.8v1.4Z" />
                      </svg>
                    </a>
                  ),
                },
                {
                  label: 'Instagram',
                  className: 'hover:text-[#E4405F] hover:border-[#E4405F]',
                  icon: (
                    <a href="https://www.instagram.com/timeofmetalx/" target="_blank" rel="noopener noreferrer" className="text-inherit">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                        <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="17.7" cy="6.8" r="1.1" fill="currentColor" />
                      </svg>
                    </a>
                  ),
                },
                {
                  label: 'Spotify',
                  className: 'hover:text-[#1DB954] hover:border-[#1DB954]',
                  icon: (
                    <a href="https://open.spotify.com/show/46Lm5as6pkUglvkIAzUjLd" target="_blank" rel="noopener noreferrer" className="text-inherit">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M7.2 9.2c3.4-1 7.5-.6 10.1 1M8 12.2c2.8-.8 6-.5 8.3.8M8.8 15c2.1-.6 4.5-.3 6.2.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
                      </svg>
                    </a>
                  ),
                },
              ].map(({ label, className, icon }) => (
                <span
                  key={label}
                  role="img"
                  aria-label={label}
                  className={`w-8 h-8 rounded-sm bg-[#121214] border border-[#27272a] flex items-center justify-center text-[#a1a1aa] transition-colors ${className}`}
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-[#71717a] text-center sm:text-left">
          <div>
            © {anioActual} TIME OF METAL. Todos los derechos reservados. · Dedicado a la preservación del Underground Nacional e Internacional.
          </div>
        </div>
      </div>
    </footer>
  );
};
