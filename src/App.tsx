import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { AudioTrack, SectionId } from './data/mockData';
import { Navbar } from './components/organism/Navbar';
import { Footer } from './components/organism/Footer';
import { HomeSection } from './sections/HomeSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { GallerySection } from './sections/GallerySection';
import { VideopodcastSection } from './sections/VideopodcastSection';
import { CmsSection } from './sections/CmsSection';
import { Tours } from './components/Tours/Tours';
import { AUDIO_ASSETS } from './data/Radio';
import { RadioSection } from './sections/RadioSection';
import {
  INITIAL_CMS_GALLERIES,
  INITIAL_CMS_ITEMS,
  type CmsGalleryItem,
  type CmsPostItem,
} from './data/Cms';
import { readJsonResponseOrFallback } from './data/readJsonResponse';
import { toHomeGalleryItems } from './data/HomePics';

const toAudioTrack = (track: (typeof AUDIO_ASSETS)[number]): AudioTrack => ({
  id: track.id,
  title: track.title,
  artist: track.band,
  album: track.disc,
  src: track.src,
  cover: track.cover,
  duration: '',
  currentTime: '',
  bitrate: '320 kbps',
});

const recordAnalyticsEvent = async (type: 'portal' | 'radio') => {
  try {
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
      keepalive: true,
    });
    if (response.status !== 204) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('No se pudo registrar la visita en las métricas:', error);
  }
};

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('inicio');
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(() => toAudioTrack(AUDIO_ASSETS[0]));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cmsPosts, setCmsPosts] = useState<CmsPostItem[]>(INITIAL_CMS_ITEMS);
  const [cmsGalleries, setCmsGalleries] = useState<CmsGalleryItem[]>(INITIAL_CMS_GALLERIES);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(import.meta.env.DEV);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playRequestId, setPlayRequestId] = useState(0);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTrackIndexRef = useRef(0);
  const hasRecordedPortalVisit = useRef(false);

  useEffect(() => {
    if (hasRecordedPortalVisit.current) return;
    hasRecordedPortalVisit.current = true;
    void recordAnalyticsEvent('portal');
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadCmsEntries = async () => {
      try {
        const [postsResponse, galleriesResponse] = await Promise.all([
          fetch('/api/cms/posts', { signal: controller.signal }),
          fetch('/api/cms/galleries', { signal: controller.signal }),
        ]);
        const [posts, galleries] = await Promise.all([
          readJsonResponseOrFallback<unknown>(
            postsResponse,
            'No se pudieron cargar las publicaciones.',
            INITIAL_CMS_ITEMS,
          ),
          readJsonResponseOrFallback<unknown>(
            galleriesResponse,
            'No se pudieron cargar las galerías.',
            INITIAL_CMS_GALLERIES,
          ),
        ]);
        if (!Array.isArray(posts) || !Array.isArray(galleries)) {
          throw new Error('El servidor devolvió registros del CMS no válidos.');
        }

        setCmsPosts(posts as CmsPostItem[]);
        setCmsGalleries(galleries as CmsGalleryItem[]);
        setRecommendationsError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'No se pudieron cargar las publicaciones.';
        if (import.meta.env.DEV) setRecommendationsError(message);
        console.error('No se pudieron actualizar las entradas del CMS:', error);
      } finally {
        if (!controller.signal.aborted) setIsLoadingRecommendations(false);
      }
    };

    void loadCmsEntries();
    const intervalId = window.setInterval(() => {
      void loadCmsEntries();
    }, 15_000);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioContextRef.current?.resume();
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error al reproducir el audio:', err);
      setIsPlaying(false);
    }
  };

  const handleSelectTrack = (trackUpdate: Partial<AudioTrack>) => {
    const selectedAsset = AUDIO_ASSETS.find((track) => track.id === trackUpdate.id);
    if (selectedAsset) {
      setCurrentTrack(toAudioTrack(selectedAsset));
      currentTrackIndexRef.current = AUDIO_ASSETS.findIndex((asset) => asset.id === selectedAsset.id);
      setPlayRequestId((requestId) => requestId + 1);
      return;
    }

    setCurrentTrack((prev) => ({ ...prev, ...trackUpdate }));
    if (trackUpdate.src) setPlayRequestId((requestId) => requestId + 1);
  };

  const playAssetTrack = (track: (typeof AUDIO_ASSETS)[number]) => {
    currentTrackIndexRef.current = AUDIO_ASSETS.findIndex((asset) => asset.id === track.id);
    setCurrentTrack(toAudioTrack(track));
    setPlayRequestId((requestId) => requestId + 1);
  };

  const handleTrackEnded = () => {
    if (AUDIO_ASSETS.length === 0) return;

    const nextIndex = (currentTrackIndexRef.current + 1) % AUDIO_ASSETS.length;
    const nextTrack = AUDIO_ASSETS[nextIndex];
    if (nextTrack) void playAssetTrack(nextTrack);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
      console.error('Este navegador no soporta el análisis de audio.');
      return;
    }

    try {
      const audioContext = new AudioContextConstructor();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      audioContextRef.current = audioContext;
      setAudioAnalyser(analyser);
    } catch (error) {
      console.error('No se pudo inicializar el análisis de audio:', error);
    }

    return () => {
      audioContextRef.current?.close().catch((error: unknown) => {
        console.error('No se pudo cerrar el contexto de audio:', error);
      });
      audioContextRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume / 100;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    if (playRequestId === 0) return;

    const audio = audioRef.current;
    if (!audio) return;

    let requestIsCurrent = true;
    void (async () => {
      await audioContextRef.current?.resume();
      await audio.play();
    })()
      .then(() => {
        if (requestIsCurrent) setIsPlaying(true);
      })
      .catch((error: unknown) => {
        if (!requestIsCurrent) return;
        console.error(`No se pudo reproducir "${currentTrack.title}":`, error);
        setIsPlaying(false);
      });

    return () => {
      requestIsCurrent = false;
    };
  }, [playRequestId, currentTrack.src, currentTrack.title]);

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);
    setIsMuted(false);
  };

  const handleSelectSection = (section: SectionId) => {
    if (section === 'radio' && activeSection !== 'radio') {
      void recordAnalyticsEvent('radio');
    }
    setActiveSection(section);
    if (section === 'radio' && !isPlaying) {
      void audioContextRef.current?.resume().catch((error: unknown) => {
        console.error('No se pudo activar el análisis de audio:', error);
      });
      setPlayRequestId((requestId) => requestId + 1);
    }
  };

  const publishedRecommendations = cmsPosts.filter(
    (post) => post.type === 'RECOMENDACION' && post.status === 'PUBLICADO',
  );
  const publishedGalleries = toHomeGalleryItems(cmsGalleries);

  return (
    <div className="min-h-screen bg-[#000] text-[#F4F4F6] flex flex-col selection:bg-[#DC2626] selection:text-white">
      <Navbar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onToggleRadioPlay={handleTogglePlay}
        isPlaying={isPlaying}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="auto"
        onEnded={handleTrackEnded}
        onError={() => {
          console.error(`No se pudo cargar el audio: ${currentTrack.src}`);
          // setIsPlaying(false);
        }}
        style={{ display: 'none' }}
      />

      <main className="flex-1">
        {activeSection === 'inicio' && (
          <HomeSection
            onSelectSection={handleSelectSection}
            reviews={publishedRecommendations}
            galleries={publishedGalleries}
            isLoadingReviews={isLoadingRecommendations}
            reviewsError={recommendationsError}
          />
        )}

        {activeSection === 'resenas' && (
          <ReviewsSection
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSelectSection={handleSelectSection}
            onPlayCustomTrack={handleSelectTrack}
            reviews={publishedRecommendations}
            isLoadingReviews={isLoadingRecommendations}
            reviewsError={recommendationsError}
          />
        )}

        {activeSection === 'galeria' && (
          <GallerySection
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSelectSection={handleSelectSection}
            galleries={publishedGalleries}
          />
        )}

        {activeSection === 'videopodcast' && (
          <VideopodcastSection
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSelectSection={handleSelectSection}
          />
        )}

        {activeSection === 'eventos' && <Tours />}

        {activeSection === 'radio' && (
          <RadioSection
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            audioAnalyser={audioAnalyser}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((muted) => !muted)}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onSelectTrack={handleSelectTrack}
          />
        )}

        {activeSection === 'cms' && (
          <CmsSection onSelectSection={handleSelectSection} />
        )}
      </main>

      <Footer onSelectSection={handleSelectSection} />
    </div>
  );
}
