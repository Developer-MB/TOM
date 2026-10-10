import React, { useState } from 'react';
import {
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Disc,
  Users,
  Activity,
  Clock,
  Send,
  Headphones,
  Download,
  Copy,
  Check,
  Flame,
  Calendar,
} from 'lucide-react';
import {
  ASSETS,
  AudioTrack,
  RADIO_DJS,
  RADIO_HISTORY,
  RADIO_SCHEDULE,
} from '../data/mockData';

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
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" /> SEÑAL EN VIVO 24/7
              </span>
              <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest">
                // TRANSMISIÓN CONTINUA SIN ALGORITMOS NI ANUNCIOS
              </span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight leading-[0.92] text-white">
              LA FRECUENCIA DEL <span className="text-[#DC2626]">ABISMO</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mt-3 leading-relaxed">
              Emisora dedicada exclusivamente al underground mundial, prensas originales en vinilo y sesiones en directo. Cero compresión comercial; directo de nuestra consola analógica a tus oídos.
            </p>
          </div>

          {/* Live Telemetry Counters */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-end">
            <div className="border border-zinc-800 bg-[#0E0E12] px-4 py-3 flex items-center gap-3">
              <Users className="w-5 h-5 text-[#DC2626]" />
              <div>
                <div className="font-display font-black text-xl text-white leading-none">
                  1,428
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-1">
                  OYENTES ACTIVOS
                </div>
              </div>
            </div>
            <div className="border border-zinc-800 bg-[#0E0E12] px-4 py-3 flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="font-display font-black text-xl text-emerald-400 leading-none">
                  1411 KBPS
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-1">
                  MASTER FLAC 24-BIT
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MASTER BROADCAST DECK CONSOLE */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-10">
        <div className="border-2 border-zinc-800 bg-[#0E0E12] relative overflow-hidden">
          {/* Top Technical Bar */}
          <div className="bg-[#09090C] border-b border-zinc-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                CONSOLA MAESTRA DE TRANSMISIÓN // CABINA ESTOCOLMO - CDMX
              </span>
            </div>

            {/* Stream Quality Selector */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mr-1">
                FLUJO DE AUDIO:
              </span>
              {(
                [
                  { id: 'FLAC', label: 'FLAC LOSSLESS (1411k)' },
                  { id: 'MP3_320', label: 'MP3 HQ (320k)' },
                  { id: 'AAC_128', label: 'MÓVIL AAC (128k)' },
                ] as const
              ).map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setStreamFormat(fmt.id)}
                  className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors cursor-pointer ${
                    streamFormat === fmt.id
                      ? 'bg-[#DC2626] text-white border-[#DC2626] font-bold'
                      : 'bg-[#070709] text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Console Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left 7 Cols: Turntable & Current Track */}
            <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Vinyl Artwork */}
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0 border border-zinc-700 bg-black overflow-hidden group">
                  <img
                    src={currentTrack.cover}
                    alt={currentTrack.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isPlaying ? 'scale-105' : 'opacity-80'
                    }`}
                  />
                  <div className="absolute top-2 left-2 bg-[#DC2626] text-white font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5">
                    SONANDO AHORA
                  </div>
                </div>

                {/* Track Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 font-mono text-[10px] text-[#DC2626] uppercase tracking-widest mb-3">
                    <Radio className="w-3.5 h-3.5" /> PROGRAMA ACTUAL: LA HORA DE LAS BESTIAS
                  </div>
                  <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white leading-none mb-2">
                    {currentTrack.title}
                  </h2>
                  <div className="font-display font-bold text-lg text-[#DC2626] uppercase tracking-wide mb-1">
                    {currentTrack.artist}
                  </div>
                  <div className="font-mono text-xs text-zinc-400 mb-5">
                    ÁLBUM: {currentTrack.album}
                  </div>

                  {/* Animated Spectrum Visualizer Bars */}
                  <div className="bg-[#070709] border border-zinc-800 p-3 mb-4">
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-1.5">
                      <span>ESPECTRO DE FRECUENCIAS (L/R)</span>
                      <span className="text-emerald-400">PEAK -0.4 dB</span>
                    </div>
                    <div className="h-9 flex items-end gap-1">
                      {[
                        45, 78, 92, 60, 85, 95, 70, 50, 88, 96, 64, 72, 90, 55, 80, 94,
                        68, 42, 76, 89, 62, 84, 91, 58, 73, 86, 65, 48, 77, 60,
                      ].map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 transition-all duration-300 ${
                            h > 85
                              ? 'bg-[#DC2626]'
                              : h > 65
                              ? 'bg-amber-500'
                              : 'bg-zinc-600'
                          }`}
                          style={{
                            height: isPlaying ? `${h}%` : '18%',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Deck Controls Bar */}
              <div className="pt-6 mt-6 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={onTogglePlay}
                    className="bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3.5 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" /> DETENER SEÑAL
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" /> CONECTAR SEÑAL EN VIVO
                      </>
                    )}
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2.5 bg-[#070709] border border-zinc-800 px-3.5 py-2.5">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-[#DC2626]" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-24 accent-[#DC2626] cursor-pointer"
                    />
                    <span className="font-mono text-[11px] text-zinc-300 w-8 text-right">
                      {isMuted ? '0%' : `${volume}%`}
                    </span>
                  </div>
                </div>

                {/* External Players Links */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyStreamUrl}
                    className="bg-[#070709] hover:bg-zinc-900 border border-zinc-800 px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> URL COPIADA
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-500" /> URL STREAM (.M3U)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Active Host & Song Request Box */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0B0B0E] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-zinc-500 pb-3 mb-4 border-b border-zinc-800">
                  <span>EN CABINA AHORA (16:00 - 19:00 CET)</span>
                  <span className="text-[#DC2626] font-bold">● MICRÓFONO ABIERTO</span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={ASSETS.djRavn}
                    alt="DJ Ravn"
                    className="w-20 h-20 object-cover border border-zinc-700 shrink-0"
                  />
                  <div>
                    <h3 className="font-display font-black text-2xl uppercase text-white">
                      DJ RAVN
                    </h3>
                    <div className="font-mono text-xs text-[#DC2626] font-bold uppercase mb-1">
                      LA HORA DE LAS BESTIAS // ESPECIAL VINILOS NÓRDICOS
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Seleccionando prensas originales de Osmose Productions, Deathlike Silence y Earache Records (1988–1995).
                    </p>
                  </div>
                </div>
              </div>

              {/* Request Track Form */}
              <div className="bg-[#070709] border border-zinc-800 p-5">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#DC2626]" /> SOLICITAR TEMA A CABINA
                </div>
                <p className="text-zinc-400 text-xs mb-3">
                  Envía tu petición directamente al locutor en turno para el bloque de vinilos a petición:
                </p>
                <form onSubmit={handleSendRequest} className="flex gap-2">
                  <input
                    type="text"
                    value={requestInput}
                    onChange={(e) => setRequestInput(e.target.value)}
                    placeholder="Ej: Dissection - Night's Blood (1995)..."
                    className="flex-1 bg-[#0E0E12] border border-zinc-800 focus:border-[#DC2626] px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 transition-colors cursor-pointer shrink-0"
                  >
                    PEDIR
                  </button>
                </form>
                {requestSent && (
                  <p className="font-mono text-[11px] text-emerald-400 mt-2">
                    ✓ PETICIÓN RECIBIDA EN LA CONSOLA DE DJ RAVN.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY PLAYED HISTORY & LIVE BUNKER CHAT */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Recently Played History */}
          <div className="lg:col-span-7 border border-zinc-800 bg-[#0E0E12] p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
              <div>
                <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block">
                  // BITÁCORA DE TRANSMISIÓN
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
          </div>

          {/* Right 5 Cols: Live Listeners Chat */}
          <div className="lg:col-span-5 border border-zinc-800 bg-[#0E0E12] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
                <div>
                  <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block">
                    // COMUNIDAD EN DIRECTO
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
          </div>
        </div>
      </section>

      {/* 24-HOUR PROGRAMMING SCHEDULE */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-12">
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
      </section>

      {/* RESIDENT DJS / LOCUTORES */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-16">
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
      </section>
    </div>
  );
};
