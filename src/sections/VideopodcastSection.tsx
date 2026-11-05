import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Play, Search, Volume2 } from 'lucide-react';
import { AudioTrack, SectionId } from '../data/mockData';
import { INITIAL_RESOLVED_HOME_VIDEOS } from '../data/HomeVideo';
import type { HomeVideosResponse } from '../data/HomeVideo';
import type { YouTubeVideo } from '../data/YouTube';
import HeadVideo from '../components/Videopodcast/HeadVideo';
import PremierEpisode from '../components/Videopodcast/PremierEpisode';
import { readJsonResponseOrFallback } from '../data/readJsonResponse';

interface VideopodcastSectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectSection: (section: SectionId) => void;
}

export const VideopodcastSection: React.FC<VideopodcastSectionProps> = ({
  onTogglePlay,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videosFromCms, setVideosFromCms] = useState(INITIAL_RESOLVED_HOME_VIDEOS);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadVideos = async () => {
      try {
        const response = await fetch('/api/home/videos', { signal: controller.signal });
        const result = await readJsonResponseOrFallback<HomeVideosResponse>(
          response,
          'No se pudieron cargar los videos publicados.',
          { items: INITIAL_RESOLVED_HOME_VIDEOS },
        );
        setVideosFromCms(result.items);
        setVideoError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setVideoError(error instanceof Error ? error.message : 'No se pudieron cargar los videos publicados.');
      }
    };

    void loadVideos();
    return () => controller.abort();
  }, []);

  const videos = useMemo(() => videosFromCms
    .map((video): YouTubeVideo => ({
      id: video.videoId,
      title: video.title,
      description: video.description,
      publishedAt: video.publish,
      thumbnailUrl: video.thumbnailUrl,
    }))
    .sort((first, second) =>
      new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime()
    ), [videosFromCms]);
  const [latestVideo, ...otherVideos] = videos;
  const filteredVideos = otherVideos.filter((video) => {
    const query = searchQuery.trim().toLowerCase();
    return !query ||
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-[#000] text-[#F4F4F6]">
      {/* SECTION HEADER */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
        <HeadVideo onTogglePlay={onTogglePlay} />
      </section>

      {/* VIDEO MÁS RECIENTE */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {videoError && (
          <p role="alert" className="mb-4 border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {videoError} Se muestran los videos guardados localmente.
          </p>
        )}
        {latestVideo ? (
          <PremierEpisode onTogglePlay={onTogglePlay} video={latestVideo} />
        ) : (
          <p className="border border-zinc-800 bg-[#0E0E12] p-6 text-sm text-zinc-400">
            No hay videos publicados todavía.
          </p>
        )}
      </section>

      {/* SEARCH */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E0E12] border border-zinc-800 p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
            VIDEOS DEL VIDEOPODCAST
          </p>
          <div className="relative w-full sm:w-80 lg:w-96">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar videos..."
              className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] text-xs font-mono text-white pl-10 pr-4 py-2.5 outline-none"
            />
          </div>
        </div>
      </section>

      {/* VIDEOS ANTERIORES */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <article
              key={video.id}
              className="border border-zinc-800 bg-[#0E0E12] hover:border-zinc-600 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black overflow-hidden border-b border-zinc-800">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-transparent to-black/50" />

                  <div className="absolute bottom-3 left-3 font-mono text-[10px] text-zinc-300 bg-black/80 px-2.5 py-1 border border-zinc-800 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    {new Date(video.publishedAt).toLocaleDateString('es-MX')}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6">
                  <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-white group-hover:text-[#DC2626] transition-colors mb-3 leading-snug">
                    {video.title}
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-4">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 sm:px-6 py-4 border-t border-zinc-800/80 bg-[#0A0A0D] flex flex-wrap items-center justify-between gap-2">
                <a
                  href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] font-bold uppercase tracking-wider text-white hover:text-[#DC2626] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-[#DC2626]" /> VER EN YOUTUBE
                </a>
                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> ESCUCHAR AUDIO
                </button>
              </div>
            </article>
          ))}
          {filteredVideos.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-zinc-400">
              {otherVideos.length > 0 ? 'No hay videos que coincidan con la búsqueda.' : 'Aún no hay otros videos para mostrar.'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
