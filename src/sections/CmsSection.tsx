import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Disc,
  Mic,
  Camera,
  Radio,
  Users,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Eye,
  Upload,
  Activity,
  Server,
  AlertTriangle,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { ASSETS, SectionId } from '../data/mockData';

interface CmsSectionProps {
  onSelectSection: (section: SectionId) => void;
}

interface CmsPostItem {
  id: string;
  code: string;
  title: string;
  type: 'RESEÑA' | 'CRÓNICA' | 'PODCAST' | 'NOTICIA';
  category: string;
  author: string;
  date: string;
  score?: string;
  status: 'PUBLICADO' | 'PROGRAMADO' | 'BORRADOR';
}

const INITIAL_CMS_ITEMS: CmsPostItem[] = [
  {
    id: 'cms-1',
    code: 'TOM-894',
    title: 'Blood Incantation — Absolute Elsewhere: La Trascendencia Cósmica',
    type: 'RESEÑA',
    category: 'DEATH METAL PROGRESIVO',
    author: 'K. Lindgren',
    date: 'HOY, 14:20',
    score: '9.8 / 10',
    status: 'PUBLICADO',
  },
  {
    id: 'cms-2',
    code: 'TOM-893',
    title: 'Ep. #48: Arquitectura de la Disonancia (Feat. Luc Lemay & Erik Rutan)',
    type: 'PODCAST',
    category: '4K STUDIO MASTER',
    author: 'Alex Steiner',
    date: 'HOY, 11:05',
    status: 'PUBLICADO',
  },
  {
    id: 'cms-3',
    code: 'TOM-892',
    title: 'Watain en Estocolmo: Ceremonia de Sangre y Fuego Sagrado (40 Fotos RAW)',
    type: 'CRÓNICA',
    category: 'FOTOPERIODISMO PIT',
    author: 'Elena S.',
    date: 'MAÑANA, 09:00',
    status: 'PROGRAMADO',
  },
  {
    id: 'cms-4',
    code: 'TOM-891',
    title: 'Ulcerate — Cutting the Throat of God: El Laberinto del Caos',
    type: 'RESEÑA',
    category: 'DISSONANT DEATH METAL',
    author: 'M. Varg',
    date: 'BORRADOR',
    score: '9.6 / 10',
    status: 'BORRADOR',
  },
  {
    id: 'cms-5',
    code: 'TOM-890',
    title: 'Brutal Assault 2025: Confirmados Bloodbath, Gorgoroth y 22 bandas más',
    type: 'NOTICIA',
    category: 'FESTIVALES EUROPEOS',
    author: 'M. Varg',
    date: 'AYER, 19:45',
    status: 'PUBLICADO',
  },
];

export const CmsSection: React.FC<CmsSectionProps> = ({ onSelectSection }) => {
  const [activeNav, setActiveNav] = useState('PANEL CENTRAL');
  const [items, setItems] = useState<CmsPostItem[]>(INITIAL_CMS_ITEMS);
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Publisher Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'RESEÑA' | 'CRÓNICA' | 'PODCAST' | 'NOTICIA'>('RESEÑA');
  const [newCategory, setNewCategory] = useState('BLACK / DEATH METAL');
  const [newScore, setNewScore] = useState('9.2');
  const [newStatus, setNewStatus] = useState<'PUBLICADO' | 'BORRADOR'>('PUBLICADO');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [publishToast, setPublishToast] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'TODOS' || item.type === filterType;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: CmsPostItem = {
      id: `cms-${Date.now()}`,
      code: `TOM-${Math.floor(895 + items.length)}`,
      title: newTitle.trim(),
      type: newType,
      category: newCategory.toUpperCase(),
      author: 'Admin Redacción',
      date: 'AHORA MISMO',
      score: newType === 'RESEÑA' ? `${newScore} / 10` : undefined,
      status: newStatus,
    };

    setItems([created, ...items]);
    setNewTitle('');
    setNewExcerpt('');
    setPublishToast(`✓ ENTRADA [${created.code}] REGISTRADA EN EL BÚNKER EDITORIAL.`);
    setTimeout(() => setPublishToast(null), 4000);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
        {/* TOP ADMIN COMMAND BAR */}
        <div className="border border-zinc-800 bg-[#0E0E12] px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#DC2626] flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#DC2626]">
                  CONSOLA DE ADMINISTRACIÓN INTERNA // ACCESO NIVEL 01
                </span>
                <span className="bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 font-mono text-[9px] uppercase px-2 py-0.5">
                  NODO ACTIVO
                </span>
              </div>
              <h1 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
                TIME OF METAL — BÚNKER EDITORIAL CMS v4.2
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectSection('inicio')}
              className="bg-[#070709] hover:bg-zinc-900 border border-zinc-800 px-4 py-2 font-mono text-xs uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#DC2626]" /> VOLVER AL PORTAL PÚBLICO
            </button>
          </div>
        </div>

        {/* MAIN CMS WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR NAVIGATION (3 COLS) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="border border-zinc-800 bg-[#0E0E12] p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 px-3 pb-3 mb-2 border-b border-zinc-800">
                MÓDULOS DE CONTROL
              </div>
              <nav className="space-y-1">
                {[
                  { label: 'PANEL CENTRAL', icon: Activity, count: 'LIVE' },
                  { label: 'CRÓNICAS & NOTICIAS', icon: FileText, count: '142' },
                  { label: 'JUICIO CRÍTICO (RESEÑAS)', icon: Disc, count: '318' },
                  { label: 'VIDEOPODCAST 4K', icon: Mic, count: '48' },
                  { label: 'GALERÍAS RAW', icon: Camera, count: '6.4K' },
                  { label: 'CABINA RADIO 24/7', icon: Radio, count: 'ON AIR' },
                  { label: 'EQUIPO & REDACTORES', icon: Users, count: '12' },
                  { label: 'AJUSTES DEL SISTEMA', icon: Settings, count: '' },
                ].map((nav) => {
                  const Icon = nav.icon;
                  const active = activeNav === nav.label;
                  return (
                    <button
                      key={nav.label}
                      onClick={() => setActiveNav(nav.label)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#DC2626] text-white font-bold'
                          : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{nav.label}</span>
                      </span>
                      {nav.count && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 ${
                            active
                              ? 'bg-black/30 text-white'
                              : 'bg-[#070709] text-zinc-500 border border-zinc-800'
                          }`}
                        >
                          {nav.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Icecast / FLAC Server Status Card */}
            <div className="border border-zinc-800 bg-[#0E0E12] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#DC2626]" /> NODO ICECAST FLAC
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">SERVIDOR MASTER:</span>
                  <span className="text-zinc-200">ESTOCOLMO-01</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">UPTIME STREAM:</span>
                  <span className="text-emerald-400 font-bold">99.98% (412 DÍAS)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">CARGA CPU / DSP:</span>
                  <span className="text-zinc-200">18.4% @ 96kHz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">ANCHO DE BANDA:</span>
                  <span className="text-[#DC2626] font-bold">1.94 Gbps</span>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN WORKSPACE AREA (9 COLS) */}
          <div className="lg:col-span-9 space-y-6">
            {/* 4 KPI METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-zinc-800 bg-[#0E0E12] p-5">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                  LECTORES MENSUALES
                </div>
                <div className="font-display font-black text-3xl text-white">284.6K</div>
                <div className="font-mono text-[10px] text-emerald-400 mt-1">
                  +14.2% VS MES ANTERIOR
                </div>
              </div>

              <div className="border border-zinc-800 bg-[#0E0E12] p-5">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                  RESEÑAS PUBLICADAS
                </div>
                <div className="font-display font-black text-3xl text-white">318</div>
                <div className="font-mono text-[10px] text-zinc-400 mt-1">
                  PROMEDIO GLOBAL: 8.4 / 10
                </div>
              </div>

              <div className="border border-zinc-800 bg-[#0E0E12] p-5">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                  OYENTES PICO RADIO
                </div>
                <div className="font-display font-black text-3xl text-[#DC2626]">1,428</div>
                <div className="font-mono text-[10px] text-zinc-300 mt-1">
                  82% EN STREAM FLAC LOSSLESS
                </div>
              </div>

              <div className="border border-zinc-800 bg-[#0E0E12] p-5">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                  ARCHIVO FOTOGRÁFICO
                </div>
                <div className="font-display font-black text-3xl text-white">6,410</div>
                <div className="font-mono text-[10px] text-amber-400 mt-1">
                  148 FESTIVALES & GIRAS
                </div>
              </div>
            </div>

            {/* QUICK EDITORIAL PUBLISHER FORM */}
            <div className="border border-zinc-800 bg-[#0E0E12] p-6">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
                <div>
                  <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block">
                    // PUBLICADOR DIRECTO AL PORTAL
                  </span>
                  <h2 className="font-display font-black text-2xl uppercase text-white">
                    REDACTAR NUEVA ENTRADA EDITORIAL
                  </h2>
                </div>
                <Plus className="w-5 h-5 text-[#DC2626]" />
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                      TÍTULO DEL ARTÍCULO / DISCO / EPISODIO *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ej: Gorgoroth — Crónica y Fuego en Josefov..."
                      className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                      SECCIÓN DESTINO
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3 py-2.5 text-xs font-mono text-white outline-none"
                    >
                      <option value="RESEÑA">RESEÑA DE DISCO</option>
                      <option value="CRÓNICA">CRÓNICA / GALERÍA</option>
                      <option value="PODCAST">VIDEOPODCAST 4K</option>
                      <option value="NOTICIA">NOTICIA URGENTE</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                      SUBGÉNERO / ETIQUETA
                    </label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                      EXTRACTO / VEREDICTO EDITORIAL
                    </label>
                    <input
                      type="text"
                      value={newExcerpt}
                      onChange={(e) => setNewExcerpt(e.target.value)}
                      placeholder="Síntesis mordaz para la portada principal..."
                      className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                      CALIFICACIÓN
                    </label>
                    <input
                      type="text"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      disabled={newType !== 'RESEÑA'}
                      className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-[#DC2626] font-bold outline-none disabled:opacity-40"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                      ESTADO
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3 py-2.5 text-xs font-mono text-white outline-none"
                    >
                      <option value="PUBLICADO">PUBLICAR YA</option>
                      <option value="BORRADOR">BORRADOR</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="font-mono text-[11px] text-zinc-500">
                    {publishToast ? (
                      <span className="text-emerald-400 font-bold">{publishToast}</span>
                    ) : (
                      'Los cambios se sincronizan instantáneamente con el CDN global.'
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> PUBLICAR EN EL PORTAL
                  </button>
                </div>
              </form>
            </div>

            {/* EDITORIAL QUEUE TABLE */}
            <div className="border border-zinc-800 bg-[#0E0E12] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-zinc-800">
                <div>
                  <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block">
                    // REGISTRO DE PUBLICACIONES
                  </span>
                  <h2 className="font-display font-black text-2xl uppercase text-white">
                    COLA EDITORIAL ACTIVA ({filteredItems.length})
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {['TODOS', 'RESEÑA', 'PODCAST', 'CRÓNICA', 'NOTICIA'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors cursor-pointer ${
                        filterType === t
                          ? 'bg-[#DC2626] text-white border-[#DC2626] font-bold'
                          : 'bg-[#070709] text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search inside CMS */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar por código TOM, título o autor..."
                  className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] text-xs font-mono text-white pl-10 pr-4 py-2.5 outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 font-mono text-[10px] uppercase tracking-widest text-zinc-500 bg-[#070709]">
                      <th className="py-3 px-4">CÓDIGO</th>
                      <th className="py-3 px-4">TÍTULO / ENTRADA</th>
                      <th className="py-3 px-4">TIPO</th>
                      <th className="py-3 px-4">AUTOR</th>
                      <th className="py-3 px-4">ESTADO</th>
                      <th className="py-3 px-4 text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 font-mono text-xs">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3.5 px-4 text-zinc-400 font-bold">
                          {item.code}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-sans font-bold text-sm text-white">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            {item.category} {item.score ? `· NOTA: ${item.score}` : ''} · {item.date}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-[#070709] border border-zinc-800 text-zinc-300 text-[10px] px-2.5 py-1 uppercase">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300">{item.author}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 uppercase ${
                              item.status === 'PUBLICADO'
                                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-700/50'
                                : item.status === 'PROGRAMADO'
                                ? 'bg-amber-950/70 text-amber-400 border border-amber-700/50'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (item.type === 'RESEÑA') onSelectSection('resenas');
                                else if (item.type === 'PODCAST') onSelectSection('videopodcast');
                                else if (item.type === 'CRÓNICA') onSelectSection('galeria');
                                else onSelectSection('inicio');
                              }}
                              className="p-1.5 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 cursor-pointer"
                              title="Ver en portal"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-zinc-400 hover:text-[#DC2626] border border-zinc-800 hover:border-[#DC2626] cursor-pointer"
                              title="Eliminar entrada"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
