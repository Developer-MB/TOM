import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, List, MapPin, Search, Table2 } from 'lucide-react';
import {
  formatTourMonth,
  getTourTimestamp,
  INITIAL_CMS_TOURS,
  type HomeTour,
} from '../../data/HomeTours';
import { readJsonResponseOrFallback } from '../../data/readJsonResponse';

type ToursView = 'table' | 'calendar';
type ToursSort = 'date-asc' | 'date-desc' | 'band-asc' | 'band-desc';
const pageSize = 15;
const weekdayHeaders = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export const Tours: React.FC = () => {
  const [tours, setTours] = useState<HomeTour[]>(() =>
    INITIAL_CMS_TOURS.filter((tour) => tour.status === 'PUBLICADO'),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<ToursSort>('date-asc');
  const [view, setView] = useState<ToursView>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadTours = async () => {
      try {
        const response = await fetch('/api/home/tours', { signal: controller.signal });
        const result = await readJsonResponseOrFallback<HomeTour[]>(
          response,
          'No se pudieron cargar las giras publicadas.',
          INITIAL_CMS_TOURS.filter((tour) => tour.status === 'PUBLICADO'),
        );
        if (!Array.isArray(result)) throw new Error('El servidor devolvió una lista de giras no válida.');
        setTours(result);
        setLoadError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar las giras publicadas.');
      }
    };

    void loadTours();
    return () => controller.abort();
  }, []);

  const filteredTours = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const filtered = tours.filter((tour) =>
      !query || [
        tour.code,
        tour.band,
        tour.tourName,
        tour.venue,
        tour.info,
        tour.ticketsInfo,
      ].join(' ').toLocaleLowerCase().includes(query)
    );

    return filtered.sort((first, second) => {
      if (sortOrder === 'band-asc' || sortOrder === 'band-desc') {
        const result = first.band.localeCompare(second.band, 'es', { sensitivity: 'base' });
        return sortOrder === 'band-asc' ? result : -result;
      }
      const result = getTourTimestamp(first) - getTourTimestamp(second);
      return sortOrder === 'date-asc' ? result : -result;
    });
  }, [searchQuery, sortOrder, tours]);

  const pageCount = Math.max(1, Math.ceil(filteredTours.length / pageSize));
  const pageTours = filteredTours.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const firstWeekday = (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const toursByDay = new Map<number, HomeTour[]>();
  for (const tour of pageTours) {
    if (Number(tour.year) !== calendarYear || Number(tour.month) !== calendarMonth + 1) continue;
    const day = Number(tour.day);
    const dayTours = toursByDay.get(day) ?? [];
    dayTours.push(tour);
    toursByDay.set(day, dayTours);
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageCount]);

  const changeCalendarMonth = (amount: number) => {
    setCalendarDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const pagination = (
    <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-mono text-[10px] text-zinc-400">
        {filteredTours.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
        {'–'}{Math.min(currentPage * pageSize, filteredTours.length)} DE {filteredTours.length} GIRAS
      </span>
      <div className="flex items-center justify-between gap-3 font-mono text-[10px] text-zinc-400 sm:justify-end">
        <button
          type="button"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className="border border-zinc-700 p-2 text-zinc-300 hover:border-[#DC2626] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span>PÁGINA {currentPage} DE {pageCount}</span>
        <button
          type="button"
          onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
          disabled={currentPage >= pageCount}
          aria-label="Página siguiente"
          className="border border-zinc-700 p-2 text-zinc-300 hover:border-[#DC2626] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <section className="min-h-screen bg-black py-8 text-[#F4F4F6]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 space-y-6">
        <header className="border-b border-zinc-800 pb-5">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white">
            PRÓXIMOS EVENTOS &amp; GIRAS
          </h1>
          <p className="mt-2 font-mono text-xs text-zinc-400">
            FECHAS, RECINTOS E INFORMACIÓN DE BOLETOS
          </p>
        </header>

        {loadError && (
          <p role="alert" className="border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {loadError} Se muestran las giras incluidas en el sitio.
          </p>
        )}

        <div className="flex flex-col gap-4 border border-zinc-800 bg-[#0E0E12] p-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="block flex-1">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              BUSCAR GIRAS
            </span>
            <span className="relative block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Banda, gira, venue o boletos..."
                className="w-full border border-zinc-800 bg-[#070709] py-2.5 pl-10 pr-4 font-mono text-xs text-white outline-none focus:border-[#DC2626]"
              />
            </span>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex">
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                ORDENAR POR
              </span>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as ToursSort)}
                className="w-full border border-zinc-800 bg-[#070709] px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-[#DC2626]"
              >
                <option value="date-asc">Fecha: próximas primero</option>
                <option value="date-desc">Fecha: lejanas primero</option>
                <option value="band-asc">Banda: A–Z</option>
                <option value="band-desc">Banda: Z–A</option>
              </select>
            </label>
            <div>
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                VISTA
              </span>
              <div className="flex h-[38px] border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setView('table')}
                  aria-pressed={view === 'table'}
                  className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 px-3 font-mono text-[10px] uppercase cursor-pointer ${
                    view === 'table' ? 'bg-[#DC2626] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Table2 className="h-3.5 w-3.5" /> Tabla
                </button>
                <button
                  type="button"
                  onClick={() => setView('calendar')}
                  aria-pressed={view === 'calendar'}
                  className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 border-l border-zinc-800 px-3 font-mono text-[10px] uppercase cursor-pointer ${
                    view === 'calendar' ? 'bg-[#DC2626] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" /> Calendario
                </button>
              </div>
            </div>
          </div>
        </div>

        {view === 'table' ? (
          <div className="space-y-4 border border-zinc-800 bg-[#0E0E12] p-4 sm:p-6">
            <div className="space-y-3">
              {pageTours.map((tour) => (
                <article
                  key={tour.id}
                  className="flex flex-col gap-4 rounded-sm border border-zinc-800 bg-[#121214] p-4 transition-colors hover:border-zinc-600 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start sm:items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-sm border border-zinc-800 bg-[#18181b] font-mono">
                      <span className="text-[9px] font-bold uppercase text-red-500">
                        {formatTourMonth(tour.month)}
                      </span>
                      <span className="my-0.5 text-lg font-extrabold leading-none text-white">
                        {tour.day}
                      </span>
                      <span className="text-[9px] text-zinc-500">{tour.year}</span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-base font-bold text-white sm:text-lg">
                          {tour.band}
                        </h2>
                        <span className="rounded-sm border border-zinc-700 bg-[#18181b] px-2 py-0.5 font-mono text-[10px] text-red-400">
                          {tour.tourName}
                        </span>
                      </div>
                      <p className="flex flex-wrap items-center gap-x-1.5 font-mono text-xs text-zinc-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                        <span className="break-words">{tour.venue}</span>
                        {tour.info && <><span>•</span><span className="break-words">{tour.info}</span></>}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`self-start shrink-0 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase sm:ml-4 sm:self-center ${
                      tour.ticketsLow
                        ? 'border-red-900 bg-red-950/30 text-red-400'
                        : 'border-zinc-800 bg-[#18181b] text-zinc-400'
                    }`}
                  >
                    {tour.ticketsInfo || 'INFORMACIÓN PRÓXIMAMENTE'}
                  </span>
                </article>
              ))}
              {pageTours.length === 0 && (
                <p className="py-10 text-center text-sm text-zinc-500">
                  No hay giras que coincidan con la búsqueda.
                </p>
              )}
            </div>
            {pagination}
          </div>
        ) : (
          <div className="space-y-4 border border-zinc-800 bg-[#0E0E12] p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => changeCalendarMonth(-1)}
                aria-label="Mes anterior"
                className="border border-zinc-700 p-2 text-zinc-300 hover:border-[#DC2626] cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="font-display text-lg sm:text-xl font-bold uppercase text-white text-center">
                {calendarDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                type="button"
                onClick={() => changeCalendarMonth(1)}
                aria-label="Mes siguiente"
                className="border border-zinc-700 p-2 text-zinc-300 hover:border-[#DC2626] cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[640px] grid grid-cols-7 border-l border-t border-zinc-800">
                {weekdayHeaders.map((weekday) => (
                  <div key={weekday} className="border-b border-r border-zinc-800 bg-[#070709] py-2 text-center font-mono text-[9px] text-zinc-500">
                    {weekday}
                  </div>
                ))}
                {Array.from({ length: firstWeekday }, (_, index) => (
                  <div key={`empty-${index}`} className="min-h-24 border-b border-r border-zinc-800 bg-[#09090b] sm:min-h-32" />
                ))}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const dayTours = toursByDay.get(day) ?? [];
                  return (
                    <div key={day} className="min-h-24 border-b border-r border-zinc-800 p-1.5 sm:min-h-32 sm:p-2">
                      <span className="font-mono text-[10px] text-zinc-500">{day}</span>
                      <div className="mt-1 space-y-1">
                        {dayTours.map((tour) => (
                          <article key={tour.id} className="border border-red-900/70 bg-red-950/30 p-1.5">
                            <h3 className="line-clamp-2 font-sans text-[10px] font-bold text-white">{tour.band}</h3>
                            <p className="mt-0.5 line-clamp-2 font-mono text-[9px] text-zinc-400">{tour.venue}</p>
                            {tour.ticketsLow && (
                              <span className="mt-1 inline-block font-mono text-[8px] uppercase text-red-300">
                                Pocas ventas
                              </span>
                            )}
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {pagination}
            <p className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
              <List className="h-3.5 w-3.5 shrink-0" />
              El calendario muestra las giras de la página actual; usa el paginador para ver más.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
