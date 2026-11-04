import React, { useState } from 'react';
import { AudioTrack } from '../data/mockData';
import HeadRadio from '../components/Radio/HeadRadio';
import ContentRadio from '../components/Radio/ContentRadio';
import RadioStream from '../components/Radio/RadioStream';

interface RadioSectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  audioAnalyser: AnalyserNode | null;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onSelectTrack: (track: Partial<AudioTrack>) => void;
}

const INITIAL_CHAT = [
  {
    user: 'Necro Butcher_666',
    country: '🇳🇴 OSLO',
    time: '15:46',
    msg: '¡Ese tono de guitarra en Transilvanian Hunger sigue siendo el estándar absoluto del frío nórdico!',
    isMod: false,
  },
  {
    user: 'DJ RAVN [LOCUTOR]',
    country: '🇸🇪 CABINA CENTRAL',
    time: '15:47',
    msg: 'En 10 minutos pondremos la primera prensa en vinilo de "Storm of the Light\'s Bane" sin compresión digital. Suban el volumen.',
    isMod: true,
  },
  {
    user: 'Krieg_Thrasher',
    country: '🇩🇪 ESSEN',
    time: '15:48',
    msg: 'Sintonizando en FLAC desde Alemania. La fidelidad del stream hoy está demoledora.',
    isMod: false,
  },
  {
    user: 'Valeria_Doom',
    country: '🇲🇽 CDMX',
    time: '15:49',
    msg: 'Saludos al búnker desde Ciudad de México. ¿Pueden programar algo de Disembowelment o Evoken más tarde?',
    isMod: false,
  },
];

export const RadioSection: React.FC<RadioSectionProps> = ({
  currentTrack,
  isPlaying,
  audioAnalyser,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  onSelectTrack,
}) => {
  const [streamFormat, setStreamFormat] = useState<'FLAC' | 'MP3_320' | 'AAC_128'>('FLAC');
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT);
  const [newChatMsg, setNewChatMsg] = useState('');
  const [aliasInput, setAliasInput] = useState('Acolito_Metal');
  const [requestInput, setRequestInput] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMsg.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        user: aliasInput || 'Acolito_Metal',
        country: '🌐 BUNKER',
        time: 'AHORA',
        msg: newChatMsg.trim(),
        isMod: false,
      },
    ]);
    setNewChatMsg('');
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestInput.trim()) return;
    setRequestSent(true);
    setRequestInput('');
    setTimeout(() => setRequestSent(false), 3500);
  };

  const handleCopyStreamUrl = () => {
    navigator.clipboard?.writeText('https://stream.timeofmetal.fm:8443/extreme-flac.ogg');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F4F6]">
      <section className="max-w-360 mx-auto px-4 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-zinc-800/80">
          <HeadRadio />
        </div>
      </section>

      <section className="max-w-360 mx-auto px-4 lg:px-8 pb-10">
        {/* <ContentRadio
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          audioAnalyser={audioAnalyser}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          volume={volume}
          onVolumeChange={onVolumeChange}
          onSelectTrack={onSelectTrack}
        /> */}
        <RadioStream />
      </section>
    </div>
  );
};
