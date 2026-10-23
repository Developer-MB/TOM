import React, { useState, useRef, useEffect } from 'react';
import { AudioTrack, SectionId } from './data/mockData';
import { Navbar } from './components/organism/Navbar';
import { Footer } from './components/organism/Footer';
import { HomeSection } from './sections/HomeSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { GallerySection } from './sections/GallerySection';
import { VideopodcastSection } from './sections/VideopodcastSection';
import { RadioSection } from './sections/RadioSection';
import { CmsSection } from './sections/CmsSection';
import { AUDIO_ASSETS } from './data/Assets';

const toAudioTrack = (track: (typeof AUDIO_ASSETS)[number]): AudioTrack => ({
  id: track.id,
  title: track.title,
  artist: track.band,
  album: track.disc,
  src: track.src,
  cover: track.cover,
  duration: '',
  currentTime: '',
  bitrate: '192 kbps',
});

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('inicio');
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(() => toAudioTrack(AUDIO_ASSETS[0]));
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIndexRef = useRef(0);

  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      audio.volume = 0.8;
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
      void playAssetTrack(selectedAsset);
      return;
    }

    setCurrentTrack((prev) => ({ ...prev, ...trackUpdate }));
    const audio = audioRef.current;
    if (!audio || !trackUpdate.src) return;

    audio.src = trackUpdate.src;
    audio.load();
    audio.volume = 0.8;
    void audio.play()
      .then(() => setIsPlaying(true))
      .catch((error: unknown) => {
        console.error('Error al reproducir la canción seleccionada:', error);
        setIsPlaying(false);
      });
  };

  const playAssetTrack = async (track: (typeof AUDIO_ASSETS)[number]) => {
    const audio = audioRef.current;
    if (!audio) return;

    currentTrackIndexRef.current = AUDIO_ASSETS.findIndex((asset) => asset.id === track.id);
    setCurrentTrack(toAudioTrack(track));
    audio.src = track.src;
    audio.load();
    audio.volume = 0.8;

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error(`No se pudo reproducir "${track.title}":`, error);
      setIsPlaying(false);
    }
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

    audio.volume = 0.8;
    void audio.play()
      .then(() => setIsPlaying(true))
      .catch((error: unknown) => {
        setIsPlaying(false);
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          console.info('El navegador bloqueó la reproducción automática. Presiona Sintonizar para iniciar.');
          return;
        }
        console.error('No se pudo iniciar la reproducción automática:', error);
      });

    return () => {
      audio.pause();
    };
  }, []);

  const handleSelectSection = (section: SectionId) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSelectSection={handleSelectSection}
            onPlayCustomTrack={handleSelectTrack}
          />
        )}

        {activeSection === 'resenas' && (
          <ReviewsSection
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSelectSection={handleSelectSection}
            onPlayCustomTrack={handleSelectTrack}
          />
        )}

        {activeSection === 'galeria' && (
          <GallerySection
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSelectSection={handleSelectSection}
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

        {activeSection === 'radio' && (
          <RadioSection
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
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
