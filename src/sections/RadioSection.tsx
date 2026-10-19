import React, { useState } from 'react';
import {
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Users,
  Activity,
} from 'lucide-react';
import {
  ASSETS,
  AudioTrack,
} from '../data/mockData';
import HeadRadio from '../components/organism/HeadRadio';
import ContentRadio from '../components/organism/ContentRadio';

interface RadioSectionProps {
  currentTrack: AudioTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
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
  onTogglePlay,
  onSelectTrack,
}) => {
  const [streamFormat, setStreamFormat] = useState<'FLAC' | 'MP3_320' | 'AAC_128'>('FLAC');
  const [volume, setVolume] = useState(88);
  const [isMuted, setIsMuted] = useState(false);
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
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6]">
      {/* SECTION HEADER */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-zinc-800/80">
          <HeadRadio />
        </div>
      </section>

      {/* MASTER BROADCAST DECK CONSOLE */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-10">
        <ContentRadio currentTrack={undefined} isPlaying={false} onTogglePlay={function (): void {
          throw new Error('Function not implemented.');
        }} onSelectTrack={function (track: Partial<AudioTrack>): void {
          throw new Error('Function not implemented.');
        }} />
      </section>

      {/* RECENTLY PLAYED HISTORY & LIVE BUNKER CHAT */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Recently Played History */}
          {/* <div className="lg:col-span-7 border border-zinc-800 bg-[#0E0E12] p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
              <div>
                <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block">
                  BITÁCORA DE TRANSMISIÓN
                </span>
                <h3 className="font-display font-black text-2xl uppercase text-white">
                  HISTORIAL DE ROTACIÓN RECIENTE
                </h3>
              </div>
              <Clock className="w-5 h-5 text-zinc-500" />
            </div>

            <div className="divide-y divide-zinc-800/80">
              {RADIO_HISTORY.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-zinc-900/40 px-2 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="font-mono text-xs text-zinc-500 shrink-0">
                      {item.time}
                    </span>
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-11 h-11 object-cover border border-zinc-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-display font-bold text-sm uppercase text-white truncate">
                        {item.title}{' '}
                        <span className="text-[#DC2626]">— {item.band}</span>
                      </div>
                      <div className="font-mono text-[11px] text-zinc-500 truncate">
                        {item.album}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      onSelectTrack({
                        title: item.title,
                        artist: item.band,
                        album: item.album,
                        cover: item.cover,
                      })
                    }
                    className="font-mono text-[10px] uppercase tracking-wider border border-zinc-800 hover:border-[#DC2626] text-zinc-300 hover:text-white px-3 py-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    ESCUCHAR
                  </button>
                </div>
              ))}
            </div>
          </div> */}

          {/* Right 5 Cols: Live Listeners Chat */}
          {/* <div className="lg:col-span-5 border border-zinc-800 bg-[#0E0E12] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
                <div>
                  <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block">
                    COMUNIDAD EN DIRECTO
                  </span>
                  <h3 className="font-display font-black text-2xl uppercase text-white">
                    TRINCHERA DE OYENTES
                  </h3>
                </div>
                <span className="font-mono text-[10px] bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 px-2.5 py-1">
                  214 EN EL CHAT
                </span>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 mb-5">
                {chatMessages.map((c, i) => (
                  <div
                    key={i}
                    className={`p-3.5 border ${
                      c.isMod
                        ? 'bg-[#170B0E] border-[#DC2626]/60'
                        : 'bg-[#070709] border-zinc-800/90'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                      <span
                        className={`font-bold ${
                          c.isMod ? 'text-[#DC2626]' : 'text-white'
                        }`}
                      >
                        {c.user}{' '}
                        <span className="text-zinc-500 font-normal ml-1">
                          [{c.country}]
                        </span>
                      </span>
                      <span className="text-zinc-500">{c.time}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{c.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendChat} className="space-y-2.5 pt-3 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  placeholder="Tu Alias"
                  className="w-1/3 bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3 py-2 text-xs font-mono text-zinc-300 outline-none"
                />
                <input
                  type="text"
                  value={newChatMsg}
                  onChange={(e) => setNewChatMsg(e.target.value)}
                  placeholder="Escribe un mensaje a la cabina..."
                  className="flex-1 bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3 py-2 text-xs font-mono text-white outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#DC2626] hover:bg-red-700 text-white px-4 py-2 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div> */}
        </div>
      </section>

      {/* 24-HOUR PROGRAMMING SCHEDULE */}
      {/* <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-12">
        <div className="border border-zinc-800 bg-[#0E0E12] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-6 border-b border-zinc-800">
            <div>
              <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block mb-1">
                // PARRILLA DE PROGRAMACIÓN DIARIA
              </span>
              <h2 className="font-display font-black text-3xl uppercase text-white">
                CRONOGRAMA DE TRANSMISIÓN 24 HORAS
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#DC2626]" /> HUSO HORARIO: CET (ESTOCOLMO / MADRID)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RADIO_SCHEDULE.map((slot) => (
              <div
                key={slot.id}
                className={`p-5 border flex flex-col justify-between transition-all ${
                  slot.isLive
                    ? 'bg-[#140A0D] border-[#DC2626] relative'
                    : 'bg-[#070709] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] mb-3">
                    <span className="text-zinc-400 font-bold">{slot.time}</span>
                    <span
                      className={`px-2 py-0.5 uppercase font-bold ${
                        slot.isLive
                          ? 'bg-[#DC2626] text-white'
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl uppercase text-white mb-2">
                    {slot.title}
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                    {slot.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-zinc-300 font-bold">{slot.host}</span>
                  <button
                    onClick={onTogglePlay}
                    className={`uppercase tracking-wider font-bold cursor-pointer ${
                      slot.isLive
                        ? 'text-[#DC2626]'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {slot.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* RESIDENT DJS / LOCUTORES */}
      {/* <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-16">
        <div className="mb-6">
          <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block mb-1">
            // CURADORES DEL SONIDO PESADO
          </span>
          <h2 className="font-display font-black text-3xl uppercase text-white">
            LOCUTORES Y COLECCIONISTAS RESIDENTES
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {RADIO_DJS.map((dj) => (
            <div
              key={dj.name}
              className="border border-zinc-800 bg-[#0E0E12] overflow-hidden group"
            >
              <div className="aspect-[4/3] overflow-hidden bg-black border-b border-zinc-800">
                <img
                  src={dj.image}
                  alt={dj.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
              </div>
              <div className="p-5">
                <div className="font-mono text-[10px] text-[#DC2626] font-bold uppercase tracking-widest mb-1">
                  {dj.specialty}
                </div>
                <h3 className="font-display font-black text-xl uppercase text-white mb-2">
                  {dj.name}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{dj.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section> */}
    </div>
  );
};
