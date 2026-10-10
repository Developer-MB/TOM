import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  Calendar,
  Aperture,
  Maximize2,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  Mail,
  Send,
  ShieldCheck,
  X,
  Eye,
} from 'lucide-react';
import {
  ASSETS,
  AudioTrack,
  PHOTO_GALLERIES,
  SectionId,
} from '../data/mockData';
import { LiveStreamPlayerBar } from '../components/LiveStreamPlayerBar';

interface GallerySectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectSection: (section: SectionId) => void;
}

const GALLERY_FILTERS = [
  { id: 'TODOS LOS EVENTOS', count: 24 },
  { id: 'FESTIVALES', count: 9 },
  { id: 'GIRAS MUNDIALES', count: 8 },
  { id: 'CLUBES & UNDERGROUND', count: 5 },
  { id: 'EXCLUSIVAS PIT', count: 2 },
];

export const GallerySection: React.FC<GallerySectionProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onSelectSection,
}) => {
  const [activeFilter, setActiveFilter] = useState('TODOS LOS EVENTOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxItem, setLightboxItem] = useState<{
    title: string;
    venue: string;
    date: string;
    photographer: string;
    image: string;
    exif: string;
  } | null>(null);
  const [pressStatus, setPressStatus] = useState<string | null>(null);

  const filteredGalleries = PHOTO_GALLERIES.filter((g) => {
    const matchesCategory =
      activeFilter === 'TODOS LOS EVENTOS' || g.category === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.photographer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePressRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setPressStatus('SOLICITUD DE ACREDITACIÓN RECIBIDA EN MESA DE PRENSA.');
    setTimeout(() => setPressStatus(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6]">
      {/* SECTION HEADER */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 flex items-center gap-1.5">
                <Camera className="w-3 h-3" /> ARCHIVO VISUAL DE DIRECTOS
              </span>
              <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest">
                // FOTOPERIODISMO DESDE EL FOSO
              </span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight leading-[0.92] text-white">
              CRÓNICAS DE{' '}
              <span className="text-[#DC2626]">FUEGO Y SANGRE</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mt-3 leading-relaxed">
              Fotografía documental en alta resolución capturada sin flash desde la primera línea de fuego. El sudor, la pirotecnia y la catarsis ritual de los escenarios más extremos del planeta.
            </p>
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-3 border border-zinc-800 bg-[#0E0E12] divide-x divide-zinc-800 self-start lg:self-end shrink-0">
            <div className="px-5 py-3.5 text-center">
              <div className="font-display font-black text-2xl text-white">148</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-0.5">
                COBERTURAS
              </div>
            </div>
            <div className="px-5 py-3.5 text-center">
              <div className="font-display font-black text-2xl text-[#DC2626]">6.4K</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-0.5">
                NEGATIVOS RAW
              </div>
            </div>
            <div className="px-5 py-3.5 text-center">
              <div className="font-display font-black text-2xl text-white">18</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-0.5">
                PAÍSES
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MONUMENTAL GALLERY */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-8">
        <div className="border border-zinc-800 bg-[#0E0E12] relative overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left / Main Image */}
            <div className="lg:col-span-8 relative min-h-[380px] sm:min-h-[480px] overflow-hidden bg-black">
              <img
                src={ASSETS.concertPyro}
                alt="Behemoth Wacken Open Air"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-black/40" />

              {/* Top Overlay Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                  COBERTURA ESTELAR // EXCLUSIVA
                </span>
                <span className="bg-black/80 backdrop-blur-sm border border-zinc-700 text-zinc-200 font-mono text-[10px] uppercase tracking-widest px-3 py-1">
                  64 FOTOS RAW SIN CENSURA
                </span>
              </div>

              {/* Camera EXIF Overlay Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 bg-black/85 backdrop-blur-md border border-zinc-800 px-4 py-2.5">
                <div className="flex items-center gap-4 font-mono text-[11px] text-zinc-300">
                  <span className="flex items-center gap-1.5 text-[#DC2626] font-bold">
                    <Aperture className="w-3.5 h-3.5" /> LEICA SL2-S
                  </span>
                  <span className="hidden sm:inline text-zinc-600">|</span>
                  <span className="hidden sm:inline">35MM SUMMILUX f/1.4</span>
                  <span className="text-zinc-600">|</span>
                  <span>ISO 3200 · 1/500s</span>
                </div>
                <button
                  onClick={() =>
                    setLightboxItem({
                      title: 'BEHEMOTH: LA LITURGIA DEL FUEGO EN WACKEN OPEN AIR',
                      venue: 'WACKEN, ALEMANIA (MAIN STAGE)',
                      date: '03 AGOSTO 2024',
                      photographer: 'M. LINDQVIST',
                      image: ASSETS.concertPyro,
                      exif: 'LEICA SL2-S · 35MM f/1.4 · ISO 3200 · 1/500s',
                    })
                  }
                  className="font-mono text-[10px] uppercase tracking-widest text-white hover:text-[#DC2626] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> PANTALLA COMPLETA
                </button>
              </div>
            </div>

            {/* Right / Editorial Details */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-800 bg-[#0B0B0E]">
              <div>
                <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400 mb-4 pb-3 border-b border-zinc-800/80">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#DC2626]" /> WACKEN, ALEMANIA
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" /> 03 AGO 2024
                  </span>
                </div>

                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white leading-tight mb-4">
                  BEHEMOTH: LA LITURGIA DEL FUEGO EN WACKEN OPEN AIR
                </h2>

                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Ante más de 85,000 almas bajo la tormenta del norte alemán, Nergal y su legión polaca transformaron el escenario principal en una catedral ardiente. Columnas de fuego de 15 metros y una ejecución quirúrgica capturada desde el foso de prensa durante los primeros tres temas.
                </p>

                {/* Mini Thumbnail Strip */}
                <div className="mb-6">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2.5">
                    VISTA PREVIA DEL CARRETE (04 / 64):
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      ASSETS.concertPyro,
                      ASSETS.albumBlackMetal,
                      ASSETS.studioPodcast,
                      ASSETS.albumCatacombs,
                    ].map((thumb, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          setLightboxItem({
                            title: `BEHEMOTH — NEGATIVO #0${idx + 1} (WACKEN 2024)`,
                            venue: 'WACKEN, ALEMANIA',
                            date: '03 AGOSTO 2024',
                            photographer: 'M. LINDQVIST',
                            image: thumb,
                            exif: 'LEICA SL2-S · 35MM f/1.4 · ISO 3200',
                          })
                        }
                        className="aspect-square border border-zinc-800 hover:border-[#DC2626] overflow-hidden relative group/thumb cursor-pointer"
                      >
                        <img
                          src={thumb}
                          alt={`Frame ${idx + 1}`}
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-transparent transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-500 uppercase">FOTÓGRAFO JEFE:</span>
                  <span className="text-white font-bold">M. LINDQVIST (ACREDITADO)</span>
                </div>

                <button
                  onClick={() =>
                    setLightboxItem({
                      title: 'BEHEMOTH: LA LITURGIA DEL FUEGO EN WACKEN OPEN AIR',
                      venue: 'WACKEN, ALEMANIA (MAIN STAGE)',
                      date: '03 AGOSTO 2024',
                      photographer: 'M. LINDQVIST',
                      image: ASSETS.concertPyro,
                      exif: 'LEICA SL2-S · 35MM f/1.4 · ISO 3200 · 1/500s',
                    })
                  }
                  className="w-full bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest py-3.5 px-5 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> EXPLORAR LAS 64 FOTOS EN HD
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INLINE STREAM PLAYER BAR */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-8">
        <LiveStreamPlayerBar
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onOpenRadioSection={() => onSelectSection('radio')}
        />
      </section>

      {/* FILTER BAR & SEARCH */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E0E12] border border-zinc-800 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {GALLERY_FILTERS.map((f) => {
              const active = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider border transition-colors cursor-pointer flex items-center gap-2 ${
                    active
                      ? 'bg-[#DC2626] text-white border-[#DC2626] font-bold'
                      : 'bg-[#070709] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <span>{f.id}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 ${
                      active ? 'bg-black/30 text-white' : 'bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar banda, recinto, ciudad..."
              className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] text-xs font-mono text-white pl-10 pr-4 py-2.5 outline-none transition-colors"
            />
          </div>
        </div>
      </section>

      {/* 6-CARD PHOTO GALLERY GRID */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGalleries.map((item) => (
            <article
              key={item.id}
              className="border border-zinc-800 bg-[#0E0E12] hover:border-zinc-600 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black border-b border-zinc-800">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-transparent to-black/40" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-black/85 border border-zinc-700 text-zinc-200 font-mono text-[10px] uppercase tracking-widest px-2.5 py-1">
                      {item.date}
                    </span>
                    <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 flex items-center gap-1">
                      <Camera className="w-3 h-3" /> {item.photosCount}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 bg-black/80 px-2.5 py-1 border border-zinc-800 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#DC2626]" /> {item.venue}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#DC2626] mb-2">
                    // {item.category}
                  </div>
                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-white group-hover:text-[#DC2626] transition-colors mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 border-t border-zinc-800/80 bg-[#0A0A0D] flex items-center justify-between">
                <div className="font-mono text-[11px] text-zinc-400">
                  FOTOS: <span className="text-white font-bold">{item.photographer}</span>
                </div>
                <button
                  onClick={() =>
                    setLightboxItem({
                      title: item.title,
                      venue: item.venue,
                      date: item.date,
                      photographer: item.photographer,
                      image: item.image,
                      exif: 'NIKON Z9 · 24-70MM f/2.8 S · ISO 4000 · 1/640s',
                    })
                  }
                  className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#DC2626] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  ABRIR GALERÍA <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PIT PHOTOGRAPHY MANIFESTO & PRESS ACCREDITATION */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Technical Gear & Pit Rules */}
          <div className="lg:col-span-7 border border-zinc-800 bg-[#0E0E12] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#DC2626] uppercase tracking-widest mb-3">
                <ShieldCheck className="w-4 h-4" /> PROTOCOLO DE FOSO // REGLA DE LAS 3 CANCIONES
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-tight mb-4">
                SIN FLASH. SIN FILTROS DIGITALES. PURO GRANO ÓPTICO.
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Todos los reportajes gráficos de Time of Metal son capturados por fotógrafos acreditados en formato RAW sin compresión, respetando estrictamente la atmósfera lumínica del escenario. Prohibido el uso de inteligencia artificial generativa o retoque plástico.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-zinc-800">
              <div className="bg-[#070709] border border-zinc-800/80 p-4">
                <div className="font-mono text-[10px] text-zinc-500 uppercase mb-1">
                  ÓPTICA ESTÁNDAR
                </div>
                <div className="font-mono text-xs font-bold text-white">
                  FIJOS LUMINOSOS f/1.2 - f/1.4
                </div>
              </div>
              <div className="bg-[#070709] border border-zinc-800/80 p-4">
                <div className="font-mono text-[10px] text-zinc-500 uppercase mb-1">
                  LICENCIA ARCHIVO
                </div>
                <div className="font-mono text-xs font-bold text-white">
                  EDITORIAL & PRENSA OFICIAL
                </div>
              </div>
              <div className="bg-[#070709] border border-zinc-800/80 p-4">
                <div className="font-mono text-[10px] text-zinc-500 uppercase mb-1">
                  ENTREGA PRENSA
                </div>
                <div className="font-mono text-xs font-bold text-[#DC2626]">
                  &lt; 12 HORAS POST-SHOW
                </div>
              </div>
            </div>
          </div>

          {/* Right: Press Pass / Promoter Contact */}
          <div className="lg:col-span-5 border border-zinc-800 bg-[#0E0E12] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#DC2626]/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-amber-500 uppercase tracking-widest mb-3">
                <Mail className="w-4 h-4" /> ACREDITACIONES DE PRENSA & PROMOTORAS
              </div>
              <h3 className="font-display font-black text-2xl uppercase text-white tracking-tight mb-3">
                ¿ORGANIZAS UN RITUAL O GIRA EXTREMA?
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-5">
                Solicita cobertura fotográfica oficial de nuestro equipo en Europa y Latinoamérica o adquiere licencias de alta resolución para carpetas de prensa y vinilos en directo.
              </p>
            </div>

            <form onSubmit={handlePressRequest} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Promotora / Sello / Banda"
                  className="bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Correo de Prensa Oficial"
                  className="bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ciudad, Fecha y Recinto del Evento"
                  className="flex-1 bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> ENVIAR
                </button>
              </div>
              {pressStatus && (
                <p className="font-mono text-[11px] text-emerald-400 pt-1">{pressStatus}</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-5xl w-full border border-zinc-800 bg-[#0B0B0E] overflow-hidden">
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
                <span className="mx-2 text-zinc-700">|</span> EXIF:{' '}
                <span className="text-zinc-300">{lightboxItem.exif}</span>
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
