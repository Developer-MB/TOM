import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardEdit, Eye, Search, Trash2 } from 'lucide-react';
import type { SectionId } from '../../data/mockData';
import type { CmsGalleryItem, CmsPostItem, CmsTourItem, CmsVideoItem } from '../../data/Cms';

interface FilterRegisterProps {
    items: CmsPostItem[];
    galleries: CmsGalleryItem[];
    videos: CmsVideoItem[];
    tours: CmsTourItem[];
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onSelectSection: (section: SectionId) => void;
    onDeleteItem: (id: string, type: 'post' | 'video' | 'tour') => void;
    onContinueGallery: (id: string) => void;
    onContinueVideo: (id: string) => void;
    onContinueTour: (id: string) => void;
}

const FilterRegister: React.FC<FilterRegisterProps> = ({
    items,
    galleries,
    videos,
    tours,
    searchQuery,
    onSearchQueryChange,
    onSelectSection: _onSelectSection,
    onDeleteItem,
    onContinueGallery,
    onContinueVideo,
    onContinueTour,
}) => {
    const [typeFilter, setTypeFilter] = useState('TODOS');
    const [authorFilter, setAuthorFilter] = useState('TODOS');
    const [statusFilter, setStatusFilter] = useState('TODOS');
    const [sortOrder, setSortOrder] = useState<'title-asc' | 'title-desc' | 'date-asc' | 'date-desc'>('date-desc');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const entries = useMemo(() => [
        ...items.map((item) => ({
            id: item.id,
            code: item.code,
            title: `${item.band} — ${item.disc}`,
            details: `${item.genre} · ${item.year} · ${item.publish}`,
            type: item.type,
            author: item.author,
            status: item.status,
            date: item.publish,
            section: item.type === 'RECOMENDACION'
                ? 'resenas' as const
                : item.type === 'VIDEO'
                    ? 'videopodcast' as const
                    : item.type === 'GALERIA'
                        ? 'galeria' as const
                        : 'eventos' as const,
            isGallery: false,
            isVideo: false,
            isTour: false,
        })),
        ...videos.map((video) => ({
            id: video.id,
            code: video.code,
            title: video.title,
            details: `${video.publish || 'Sin publicar'} · ${video.url}`,
            type: 'VIDEO',
            author: 'VIDEOPODCAST',
            status: video.status,
            date: video.publish,
            section: 'videopodcast' as const,
            isGallery: false,
            isVideo: true,
            isTour: false,
        })),
        ...tours.map((tour) => ({
            id: tour.id,
            code: tour.code,
            title: `${tour.band} — ${tour.tourName}`,
            details: `${tour.day}/${tour.month}/${tour.year} · ${tour.venue} · ${tour.ticketsInfo}`,
            type: 'GIRAS',
            author: 'GIRAS',
            status: tour.status,
            date: tour.publish,
            section: 'eventos' as const,
            isGallery: false,
            isVideo: false,
            isTour: true,
        })),
        ...galleries.map((gallery, index) => ({
            id: gallery.id,
            code: gallery.code ?? `TOM-CON-${String(index + 1).padStart(4, '0')}`,
            title: `${gallery.concert} — ${gallery.title}`,
            details: `${gallery.venue} · ${gallery.city} · ${gallery.date} · ${gallery.img.length} fotos`,
            type: 'GALERIA',
            author: gallery.credit,
            status: gallery.status ?? 'PUBLICADO',
            date: gallery.publish || gallery.date,
            section: 'galeria' as const,
            isGallery: true,
            isVideo: false,
            isTour: false,
        })),
    ], [items, galleries, videos, tours]);

    const authors = useMemo(
        () => [...new Set(entries.map((entry) => entry.author).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })),
        [entries],
    );

    const filteredEntries = useMemo(() => {
        const filtered = entries.filter((entry) => {
            const query = searchQuery.trim().toLocaleLowerCase();
            return (typeFilter === 'TODOS' || entry.type === typeFilter) &&
                (authorFilter === 'TODOS' || entry.author === authorFilter) &&
                (statusFilter === 'TODOS' || entry.status === statusFilter) &&
                (!query || `${entry.code} ${entry.title} ${entry.details} ${entry.author}`
                    .toLocaleLowerCase().includes(query));
        });

        return filtered.sort((a, b) => {
            if (sortOrder === 'title-asc' || sortOrder === 'title-desc') {
                const result = a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
                return sortOrder === 'title-asc' ? result : -result;
            }

            const dateValue = (value: string) => {
                const parsed = Date.parse(value);
                if (Number.isFinite(parsed)) return parsed;
                const match = value.match(/^(\d{1,2})\s+([A-ZÁÉÍÓÚ]{3})\s+(\d{4})$/i);
                if (!match) return 0;
                const months: Record<string, number> = {
                    ENE: 0, FEB: 1, MAR: 2, ABR: 3, MAY: 4, JUN: 5,
                    JUL: 6, AGO: 7, SEP: 8, OCT: 9, NOV: 10, DIC: 11,
                };
                const month = months[match[2].toLocaleUpperCase()];
                return month === undefined
                    ? 0
                    : new Date(Number(match[3]), month, Number(match[1])).getTime();
            };
            const result = dateValue(a.date) - dateValue(b.date);
            return sortOrder === 'date-asc' ? result : -result;
        });
    }, [entries, searchQuery, typeFilter, authorFilter, statusFilter, sortOrder]);

    const pageCount = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
    const visibleEntries = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, authorFilter, statusFilter, sortOrder]);

    useEffect(() => {
        if (currentPage > pageCount) setCurrentPage(pageCount);
    }, [currentPage, pageCount]);

    const selectClassName =
        'mt-1 block w-full min-w-24 bg-[#070709] border border-zinc-700 px-2 py-1 text-[10px] font-mono text-zinc-300 outline-none focus:border-[#DC2626]';

    return (
    <div>
        <div className="relative mb-4">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
                type="text"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Filtrar por ID, título, concierto, URL o autor..."
                aria-label="Buscar publicaciones"
                className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] text-xs font-mono text-white pl-10 pr-4 py-2.5 outline-none"
            />
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-zinc-800 font-mono text-[10px] uppercase tracking-widest text-zinc-500 bg-[#070709]">
                        <th className="py-3 px-4">CÓDIGO</th>
                        <th className="py-3 px-4">TÍTULO / ENTRADA</th>
                        <th className="py-3 px-4">
                            TIPO
                            <select aria-label="Filtrar por tipo" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={selectClassName}>
                                <option value="TODOS">Todos</option>
                                {['RECOMENDACION', 'GALERIA', 'VIDEO', 'GIRAS'].map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </th>
                        <th className="py-3 px-4">
                            AUTOR
                            <select aria-label="Filtrar por autor" value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} className={selectClassName}>
                                <option value="TODOS">Todos</option>
                                {authors.map((author) => <option key={author} value={author}>{author}</option>)}
                            </select>
                        </th>
                        <th className="py-3 px-4">
                            ESTADO
                            <select aria-label="Filtrar por estado" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={selectClassName}>
                                <option value="TODOS">Todos</option>
                                {['PUBLICADO', 'PROGRAMADO', 'BORRADOR'].map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </th>
                        <th className="py-3 px-4 text-right">ACCIONES</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 font-mono text-xs">
                    {visibleEntries.length ? visibleEntries.map((entry, index) => (
                        <tr
                            key={entry.id}
                            className={`${index % 2 === 0 ? 'bg-[#0E0E12]' : 'bg-[#17171B]'} hover:bg-zinc-800/80 transition-colors`}
                        >
                            <td className="py-3.5 px-4 text-zinc-400 font-bold">{entry.code}</td>
                            <td className="py-3.5 px-4">
                                <div className="font-sans font-bold text-sm text-white">{entry.title}</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">{entry.details}</div>
                            </td>
                            <td className="py-3.5 px-4">
                                <span className="bg-[#070709] border border-zinc-800 text-zinc-300 text-[10px] px-2.5 py-1 uppercase">
                                    {entry.type}
                                </span>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-300">{entry.author}</td>
                            <td className="py-3.5 px-4">
                                <span
                                    className={`text-[10px] font-bold px-2.5 py-1 uppercase ${entry.status === 'PUBLICADO'
                                        ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-700/50'
                                        : entry.status === 'PROGRAMADO'
                                            ? 'bg-amber-950/70 text-amber-400 border border-amber-700/50'
                                            : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                                        }`}
                                >
                                    {entry.status}
                                </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                    <a
                                        href={`/?section=${entry.section}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 cursor-pointer"
                                        title="Ver en portal"
                                        aria-label={`Ver ${entry.title} en el portal`}
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </a>
                                    {!entry.isGallery && (
                                        <button
                                            onClick={() => onDeleteItem(
                                                entry.id,
                                                entry.isTour ? 'tour' : entry.isVideo ? 'video' : 'post',
                                            )}
                                            className="p-1.5 text-zinc-400 hover:text-[#DC2626] border border-zinc-800 hover:border-[#DC2626] cursor-pointer"
                                            title="Eliminar entrada"
                                            aria-label={`Eliminar ${entry.title}`}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {entry.isGallery && entry.status === 'BORRADOR' && (
                                        <button
                                            onClick={() => onContinueGallery(entry.id)}
                                            className="p-1.5 text-amber-400 hover:text-white border border-amber-900 hover:border-amber-500 cursor-pointer"
                                            title="Continuar publicación del borrador"
                                            aria-label={`Continuar publicación de ${entry.title}`}
                                        >
                                            <ClipboardEdit className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {entry.isVideo && entry.status === 'BORRADOR' && (
                                        <button
                                            onClick={() => onContinueVideo(entry.id)}
                                            className="p-1.5 text-amber-400 hover:text-white border border-amber-900 hover:border-amber-500 cursor-pointer"
                                            title="Continuar publicación del borrador"
                                            aria-label={`Continuar publicación de ${entry.title}`}
                                        >
                                            <ClipboardEdit className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {entry.isTour && (
                                        <button
                                            onClick={() => onContinueTour(entry.id)}
                                            className="p-1.5 text-amber-400 hover:text-white border border-amber-900 hover:border-amber-500 cursor-pointer"
                                            title={entry.status === 'BORRADOR' ? 'Continuar publicación del borrador' : 'Editar gira'}
                                            aria-label={`${entry.status === 'BORRADOR' ? 'Continuar publicación de' : 'Editar'} ${entry.title}`}
                                        >
                                            <ClipboardEdit className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-zinc-500">
                                No se encontraron publicaciones.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Ordenar por
                <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)}
                    className="bg-[#070709] border border-zinc-700 px-2 py-2 text-[10px] text-zinc-200 outline-none focus:border-[#DC2626]"
                >
                    <option value="date-desc">Fecha: más nuevo a más viejo</option>
                    <option value="date-asc">Fecha: más viejo a más nuevo</option>
                    <option value="title-asc">Alfabético: A–Z</option>
                    <option value="title-desc">Alfabético: Z–A</option>
                </select>
            </label>
            <div className="flex items-center justify-between gap-3 font-mono text-[10px] text-zinc-400 sm:justify-end">
                <span>
                    {filteredEntries.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                    {'–'}{Math.min(currentPage * pageSize, filteredEntries.length)} de {filteredEntries.length}
                </span>
                <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                    className="border border-zinc-700 p-2 text-zinc-300 hover:border-[#DC2626] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span>PÁGINA {currentPage} DE {pageCount}</span>
                <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                    disabled={currentPage >= pageCount}
                    aria-label="Página siguiente"
                    className="border border-zinc-700 p-2 text-zinc-300 hover:border-[#DC2626] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    </div>
    );
};

export default FilterRegister;
