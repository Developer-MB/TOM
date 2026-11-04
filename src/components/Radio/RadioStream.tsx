import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Activity, Check, Copy, Pause, Play, Radio, Volume2, VolumeX } from 'lucide-react';

const STREAM_URL_STORAGE_KEY = 'time-of-metal-stream-url';

type StreamStatus = 'idle' | 'connecting' | 'playing' | 'paused' | 'error';

const readSavedStreamUrl = () => {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(STREAM_URL_STORAGE_KEY) ?? '';
  } catch (error) {
    console.error('No se pudo leer la URL de streaming guardada:', error);
    return '';
  }
};

const RadioStream = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [streamUrl, setStreamUrl] = useState(readSavedStreamUrl);
  const [urlInput, setUrlInput] = useState(streamUrl);
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [message, setMessage] = useState('');
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  const handleSaveUrl = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(urlInput.trim());
    } catch {
      setMessage('Escribe una URL completa, por ejemplo https://radio.midominio.com:8000/');
      setStatus('error');
      return;
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) {
      setMessage('Usa una URL http(s) pública. No incluyas usuario ni contraseña.');
      setStatus('error');
      return;
    }

    const savedUrl = parsedUrl.toString();
    try {
      window.localStorage.setItem(STREAM_URL_STORAGE_KEY, savedUrl);
      setMessage('URL guardada. Ya puedes conectarte a la radio.');
    } catch (error) {
      console.error('No se pudo guardar la URL de streaming:', error);
      setMessage('No se pudo guardar la URL en este navegador; se usará durante esta sesión.');
    }

    setUrlInput(savedUrl);
    setStreamUrl(savedUrl);
    setStatus('idle');
  };

  const handleTogglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    if (!audio.paused) {
      audio.pause();
      setStatus('paused');
      return;
    }

    setStatus('connecting');
    setMessage('');
    try {
      await audio.play();
    } catch (error) {
      console.error('No se pudo reproducir el stream de radio:', error);
      setStatus('error');
      setMessage('No se pudo iniciar el stream. Comprueba la URL y que el servidor esté transmitiendo.');
    }
  };

  const handleCopyUrl = async () => {
    if (!streamUrl) return;
    try {
      await navigator.clipboard.writeText(streamUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('No se pudo copiar la URL del stream:', error);
      setMessage('No se pudo copiar automáticamente. Selecciona y copia la URL manualmente.');
    }
  };

  const statusLabel = {
    idle: 'LISTA PARA CONECTAR',
    connecting: 'CONECTANDO...',
    playing: 'TRANSMITIENDO EN VIVO',
    paused: 'REPRODUCCIÓN PAUSADA',
    error: 'ERROR DE CONEXIÓN',
  }[status];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <section className="border border-zinc-800 bg-[#0E0E12] p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-[#DC2626]" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Time of Metal</p>
              <h2 className="font-display text-xl font-black uppercase text-white sm:text-2xl">Radio en vivo</h2>
            </div>
          </div>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            <span className={`h-2 w-2 rounded-full ${status === 'playing' ? 'animate-pulse bg-red-500' : 'bg-zinc-600'}`} />
            {statusLabel}
          </span>
        </div>

        <div className="py-8 text-center">
          <Activity className={`mx-auto mb-4 h-10 w-10 ${status === 'playing' ? 'text-[#DC2626]' : 'text-zinc-700'}`} />
          <p className="font-display text-2xl font-black uppercase text-white">
            {status === 'playing' ? 'Estás escuchando' : 'Sintoniza la señal'}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            {streamUrl ? 'Conéctate al stream en vivo de la estación.' : 'Configura abajo la URL pública de tu stream Shoutcast.'}
          </p>
        </div>

        <audio
          className="hidden"
          ref={audioRef}
          src={streamUrl || undefined}
          preload="none"
          onPlaying={() => setStatus('playing')}
          onPause={() => setStatus((current) => current === 'error' ? current : 'paused')}
          onWaiting={() => setStatus('connecting')}
          onError={(event) => {
            const mediaError = event.currentTarget.error;
            console.error('Error al cargar el stream de radio:', mediaError?.message ?? 'Error multimedia desconocido');
            setStatus('error');
            setMessage('No se pudo cargar el stream. Revisa la URL, el formato de audio y que el servidor esté en línea.');
          }}
        />

        <div className="flex flex-col gap-4 border-t border-zinc-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => void handleTogglePlayback()}
            disabled={!streamUrl || status === 'connecting'}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#DC2626] px-6 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {status === 'playing' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {status === 'playing' ? 'Pausar' : 'Reproducir stream'}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMuted((muted) => !muted)}
              className="text-zinc-400 transition-colors hover:text-white"
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-28 accent-[#DC2626]"
              aria-label="Volumen"
            />
            <span className="w-9 text-right font-mono text-xs text-zinc-400">{isMuted ? 0 : volume}%</span>
          </div>
        </div>

        <div className="mt-5">
          <form onSubmit={handleSaveUrl} className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="radio-stream-url" className="sr-only">URL pública del stream</label>
            <input
              id="radio-stream-url"
              type="url"
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              placeholder="https://radio.midominio.com:8000/"
              autoComplete="url"
              className="min-h-11 min-w-0 flex-1 border border-zinc-700 bg-black px-3 font-mono text-xs text-white outline-none placeholder:text-zinc-600 focus:border-[#DC2626]"
            />
            <button
              type="submit"
              className="min-h-11 border border-zinc-700 px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Guardar URL
            </button>
            <button
              type="button"
              onClick={() => void handleCopyUrl()}
              disabled={!streamUrl}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-zinc-700 px-4 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiada' : 'Copiar'}
            </button>
          </form>
          {message && (
            <p role={status === 'error' ? 'alert' : 'status'} className={`mt-2 text-xs ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
              {message}
            </p>
          )}
          {streamUrl && (
            <p className="mt-2 break-all font-mono text-[10px] text-zinc-500">{streamUrl}</p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Esta es la URL pública para oyentes, no la contraseña de emisión. En una web HTTPS, el stream también debe usar HTTPS.
          </p>
        </div>

      </section>

      <aside className="border border-zinc-800 bg-[#0B0B0E] p-5 sm:p-7">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#DC2626]">Guía de emisión</p>
        <h2 className="mt-2 font-display text-xl font-black uppercase text-white">Conectar Shoutcast DSP</h2>
        <ol className="mt-5 space-y-4 text-sm leading-relaxed text-zinc-300">
          <li><span className="mr-2 font-mono text-[#DC2626]">01</span>En Winamp, abre <strong>Options → Preferences → Plug-ins → DSP/Effect</strong> y selecciona <strong>Nullsoft SHOUTcast Source DSP</strong>.</li>
          <li><span className="mr-2 font-mono text-[#DC2626]">02</span>En <strong>Output</strong>, introduce el host, puerto y contraseña de fuente que te dio tu proveedor. Elige SHOUTcast v1 o v2 según tu servidor.</li>
          <li><span className="mr-2 font-mono text-[#DC2626]">03</span>En <strong>Encoder</strong>, elige MP3 y un bitrate compatible con tu plan (por ejemplo, 128 kbps); en <strong>Input</strong>, selecciona Winamp o la entrada de audio.</li>
          <li><span className="mr-2 font-mono text-[#DC2626]">04</span>Pulsa <strong>Connect</strong> en Output. Cuando el panel del proveedor muestre la fuente conectada, pega aquí la URL pública de escucha.</li>
        </ol>
        <div className="mt-6 border-l-2 border-amber-500 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-100/80">
          No pongas la contraseña de fuente en esta web. Usa la URL de oyentes indicada por tu proveedor; algunos servidores Shoutcast v2 requieren añadir el identificador de stream (por ejemplo, <code>/;stream/1</code>).
        </div>
        <p className="mt-4 text-xs leading-relaxed text-zinc-500">
          Si la web está en HTTPS y el servidor solo ofrece HTTP, el navegador bloqueará la conexión. Habilita HTTPS para oyentes o configura un proxy inverso seguro en el servidor.
        </p>
      </aside>
    </div>
  );
};

export default RadioStream;
