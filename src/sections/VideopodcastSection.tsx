import React, { useState } from 'react';
import {
  Play,
  Pause,
  Clock,
  Calendar,
  Search,
  Volume2,
} from 'lucide-react';
import {
  ASSETS,
  AudioTrack,
  PODCAST_EPISODES,
  SectionId,
} from '../data/mockData';
import HeadVideo from '../components/Cabeceras/HeadVideo';
import PremierEpisode from '../components/organism/PremierEpisode';

interface VideopodcastSectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectSection: (section: SectionId) => void;
}

const PODCAST_CATEGORIES = [
  'TODOS LOS EPISODIOS',
  'ENTREVISTAS LEGENDARIAS',
  'PRODUCCIÓN & ESTUDIOS',
  'DEBATES & HISTORIA',
  'EN VIVO DESDE FESTIVALES',
];

export const VideopodcastSection: React.FC<VideopodcastSectionProps> = ({
  onTogglePlay,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('TODOS LOS EPISODIOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeEpisodeTitle, setActiveEpisodeTitle] = useState(
    'EP. #48: ARQUITECTURA DE LA DISONANCIA Y EL SONIDO DEL ABISMO'
  );
  const [activeEpisodeGuest, setActiveEpisodeGuest] = useState(
    'INVITADO ESPECIAL: LUC LEMAY (GORGUTS) & ERIK RUTAN (CANNIBAL CORPSE / MANA RECORDING)'
  );

  const filteredEpisodes = PODCAST_EPISODES.filter((ep) => {
    const matchesCat =
      selectedCategory === 'TODOS LOS EPISODIOS' || ep.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.feat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleLoadEpisode = (ep: (typeof PODCAST_EPISODES)[0]) => {
    setActiveEpisodeTitle(`${ep.epNumber}: ${ep.title}`);
    setActiveEpisodeGuest(ep.feat);
    setIsVideoPlaying(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6]">
      {/* SECTION HEADER */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-8 pb-6">
        <HeadVideo onTogglePlay={onTogglePlay} />
      </section>

      {/* FEATURED PREMIERE EPISODE #48 */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-8">
        <PremierEpisode onTogglePlay={onTogglePlay} />
      </section>

      {/* CATEGORY TABS & SEARCH */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0E0E12] border border-zinc-800 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {PODCAST_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider border transition-colors cursor-pointer ${active
                    ? 'bg-[#DC2626] text-white border-[#DC2626] font-bold'
                    : 'bg-[#070709] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar invitado, banda o tema..."
              className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] text-xs font-mono text-white pl-10 pr-4 py-2.5 outline-none"
            />
          </div>
        </div>
      </section>

      {/* 6-CARD EPISODE ARCHIVE GRID */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEpisodes.map((ep) => (
            <article
              key={ep.id}
              className="border border-zinc-800 bg-[#0E0E12] hover:border-zinc-600 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black overflow-hidden border-b border-zinc-800">
                  <img
                    src={ep.image}
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-transparent to-black/50" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                      {ep.epNumber} // {ep.badge}
                    </span>
                    <span className="bg-black/85 border border-zinc-700 text-zinc-200 font-mono text-[10px] uppercase px-2.5 py-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#DC2626]" /> {ep.duration}
                    </span>
                  </div>

                  {/* Play Button Overlay */}
                  <button
                    onClick={() => handleLoadEpisode(ep)}
                    className="absolute bottom-3 right-3 w-11 h-11 bg-[#DC2626] hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 cursor-pointer"
                    aria-label={`Reproducir ${ep.title}`}
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>

                  <div className="absolute bottom-3 left-3 font-mono text-[10px] text-zinc-300 bg-black/80 px-2.5 py-1 border border-zinc-800 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-zinc-400" /> {ep.date}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="font-mono text-[11px] font-bold text-[#DC2626] uppercase tracking-wider mb-1.5">
                    {ep.feat}
                  </div>
                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-white group-hover:text-[#DC2626] transition-colors mb-3 leading-snug">
                    {ep.title}
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                    {ep.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {ep.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[9px] uppercase tracking-widest bg-[#070709] border border-zinc-800 text-zinc-400 px-2 py-1"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 border-t border-zinc-800/80 bg-[#0A0A0D] flex items-center justify-between">
                <button
                  onClick={() => handleLoadEpisode(ep)}
                  className="font-mono text-[11px] font-bold uppercase tracking-wider text-white hover:text-[#DC2626] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-[#DC2626]" /> VER EN 4K
                </button>
                <button
                  onClick={onTogglePlay}
                  className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> ESCUCHAR AUDIO
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
