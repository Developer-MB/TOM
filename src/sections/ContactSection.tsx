import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  Disc3,
  Headphones,
  Mail,
  MapPin,
  Mic2,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import type { SectionId } from '../data/mockData';
import { sanitizeHttpUrl, sanitizePlainText } from '../utils/security';

interface ContactSectionProps {
  onSelectSection: (section: SectionId) => void;
}

type InquiryType = 'DEMO_EPK' | 'COBERTURA_PRENSA' | 'PATROCINIO' | 'MERCH_SOPORTE' | 'COMUNIDAD';

interface ContactSubmissionRecord {
  id: string;
  createdAt: string;
  name: string;
  bandOrCompany: string;
  email: string;
  inquiryType: InquiryType;
  epkOrLink: string;
  message: string;
}

const CONTACT_STORAGE_KEY = 'tom_contact_submissions_v1';

const inquiryLabels: Record<InquiryType, string> = {
  DEMO_EPK: 'Envío de Demo / Álbum / EPK para Reseña o Radio',
  COBERTURA_PRENSA: 'Solicitud de Cobertura Fotográfica / Acreditación de Prensa',
  PATROCINIO: 'Alianzas, Publicidad y Booking de Festivales',
  MERCH_SOPORTE: 'Soporte de Pedidos y Tienda Oficial de Merch',
  COMUNIDAD: 'Mensaje General / Propuesta para el Videopodcast',
};

const readStoredSubmissions = (): ContactSubmissionRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ContactSubmissionRecord[]) : [];
  } catch {
    return [];
  }
};

export const ContactSection: React.FC<ContactSectionProps> = ({ onSelectSection }) => {
  const [name, setName] = useState('');
  const [bandOrCompany, setBandOrCompany] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState<InquiryType>('DEMO_EPK');
  const [epkOrLink, setEpkOrLink] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successRecord, setSuccessRecord] = useState<ContactSubmissionRecord | null>(null);
  const [submissions, setSubmissions] = useState<ContactSubmissionRecord[]>(() =>
    readStoredSubmissions(),
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    const cleanName = sanitizePlainText(name, 100);
    const cleanBand = sanitizePlainText(bandOrCompany, 120);
    const cleanEmail = sanitizePlainText(email, 120);
    const cleanMessage = sanitizePlainText(message, 2000);
    const cleanLink = epkOrLink.trim() ? sanitizeHttpUrl(epkOrLink) : '';

    if (!cleanName || !cleanEmail || !cleanMessage) {
      setErrorMessage('Por favor completa tu nombre, correo electrónico y el mensaje.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setErrorMessage('Ingresa un correo electrónico válido para poder responderte.');
      return;
    }

    if (epkOrLink.trim() && !cleanLink) {
      setErrorMessage('El enlace de EPK/Demo debe ser una URL válida con https:// o http://.');
      return;
    }

    const newRecord: ContactSubmissionRecord = {
      id: `TOM-PR-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      name: cleanName,
      bandOrCompany: cleanBand || 'Independiente',
      email: cleanEmail,
      inquiryType,
      epkOrLink: cleanLink,
      message: cleanMessage,
    };

    const updated = [newRecord, ...submissions].slice(0, 15);
    setSubmissions(updated);
    try {
      window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('No se pudo guardar la solicitud de contacto:', error);
    }

    setSuccessRecord(newRecord);
    setName('');
    setBandOrCompany('');
    setEmail('');
    setEpkOrLink('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F4F6]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* ENCABEZADO: MANIFIESTO Y PRENSA */}
        <header className="border-b border-zinc-800 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 border border-[#DC2626]/60 bg-[#DC2626]/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#DC2626]">
              <Sparkles className="h-3 w-3" /> BÚNKER CENTRAL · PRENSA, BOOKING &amp; COMUNIDAD
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              NOSOTROS &amp; CONTACTO OFICIAL
            </h1>
            <p className="max-w-3xl text-sm sm:text-base text-zinc-400 leading-relaxed">
              Time of Metal es la plataforma independiente dedicada a la difusión, archivo fotográfico, crítica especializada y transmisión 24/7 del metal extremo nacional e internacional. Si tienes una banda, organizas giras o buscas cobertura de prensa, este es el canal directo con nuestra redacción.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 font-mono text-xs shrink-0">
            <button
              type="button"
              onClick={() => onSelectSection('radio')}
              className="inline-flex items-center gap-2 border border-zinc-700 bg-[#0E0E12] px-4 py-2.5 uppercase text-zinc-200 hover:border-[#DC2626] hover:text-white cursor-pointer"
            >
              <Radio className="h-4 w-4 text-[#DC2626]" /> Cabina Radio 24/7
            </button>
            <button
              type="button"
              onClick={() => onSelectSection('merch')}
              className="inline-flex items-center gap-2 bg-[#DC2626] px-4 py-2.5 font-bold uppercase text-white hover:bg-red-700 cursor-pointer"
            >
              Tienda Oficial Merch
            </button>
          </div>
        </header>

        {/* MÉTRICAS Y PILARES EDITORIALES */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Radio,
              metric: '24/7 FLAC HQ',
              title: 'Rotación Radial Continua',
              desc: 'Programación curada de bandas consagradas y talento emergente del underground latinoamericano.',
            },
            {
              icon: Disc3,
              metric: '+350 RESEÑAS',
              title: 'Crítica & Recomendaciones',
              desc: 'Análisis sin censura de lanzamientos de Death, Black, Thrash, Doom, Prog y Heavy Metal.',
            },
            {
              icon: Camera,
              metric: 'FOSO & BACKSTAGE',
              title: 'Cobertura Fotográfica RAW',
              desc: 'Documentación visual de festivales y conciertos con acreditación de prensa especializada.',
            },
            {
              icon: Mic2,
              metric: 'EPISODIOS SEMANALES',
              title: 'Videopodcast en Estudio',
              desc: 'Entrevistas exclusivas, debates de escena y sesiones en directo desde nuestro búnker.',
            },
          ].map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="border border-zinc-800 bg-[#0E0E12] p-5 space-y-3 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center border border-[#DC2626]/50 bg-[#DC2626]/10 text-[#DC2626]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-700/50 bg-emerald-950/40 px-2 py-0.5">
                    {pillar.metric}
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold uppercase text-white">
                  {pillar.title}
                </h2>
                <p className="text-xs leading-relaxed text-zinc-400">{pillar.desc}</p>
              </article>
            );
          })}
        </section>

        {/* FORMULARIO DE ENVÍO DE DEMOS / PRENSA Y DIRECTORIO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Formulario */}
          <div className="lg:col-span-7 border border-zinc-800 bg-[#0E0E12] p-6 sm:p-8 space-y-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#DC2626] block">
                MESA DE REDACCIÓN &amp; BOOKING
              </span>
              <h2 className="font-display text-2xl font-black uppercase text-white mt-1">
                Envía tu Presskit (EPK), Demo o Solicitud
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Completa los datos para registrar tu solicitud con folio de seguimiento inmediato.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="border border-red-900 bg-red-950/40 px-4 py-3 font-mono text-xs text-red-300"
              >
                {errorMessage}
              </div>
            )}

            {successRecord && (
              <div
                role="status"
                className="border border-emerald-700/60 bg-emerald-950/30 p-4 font-mono text-xs text-emerald-300 space-y-1"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  SOLICITUD REGISTRADA · FOLIO {successRecord.id}
                </div>
                <p>
                  Gracias <strong>{successRecord.name}</strong> ({successRecord.bandOrCompany}). Nuestro equipo editorial revisará tu mensaje y responderá a <strong>{successRecord.email}</strong>.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-400">
                    Tu Nombre Completo *
                  </span>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Alex Necro"
                    className="w-full border border-zinc-800 bg-[#070709] px-3.5 py-2.5 text-white outline-none focus:border-[#DC2626]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-400">
                    Banda, Promotora o Medio
                  </span>
                  <input
                    type="text"
                    value={bandOrCompany}
                    onChange={(e) => setBandOrCompany(e.target.value)}
                    placeholder="Ej: Mictlán Records / Banda"
                    className="w-full border border-zinc-800 bg-[#070709] px-3.5 py-2.5 text-white outline-none focus:border-[#DC2626]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-400">
                    Correo Electrónico de Contacto *
                  </span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@tubanda.com"
                    className="w-full border border-zinc-800 bg-[#070709] px-3.5 py-2.5 text-white outline-none focus:border-[#DC2626]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-400">
                    Tipo de Solicitud *
                  </span>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value as InquiryType)}
                    className="w-full border border-zinc-800 bg-[#070709] px-3.5 py-2.5 text-white outline-none focus:border-[#DC2626]"
                  >
                    {Object.entries(inquiryLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-400">
                    Enlace a EPK, Bandcamp, Spotify o Drive (Opcional)
                  </span>
                  <input
                    type="url"
                    value={epkOrLink}
                    onChange={(e) => setEpkOrLink(e.target.value)}
                    placeholder="https://bandcamp.com/... o carpeta de prensa"
                    className="w-full border border-zinc-800 bg-[#070709] px-3.5 py-2.5 text-white outline-none focus:border-[#DC2626]"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-zinc-400">
                    Detalles de la Propuesta / Mensaje *
                  </span>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cuéntanos sobre tu lanzamiento, fecha del concierto, requerimiento de prensa o consulta..."
                    className="w-full border border-zinc-800 bg-[#070709] px-3.5 py-2.5 text-white outline-none focus:border-[#DC2626]"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#DC2626] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700 cursor-pointer"
              >
                <Send className="h-4 w-4" /> Enviar Solicitud a Cabina
              </button>
            </form>
          </div>

          {/* Columna Derecha: Directorio Oficial y Solicitudes Enviadas */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-zinc-800 bg-[#0E0E12] p-6 space-y-4 font-mono text-xs">
              <h3 className="font-display text-lg font-black uppercase text-white border-b border-zinc-800 pb-3">
                Directorio Oficial Time of Metal
              </h3>

              <div className="space-y-3 text-zinc-300">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase text-zinc-500">
                      PRENSA, RESEÑAS &amp; DEMOS
                    </span>
                    <span className="text-white font-bold">prensa@timeofmetal.fm</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Headphones className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase text-zinc-500">
                      CABINA DE RADIO &amp; PROGRAMACIÓN
                    </span>
                    <span className="text-white font-bold">cabina@timeofmetal.fm</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase text-zinc-500">
                      SEDE &amp; PICK-UP MERCH OFICIAL
                    </span>
                    <span className="text-white font-bold">
                      Cabina Central Time of Metal · Ciudad de México, CDMX
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase text-zinc-500">
                      TIEMPO DE RESPUESTA EDITORIAL
                    </span>
                    <span className="text-emerald-400 font-bold">
                      24 a 48 horas hábiles (Acreditaciones y Demos)
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-2 text-white font-bold uppercase text-[10px]">
                  <ShieldCheck className="h-4 w-4 text-[#DC2626]" /> Requisitos para Envío de Material
                </div>
                <p>
                  • Incluye biografía actualizada, fotografías promocionales en alta resolución y enlaces de escucha directa (WAV/FLAC o Bandcamp).
                </p>
                <p>
                  • Para coberturas de conciertos y festivales, envía el comunicado con al menos 7 días de anticipación.
                </p>
              </div>
            </div>

            {submissions.length > 0 && (
              <div className="border border-zinc-800 bg-[#0E0E12] p-6 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <span className="flex items-center gap-2 font-bold uppercase text-white text-[11px]">
                    <Users className="h-4 w-4 text-[#DC2626]" />
                    Mis Solicitudes Enviadas ({submissions.length})
                  </span>
                </div>
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {submissions.map((item) => (
                    <div
                      key={item.id}
                      className="border border-zinc-800 bg-[#070709] p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{item.id}</span>
                        <span className="text-[10px] text-emerald-400">EN REVISIÓN</span>
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        {item.bandOrCompany} · <span className="text-zinc-500">{item.createdAt}</span>
                      </p>
                      <p className="text-[10px] text-zinc-400 line-clamp-2">{item.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactSection;

