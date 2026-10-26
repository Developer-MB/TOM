import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Calendar, Play, Search, Volume2 } from 'lucide-react';
import { AudioTrack, SectionId } from '../data/mockData';
import type { YouTubeVideo, YouTubeVideosResponse } from '../data/YouTube';
import HeadVideo from '../components/Videopodcast/HeadVideo';
import PremierEpisode from '../components/Videopodcast/PremierEpisode';

interface VideopodcastSectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSelectSection: (section: SectionId) => void;
}

export const VideopodcastSection: React.FC<VideopodcastSectionProps> = ({
  onTogglePlay,
}) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string>();
  const [loadMoreError, setLoadMoreError] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');

  const loadVideos = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setLoadError(undefined);

    try {
      const response = await fetch('/api/youtube/videos', { signal });
      const data = await response.json() as YouTubeVideosResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudieron cargar los videos del canal.');
      }
      setVideos(data.items);
      setNextPageToken(data.nextPageToken);
    } catch (error) {
      if (signal?.aborted) return;
      console.error('Error al cargar los videos del canal de YouTube:', error);
      setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los videos.');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadVideos(controller.signal);
    return () => controller.abort();
  }, [loadVideos]);

  const loadMoreVideos = async () => {
    if (!nextPageToken || isLoadingMore) return;

    setIsLoadingMore(true);
    setLoadMoreError(undefined);
    try {
      const params = new URLSearchParams({ pageToken: nextPageToken });
      const response = await fetch(`/api/youtube/videos?${params.toString()}`);
      const data = await response.json() as YouTubeVideosResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudieron cargar más videos.');
      }

      setVideos((currentVideos) => {
        const existingIds = new Set(currentVideos.map((video) => video.id));
        return [...currentVideos, ...data.items.filter((video) => !existingIds.has(video.id))];
      });
      setNextPageToken(data.nextPageToken);
    } catch (error) {
      console.error('Error al cargar más videos de YouTube:', error);
      setLoadMoreError(error instanceof Error ? error.message : 'No se pudieron cargar más videos.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const latestVideo = videos[0];
  const filteredVideos = videos.slice(1).filter((video) => {
    const query = searchQuery.trim().toLowerCase();
    return !query ||
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-[#000] text-[#F4F4F6]">
      {/* SECTION HEADER */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-6">
        <HeadVideo onTogglePlay={onTogglePlay} />
      </section>

      {/* FEATURED PREMIERE EPISODE #48 */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-8">
        {latestVideo && <PremierEpisode onTogglePlay={onTogglePlay} video={latestVideo} />}
        {isLoading && (
          <p className="border border-zinc-800 bg-[#0E0E12] p-6 text-sm text-zinc-400">
            Cargando el video más reciente del canal...
          </p>
        )}
        {loadError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-4 border border-red-900 bg-[#0E0E12] p-6">
            <p className="text-sm text-red-300">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadVideos()}
              disabled={isLoading}
              className="border border-zinc-700 px-4 py-2 font-mono text-xs uppercase text-white hover:border-[#DC2626] disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? 'CARGANDO...' : 'REINTENTAR'}
            </button>
          </div>
        )}
      </section>

      {/* SEARCH */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0E0E12] border border-zinc-800 p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
            VIDEOS DEL CANAL DE YOUTUBE
          </p>
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar videos del canal..."
              className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] text-xs font-mono text-white pl-10 pr-4 py-2.5 outline-none"
            />
          </div>
        </div>
      </section>

      {/* VIDEO ARCHIVE */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                      TIME OF METAL
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 font-mono text-[10px] text-zinc-300 bg-black/80 px-2.5 py-1 border border-zinc-800 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    {new Date(video.publishedAt).toLocaleDateString('es-MX')}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-white group-hover:text-[#DC2626] transition-colors mb-3 leading-snug">
                    {video.title}
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-4">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 border-t border-zinc-800/80 bg-[#0A0A0D] flex items-center justify-between">
                <a
                  href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] font-bold uppercase tracking-wider text-white hover:text-[#DC2626] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-[#DC2626]" /> VER EN YOUTUBE
                </a>
                <button
                  onClick={onTogglePlay}
                  className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> ESCUCHAR AUDIO
                </button>
              </div>
            </article>
          ))}
          {!isLoading && !loadError && filteredVideos.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-zinc-400">
              {videos.length > 1 ? 'No hay videos que coincidan con la búsqueda.' : 'El canal no tiene más videos para mostrar.'}
            </p>
          )}
        </div>
        {loadMoreError && (
          <p role="alert" className="mt-6 text-center text-sm text-red-300">{loadMoreError}</p>
        )}
        {nextPageToken && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => void loadMoreVideos()}
              disabled={isLoadingMore}
              className="flex items-center gap-2 border border-zinc-700 px-5 py-3 font-mono text-xs uppercase tracking-wider text-zinc-200 hover:border-[#DC2626] hover:text-white disabled:cursor-wait disabled:opacity-60"
            >
              {isLoadingMore ? 'CARGANDO...' : 'CARGAR MÁS VIDEOS'}
              {!isLoadingMore && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
