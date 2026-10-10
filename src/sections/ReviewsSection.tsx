import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Globe,
  Play,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Skull,
  Star,
  Flame,
  Mail,
  Send,
  ShieldCheck,
} from 'lucide-react';
import {
  ASSETS,
  AudioTrack,
  CRITIC_VAULT_REVIEWS,
  SectionId,
} from '../data/mockData';
import { LiveStreamPlayerBar } from '../components/LiveStreamPlayerBar';

interface ReviewsSectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectSection: (section: SectionId) => void;
  onPlayCustomTrack: (track: Partial<AudioTrack>) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onPlayCustomTrack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGenre, setActiveGenre] = useState('TODOS');
  const [sortOrder, setSortOrder] = useState('MÁS RECIENTES PRIMERO');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [activePage, setActivePage] = useState(1);
  const [promoBand, setPromoBand] = useState('');
  const [promoEmail, setPromoEmail] = useState('');
  const [promoSent, setPromoSent] = useState(false);
  const [selectedReviewModal, setSelectedReviewModal] = useState<string | null>(null);

  const genres = [
    'TODOS',
    'DEATH METAL',
    'BLACK METAL',
    'THRASH METAL',
    'DOOM / SLUDGE',
    'GRINDCORE',
    'HEAVY / SPEED',
    'DEMOS & SPLITS',
  ];

  const filteredReviews = CRITIC_VAULT_REVIEWS.filter((rev) => {
    const matchesGenre = activeGenre === 'TODOS' || rev.genreKey === activeGenre;
    const matchesSearch =
      !searchTerm ||
      rev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.band.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.label.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const top5Listened = [
    { rank: '01', band: 'Mortuary Veil', album: 'Catacombs of Eternal Agony (2025)', score: '9.8', cover: ASSETS.albumCatacombs },
    { rank: '02', band: 'Dissection of Soul', album: 'Hymns from the Ossuary (2025)', score: '9.4', cover: ASSETS.albumBlackMetal },
    { rank: '03', band: 'Iron Vengeance', album: 'Nuclear Iron Storm (2025)', score: '9.1', cover: ASSETS.concertPyro },
    { rank: '04', band: 'Sepulchral Torment', album: 'Morbid Transcendence (2025)', score: '9.3', cover: ASSETS.albumCatacombs },
    { rank: '05', band: 'Nocturnal Rites of Chaos', album: 'Blood Moon Invocation (2024)', score: '8.9', cover: ASSETS.albumBlackMetal },
  ];

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoBand.trim() || !promoEmail.trim()) return;
    setPromoSent(true);
    setPromoBand('');
    setPromoEmail('');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 pt-6 pb-20 space-y-12">
      {/* Top Breadcrumb + Dictated Counter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#18181b] pb-4 font-mono text-[10px] uppercase tracking-wider">
        <div className="flex items-center gap-2 text-[#71717a]">
          <span>TIME OF METAL</span>
          <span>/</span>
          <span className="text-[#f4f4f5] font-semibold">RECOMENDACION DE DISCOS &amp; DEMOS</span>
        </div>
      </div>

      {/* HERO HEADER + METRICS BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-8 space-y-4">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight uppercase leading-none">
            <span className="text-white">JUICIO </span>
            <span className="text-[#dc2626]">CRÍTICO</span>
          </h1>
          <p className="text-sm sm:text-base text-[#a1a1aa] max-w-xl leading-relaxed">
            Desmenuzamos la arquitectura sonora y contundencia técnica de la música extrema y el underground internacional.
          </p>
        </div>

        {/* Right Stats Box */}
        {/* <div className="lg:col-span-4 bg-[#121214] border border-[#27272a] rounded-sm p-5 grid grid-cols-3 divide-x divide-[#27272a] text-center">
          <div className="px-2">
            <span className="font-mono text-[9px] text-[#71717a] uppercase block">PROMEDIO MES</span>
            <span className="font-display font-extrabold text-2xl text-white mt-1 block">8.6</span>
          </div>
          <div className="px-2">
            <span className="font-mono text-[9px] text-[#71717a] uppercase block">PERFECCIÓN (10/10)</span>
            <span className="font-display font-extrabold text-2xl text-[#dc2626] mt-1 block">03</span>
          </div>
          <div className="px-2">
            <span className="font-mono text-[9px] text-[#71717a] uppercase block">NEFASTOS (&lt;4.0)</span>
            <span className="font-display font-extrabold text-2xl text-white mt-1 block">12</span>
          </div>
        </div> */}
      </div>

      {/* SEARCH & GENRE FILTER BAR */}
      <div className="bg-[#121214] border border-[#27272a] rounded-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#71717a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por banda, título de disco, disquera o productor..."
              className="w-full bg-[#09090b] border border-[#27272a] focus:border-[#dc2626] rounded-sm pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-[#71717a] outline-none"
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-sm px-3 py-2 text-xs font-mono text-[#e4e4e7] outline-none"
            >
              <option value="MÁS RECIENTES PRIMERO">ORDENAR: MÁS RECIENTES PRIMERO</option>
              <option value="CALIFICACIÓN MÁS ALTA">ORDENAR: CALIFICACIÓN MÁS ALTA</option>
              <option value="ORDEN ALFABÉTICO">ORDENAR: ORDEN ALFABÉTICO</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              onClick={() => setSelectedYear(selectedYear === '2025' ? '2024' : '2025')}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-sm px-3 py-2 text-xs font-mono text-[#e4e4e7] flex items-center justify-between cursor-pointer"
            >
              <span>AÑO: {selectedYear}</span>
              <Calendar className="w-3.5 h-3.5 text-[#71717a]" />
            </button>
          </div>
          <div className="md:col-span-2">
            <div className="w-full bg-[#09090b] border border-[#27272a] rounded-sm px-3 py-2 text-xs font-mono text-[#e4e4e7] flex items-center justify-between">
              <span>PAÍS: TODOS</span>
              <Globe className="w-3.5 h-3.5 text-[#71717a]" />
            </div>
          </div>
        </div>

        {/* Genre Buttons Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
          <span className="text-[#71717a] uppercase mr-1">FILTRO GÉNERO:</span>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`px-2.5 py-1 rounded-sm uppercase transition-colors cursor-pointer ${activeGenre === g
                ? 'bg-[#dc2626] text-white font-bold'
                : 'bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white'
                }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* DISCO DEL MES // HIGHLIGHT EDITORIAL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
          <span className="flex items-center gap-2 text-white font-bold">
            <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
            DISCO DEL MES
          </span>
          <span className="text-[#a1a1aa] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#dc2626]" />
            CALIFICACIÓN MÁXIMA CERTIFICADA
          </span>
        </div>

        <div className="bg-gradient-to-br from-[#18181b] via-[#121214] to-[#1a0a0c] border border-[#3f3f46] rounded-sm p-6 lg:p-8 relative space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Album Cover */}
            <div className="lg:col-span-5">
              <div className="relative aspect-square rounded-sm overflow-hidden border border-[#3f3f46] shadow-2xl">
                <img
                  src={ASSETS.albumCatacombs}
                  alt="Catacombs of Eternal Agony"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-[#09090b]/95 border border-[#dc2626] px-3.5 py-2 rounded-sm flex items-center gap-2">
                  <div>
                    <span className="font-mono text-[9px] text-[#a1a1aa] uppercase block">VEREDICTO</span>
                    <span className="font-display font-extrabold text-2xl text-[#dc2626] leading-none">9.8</span>
                  </div>
                  <div className="font-mono text-[9px] text-[#e4e4e7] border-l border-[#27272a] pl-2 leading-tight">
                    / 10<br />OBRA MAESTRA
                  </div>
                </div>
              </div>
            </div>

            {/* Right Review Details */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase text-[#a1a1aa]">
                <span className="px-2 py-0.5 bg-[#dc2626]/20 border border-[#991b1b] text-[#ef4444] font-semibold rounded-sm">
                  DEATH METAL CAVERNOSO
                </span>
                <span>• 🇸🇪 SUECIA • 2025 • DARK DESCENT RECORDS • 44:12 MIN</span>
              </div>

              <div>
                <span className="font-mono text-xs text-[#a1a1aa] uppercase tracking-[0.15em] block">
                  MORTUARY VEIL
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white uppercase leading-[0.98] mt-1">
                  CATACOMBS OF ETERNAL AGONY
                </h2>
              </div>

              <blockquote className="bg-[#09090b]/80 border border-[#27272a] p-4 rounded-sm font-display italic text-sm sm:text-base text-[#e4e4e7]">
                &ldquo;Un monumento implacable a la putrefacción sónica que redefine el death metal contemporáneo sin sacrificar la asfixia analógica de los 90.&rdquo;
              </blockquote>

              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                Grabado en cinta de dos pulgadas y mezclado en los legendarios Sunlight Studios, este opus despliega riffs cromáticos pantanosos, dobles bombos cavernosos y un gutural cavernoso que trasciende la mera técnica para convertirse en una liturgia funesta. Cada transición entre el doom claustrofóbico y ráfagas a 240 BPM está milimétricamente cincelada con odio puro.
              </p>

            </div>
          </div>

        </div>
      </div>

      {selectedReviewModal && (
        <div className="bg-[#18181b] border border-[#dc2626] rounded-sm p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-[#ef4444] uppercase">ARCHIVO EDITORIAL ACTIVO</span>
            <h4 className="font-display font-bold text-lg text-white">{selectedReviewModal}</h4>
            <p className="text-xs text-[#a1a1aa]">
              Ingeniero de mezcla: Tomas Skogsberg • Cinta Ampex 456 2&quot; • Prensado en vinilo 180g por Dark Descent Records.
            </p>
          </div>
          <button
            onClick={() => setSelectedReviewModal(null)}
            className="px-3 py-1.5 bg-[#dc2626] text-white font-mono text-xs uppercase rounded-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* ÚLTIMOS LANZAMIENTOS EVALUADOS (6 CARDS) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase mt-1">
              ÚLTIMOS LANZAMIENTOS EVALUADOS
            </h2>
          </div>
          <span className="font-mono text-[11px] text-[#71717a] uppercase">
            MOSTRANDO: <strong className="text-white">1 - {filteredReviews.length}</strong> DE 248 RESEÑAS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <article
              key={rev.id}
              className="bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] rounded-sm overflow-hidden flex flex-col justify-between group transition-all"
            >
              <div>
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
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#dc2626] text-white font-mono text-xs font-bold rounded-sm">
                    {rev.score} <span className="text-[9px] opacity-80">/10</span>
                  </span>
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between font-mono text-[10px]">
                    <span className="px-2 py-0.5 bg-[#09090b]/90 border border-[#27272a] text-[#e4e4e7] rounded-sm">
                      {rev.genre}
                    </span>
                    <span className="text-[#a1a1aa] uppercase">{rev.label}</span>
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#71717a] uppercase">
                    <span>{rev.band}</span>
                    <span>{rev.duration}</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-white uppercase leading-tight group-hover:text-[#ef4444] transition-colors">
                    {rev.title}
                  </h3>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-3">
                    {rev.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4 pt-3 border-t border-[#18181b] flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#18181b] border border-[#3f3f46] flex items-center justify-center text-[10px] text-white font-bold">
                    {rev.authorInitials}
                  </span>
                  <span className="text-[#71717a]">Por: <strong className="text-[#a1a1aa]">{rev.author}</strong></span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination Strip */}
        <div className="pt-4 border-t border-[#18181b] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <span className="text-[#71717a] text-[11px]">
            PÁGINA <strong className="text-white">{activePage}</strong> DE <strong className="text-white">48</strong> (1,482 ÁLBUMES DOCUMENTADOS)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActivePage(Math.max(1, activePage - 1))}
              className="w-8 h-8 bg-[#121214] border border-[#27272a] rounded-sm flex items-center justify-center text-[#a1a1aa] hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4].map((p) => (
              <button
                key={p}
                onClick={() => setActivePage(p)}
                className={`w-8 h-8 rounded-sm font-mono text-xs cursor-pointer ${activePage === p
                  ? 'bg-[#dc2626] text-white font-bold'
                  : 'bg-[#121214] border border-[#27272a] text-[#a1a1aa] hover:text-white'
                  }`}
              >
                {p}
              </button>
            ))}
            <span className="px-2 text-[#71717a]">...</span>
            <button
              onClick={() => setActivePage(48)}
              className="w-8 h-8 bg-[#121214] border border-[#27272a] rounded-sm text-[#a1a1aa] hover:text-white cursor-pointer"
            >
              48
            </button>
            <button
              onClick={() => setActivePage(Math.min(48, activePage + 1))}
              className="w-8 h-8 bg-[#121214] border border-[#27272a] rounded-sm flex items-center justify-center text-[#a1a1aa] hover:text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
