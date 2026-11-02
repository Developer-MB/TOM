import React from 'react';
import { Eye, Search, Trash2 } from 'lucide-react';
import type { SectionId } from '../../data/mockData';
import type { CmsPostItem } from '../../data/Cms';

interface FilterRegisterProps {
    items: CmsPostItem[];
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onSelectSection: (section: SectionId) => void;
    onDeleteItem: (id: string) => void;
}

const FilterRegister: React.FC<FilterRegisterProps> = ({
    items,
    searchQuery,
    onSearchQueryChange,
    onSelectSection,
    onDeleteItem,
}) => (
    <div>
        <div className="relative mb-4">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
                type="text"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Filtrar por código TOM, título o autor..."
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
                        <th className="py-3 px-4">TIPO</th>
                        <th className="py-3 px-4">AUTOR</th>
                        <th className="py-3 px-4">ESTADO</th>
                        <th className="py-3 px-4 text-right">ACCIONES</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 font-mono text-xs">
                    {items.length > 0 ? items.map((item) => (
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
                                    className={`text-[10px] font-bold px-2.5 py-1 uppercase ${item.status === 'PUBLICADO'
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
                                        aria-label={`Ver ${item.title} en el portal`}
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteItem(item.id)}
                                        className="p-1.5 text-zinc-400 hover:text-[#DC2626] border border-zinc-800 hover:border-[#DC2626] cursor-pointer"
                                        title="Eliminar entrada"
                                        aria-label={`Eliminar ${item.title}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
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
    </div>
);

export default FilterRegister;
