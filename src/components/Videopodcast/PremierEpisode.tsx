import { Volume2 } from 'lucide-react';
import type { YouTubeVideo } from '@/src/data/YouTube';

type PremierEpisodeProps = {
    onTogglePlay: () => void;
    video: YouTubeVideo;
};

export const PremierEpisode: React.FC<PremierEpisodeProps> = ({ onTogglePlay, video }) => {
      return (
          <div className="border border-zinc-800 bg-[#0E0E12]">
              <div className="grid grid-cols-1 lg:grid-cols-8">
                  {/* ESTRENO */}
                  <div className="lg:col-span-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800">
                      <div className="relative aspect-video bg-black overflow-hidden group">
                          <iframe
                              className="absolute inset-0 h-full w-full"
                              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}`}
                              title={video.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              loading="lazy"
                              allowFullScreen
                          />
                      </div>

                      <div className="p-6 sm:p-8 bg-[#0B0B0E]">
                          <div className="font-mono text-xs font-bold text-[#DC2626] uppercase tracking-wider mb-2">
                              ESTRENO MÁS RECIENTE · {new Date(video.publishedAt).toLocaleDateString('es-MX')}
                          </div>
                          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mb-3">
                              {video.title}
                          </h2>
                          <p className="text-zinc-400 text-sm leading-relaxed">
                              {video.description || 'Mira el episodio más reciente de Time of Metal.'}
                          </p>
                          <button
                              type="button"
                              onClick={onTogglePlay}
                              className="mt-5 font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                              <Volume2 className="w-4 h-4" /> ESCUCHAR RADIO
                          </button>
                      </div>
                </div>
            </div>
        </div>
    )
}

export default PremierEpisode