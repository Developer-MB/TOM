import React, { useState, useRef, useEffect } from 'react';
import {
  AudioTrack,
  DEFAULT_RADIO_STREAM,
  SectionId,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeSection } from './sections/HomeSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { GallerySection } from './sections/GallerySection';
import { VideopodcastSection } from './sections/VideopodcastSection';
import { RadioSection } from './sections/RadioSection';
import { CmsSection } from './sections/CmsSection';

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('inicio');
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(DEFAULT_RADIO_STREAM);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Web Audio API synthesizer for authentic heavy drone/riff preview feedback when user toggles radio stream
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const stopAudioEngine = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
      gainNodeRef.current = null;
    }
  };

  const startAudioEngine = () => {
    try {
      stopAudioEngine();
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      // Deep dark sub-bass analog console hum / dark ambient drone
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(82.41, ctx.currentTime); // E2 power fifth

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, ctx.currentTime);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
    } catch {
      // Ignore if browser blocks audio context
    }
  };

  useEffect(() => {
    return () => stopAudioEngine();
  }, []);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        startAudioEngine();
      } else {
        stopAudioEngine();
      }
      return next;
    });
  };

  const handleSelectTrack = (trackUpdate: Partial<AudioTrack>) => {
    setCurrentTrack((prev) => ({
      ...prev,
      ...trackUpdate,
    }));
    if (!isPlaying) {
      setIsPlaying(true);
      startAudioEngine();
    }
  };

  const handleSelectSection = (section: SectionId) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6] flex flex-col selection:bg-[#DC2626] selection:text-white">
      <Navbar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onToggleRadioPlay={handleTogglePlay}
        isPlaying={isPlaying}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
