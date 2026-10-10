import React, { useState } from 'react';
import {
  Play,
  Pause,
  Radio,
  Disc,
  ArrowRight,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  ListMusic,
  Clock,
  Camera,
  MapPin,
} from 'lucide-react';
import {
  ASSETS,
  AudioTrack,
  BREAKING_NEWS,
  HOME_REVIEWS,
  UPCOMING_TOURS,
  SectionId,
} from '../data/mockData';
import { LiveStreamPlayerBar } from '../components/LiveStreamPlayerBar';

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
  const [reviewFilter, setReviewFilter] = useState<'TODOS' | 'DEATH' | 'BLACK' | 'THRASH'>('TODOS');
  const [podcastPlaying, setPodcastPlaying] = useState(false);
  const [ticketModal, setTicketModal] = useState<string | null>(null);

  const filteredReviews =
    reviewFilter === 'TODOS'
      ? HOME_REVIEWS
      : HOME_REVIEWS.filter((r) => r.category === reviewFilter);

  const spectrumBars = [45, 72, 60, 88, 95, 70, 55, 82, 92, 64, 78, 85, 50, 90, 68, 42];

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-10 pb-12 border-b border-[#27272a] overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="font-display font-extrabold text-xl sm:text-4xl lg:text-[48px] leading-[0.96] tracking-tight uppercase">
                <span className="text-white block">EL BASTIÓN</span>
                <span className="text-white block">DEL </span>
                <span className="text-[#dc2626]">METAL EXTREMO</span>{' '}
                <span className="text-white">&amp; UNDERGROUND</span>
              </h1>

              <p className="text-[#a1a1aa] text-sm sm:text-base max-w-2xl leading-relaxed">
                Crítica sonora visceral, periodismo sin censura del moshpit, transmisiones de alta fidelidad sin comerciales y archivo fidedigno de los rituales más devastadores del orbe.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    onTogglePlay();
                  }}
                  className="flex items-center gap-2.5 px-5 py-3 bg-[#dc2626] hover:bg-[#ef4444] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-sm crimson-glow transition-all cursor-pointer"
                >
                  <Radio className="w-4 h-4" />
                  <span>{isPlaying ? 'PAUSAR RADIO [192 KBPS]' : 'SINTONIZAR RADIO [192 KBPS]'}</span>
                </button>

                <button
                  onClick={() => onSelectSection('resenas')}
                  className="flex items-center gap-2 px-5 py-3 bg-[#121214] hover:bg-[#18181b] text-[#f4f4f5] border border-[#3f3f46] hover:border-[#71717a] font-mono text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                >
                  <Disc className="w-4 h-4 text-[#a1a1aa]" />
                  <span>EXPLORAR LANZAMIENTOS</span>
                </button>
              </div>

              {/* Telemetry Micro Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-6 font-mono text-[11px] text-[#71717a]">
                <span className="flex items-center gap-1.5">
                  <span className="text-[#ef4444]">((•))</span>
                  <strong className="text-[#e4e4e7]">666</strong> Oyentes Activos
                </span>
                <span>• Latencia: <strong className="text-[#e4e4e7]">666ms</strong></span>
                <span>• Codec: <strong className="text-[#e4e4e7]">Direct Stream FLAC/Opus</strong></span>
              </div>
            </div>

            {/* Right Column: Cabina Central en Directo Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-[#121214] border border-[#27272a] rounded-sm p-5 space-y-5 shadow-2xl relative">
                {/* Top Header */}
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3 font-mono text-[10px] uppercase tracking-wider">
                  <span className="flex items-center gap-2 text-[#f4f4f5] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
                    RADIO EN DIRECTO
                  </span>
                </div>

                {/* Host & Show Info */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-sm overflow-hidden border border-[#3f3f46] shrink-0">
                    <img
                      src={ASSETS.djRavn}
                      alt="DJ Ravn"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-[#dc2626] text-white font-mono text-[9px] font-bold text-center py-0.5">
                      DJ ERIK
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-[#ef4444] uppercase tracking-wider block">
                      PROGRAMA ESTELAR
                    </span>
                    <h3 className="font-display font-bold text-lg text-white leading-tight">
                      La Hora de las Bestias
                    </h3>
                    <p className="text-xs text-[#a1a1aa] leading-snug">
                      Especial monográfico: Raíces del Black Metal nórdico 1991-1995 y primicias exclusivas en cinta demo.
                    </p>
                  </div>
                </div>

                {/* Frequency Monitor Box */}
                <div className="bg-[#09090b] border border-[#27272a] rounded-sm p-3.5 space-y-3">
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#a1a1aa]">
                    <span>((•)) MONITOREO DE FRECUENCIA</span>
                    <span className="text-[#f4f4f5] font-bold">96.4 dB / PEAK</span>
                  </div>
                  <div className="h-10 flex items-end gap-1.5 pt-2">
                    {spectrumBars.map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-[#991b1b] to-[#ef4444] rounded-t-[1px] transition-all duration-300"
                        style={{
                          height: isPlaying ? `${val}%` : `${Math.max(20, val * 0.4)}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÚLTIMA HORA DEL METAL + DOUBLE AUDIO DOCK OVERLAY */}
      <section id="noticias-section" className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
              RESEÑAS DE DISCOS DESTACADAS
            </h2>
          </div>
          <button
            onClick={() => onSelectSection('cms')}
            className="font-mono text-xs text-[#a1a1aa] hover:text-white flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
          >
            <span>ARCHIVO PERIODÍSTICO COMPLETO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* RESEÑAS DE DISCOS DESTACADAS */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div></div>
          {/* Filter Buttons */}
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-[#71717a] uppercase mr-1">FILTRAR:</span>
            {(['TODOS', 'DEATH', 'BLACK', 'THRASH'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setReviewFilter(cat)}
                className={`px-2.5 py-1 rounded-sm uppercase transition-colors cursor-pointer ${reviewFilter === cat
                  ? 'bg-[#dc2626] text-white font-bold'
                  : 'bg-[#121214] border border-[#27272a] text-[#a1a1aa] hover:text-white'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] rounded-sm overflow-hidden flex flex-col justify-between group transition-all"
            >
              <div>
                {/* Square Album Art with Badges */}
                <div className="relative aspect-square bg-[#18181b] overflow-hidden">
                  <img
                    src={rev.cover}
                    alt={rev.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-black/30" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#09090b]/90 border border-[#27272a] font-mono text-[10px] text-[#e4e4e7] rounded-sm">
                    {rev.flag} {rev.country} • {rev.year}
                  </span>
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#dc2626] text-white font-mono text-xs font-bold rounded-sm shadow-lg">
                    ★ {rev.score}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase">
                    <span className="text-[#ef4444] font-semibold">{rev.genre}</span>
                    <span className="text-[#71717a]">{rev.label}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white leading-tight">
                      {rev.title}
                    </h3>
                    <p className="font-mono text-xs text-[#a1a1aa] uppercase mt-0.5">
                      {rev.band}
                    </p>
                  </div>
                  <p className="text-xs text-[#a1a1aa] italic leading-relaxed">
                    {rev.quote}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-5 pb-5 pt-3 border-t border-[#18181b] flex items-center justify-between font-mono text-[11px]">
                <button
                  onClick={() => onSelectSection('resenas')}
                  className="text-[#a1a1aa] hover:text-white uppercase tracking-wider cursor-pointer"
                >
                  LEER RESEÑA
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VIDEOPODCAST OFICIAL FEATURE MODULE */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="bg-[#121214] border border-[#27272a] rounded-sm p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Video Frame (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-video bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden group">
              <img
                src={ASSETS.studioPodcast}
                alt="Videopodcast Oficial"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button
                  onClick={() => setPodcastPlaying(!podcastPlaying)}
                  className="w-16 h-16 rounded-sm bg-[#dc2626] hover:bg-[#ef4444] text-white flex items-center justify-center crimson-glow transition-transform hover:scale-105 cursor-pointer"
                >
                  {podcastPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </button>
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[10px]">
                <span className="px-2 py-0.5 bg-[#dc2626] text-white font-bold uppercase rounded-sm">
                  EPISODIO 42
                </span>
                <span className="px-2 py-0.5 bg-[#09090b]/80 border border-[#3f3f46] text-[#e4e4e7] rounded-sm">
                  4K ULTRA HD
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-[#71717a]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Duración: 1h 14m 20s
              </span>
              <span>Capítulo 3 / 6: &quot;El culto a la producción analógica&quot;</span>
            </div>
          </div>

          {/* Right Info (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="font-mono text-[10px] text-[#ef4444] uppercase tracking-widest flex items-center gap-2">
              <span>▶ VIDEOPODCAST OFICIAL</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase leading-tight">
              EL RESURGIMIENTO DEL DEATH METAL OLD SCHOOL: ¿NOSTALGIA O AUTENTICIDAD?
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
              Nos adentramos con productores e historiadores en el fenómeno de las nuevas bandas que desechan los triggers digitales para abrazar el polvo de cinta y los riffs podridos de 1989.
            </p>

            {/* Key topics box */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-sm p-4 space-y-2.5">
              <span className="font-mono text-[10px] font-bold text-[#ef4444] uppercase tracking-wider block">
                TEMAS CLAVE DEL EPISODIO:
              </span>
              <ul className="space-y-1.5 text-xs text-[#e4e4e7]">
                <li className="flex items-start gap-2">
                  <span className="text-[#dc2626] mt-0.5">•</span>
                  <span>El impacto del pedal Boss HM-2 en la juventud europea actual.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#dc2626] mt-0.5">•</span>
                  <span>Democratización del cassette: ¿Por qué las cintas superan al vinilo en ventas clandestinas?</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#dc2626] mt-0.5">•</span>
                  <span>Debate: La sobreproducción moderna frente a la crudeza de Morrisound Recording.</span>
                </li>
              </ul>
            </div>

            {/* Guests */}
            <div className="pt-1 flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className="text-[#71717a] uppercase">INVITADOS:</span>
              <span className="px-2.5 py-1 bg-[#18181b] border border-[#27272a] text-[#e4e4e7] rounded-sm">
                Dan Swanö (Audio Master)
              </span>
              <span className="px-2.5 py-1 bg-[#18181b] border border-[#27272a] text-[#e4e4e7] rounded-sm">
                Luc Lemay (Gorguts)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* GALERÍA DE CONCIERTOS RECIENTES */}
      <section className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#ef4444]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
              <span>DESDE EL FOSO DEL MOSHPIT</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
              GALERÍA DE CONCIERTOS
            </h2>
          </div>
          <button
            onClick={() => onSelectSection('galeria')}
            className="font-mono text-xs text-[#a1a1aa] hover:text-white flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
          >
            <span>VER TODAS LAS COBERTURAS</span>
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              festival: 'BRUTAL ASSAULT FESTIVAL',
              date: '14 OCT 2024',
              title: 'Gorgoroth en Llamas en el Escenario Principal',
              credit: 'Fotografía por Javier R. • Foso Exclusivo',
              img: ASSETS.concertPyro,
            },
            {
              festival: 'CIRCO VOLADOR (CDMX)',
              date: '02 NOV 2024',
              title: 'Rotting Christ: El Moshpit Ritual del Inframundo',
              credit: 'Fotografía por Elena S. • Cobertura LATAM',
              img: ASSETS.studioPodcast,
            },
            {
              festival: 'WACKEN OPEN AIR',
              date: '08 AGO 2024',
              title: 'La Quema Sagrada: Clausura de los Escenarios Faster & Harder',
              credit: 'Fotografía por M. Lindqvist • Prensa Internacional',
              img: ASSETS.concertPyro,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectSection('galeria')}
              className="bg-[#121214] border border-[#27272a] hover:border-[#dc2626] rounded-sm overflow-hidden group cursor-pointer transition-colors"
            >
              <div className="h-52 overflow-hidden bg-[#18181b]">
                <img
                  src={item.img}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase">
                  <span className="text-[#ef4444] font-semibold">{item.festival}</span>
                  <span className="text-[#71717a]">{item.date}</span>
                </div>
                <h3 className="font-display font-bold text-base text-white group-hover:text-[#ef4444] transition-colors">
                  {item.title}
                </h3>
                <p className="font-mono text-[11px] text-[#71717a]">{item.credit}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRÓXIMOS EVENTOS & GIRAS */}
      <section id="eventos-section" className="max-w-[1280px] mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
              PRÓXIMOS EVENTOS &amp; GIRAS
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {UPCOMING_TOURS.map((tour) => (
            <div
              key={tour.id}
              className="bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#18181b] border border-[#27272a] rounded-sm flex flex-col items-center justify-center font-mono shrink-0">
                  <span className="text-[9px] text-[#ef4444] uppercase font-bold">
                    {tour.month}
                  </span>
                  <span className="text-lg font-extrabold text-white leading-none my-0.5">
                    {tour.day}
                  </span>
                  <span className="text-[9px] text-[#71717a]">{tour.year}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-display font-bold text-base sm:text-lg text-white">
                      {tour.title}
                    </h3>
                    <span className="px-2 py-0.5 bg-[#18181b] border border-[#3f3f46] font-mono text-[10px] text-[#ef4444] rounded-sm">
                      {tour.badge}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#a1a1aa] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#71717a]" />
                    <span>
                      {tour.venue} • {tour.doors}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span
                  className={`font-mono text-[10px] px-2.5 py-1 rounded-sm border uppercase ${tour.statusUrgent
                    ? 'bg-[#dc2626]/15 border-[#991b1b] text-[#ef4444]'
                    : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa]'
                    }`}
                >
                  {tour.status}
                </span>
                {/* <button
                  onClick={() => setTicketModal(tour.title)}
                  className="px-4 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white font-mono text-[11px] font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                >
                  COMPRAR TICKETS
                </button> */}
              </div>
            </div>
          ))}
        </div>

        {/* {ticketModal && (
          <div className="bg-[#18181b] border border-[#dc2626] rounded-sm p-4 flex items-center justify-between font-mono text-xs text-white">
            <span>
              Reserva de acceso directo iniciada para: <strong>{ticketModal}</strong> (Sin cargos corporativos ocultos).
            </span>
            <button
              onClick={() => setTicketModal(null)}
              className="px-3 py-1 bg-[#dc2626] text-white rounded-sm uppercase text-[10px] cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )} */}
      </section>
    </div>
  );
};
