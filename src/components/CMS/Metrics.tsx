import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { readJsonResponse } from '../../data/readJsonResponse';

interface CmsMetrics {
    monthlyVisits: number;
    radioEntries: number;
    publishedPosts: number;
    photoCount: number;
    comparisonPercent: number | null;
}

const isCmsMetrics = (value: unknown): value is CmsMetrics =>
    typeof value === 'object' &&
    value !== null &&
    'monthlyVisits' in value &&
    typeof value.monthlyVisits === 'number' &&
    'radioEntries' in value &&
    typeof value.radioEntries === 'number' &&
    'publishedPosts' in value &&
    typeof value.publishedPosts === 'number' &&
    'photoCount' in value &&
    typeof value.photoCount === 'number' &&
    'comparisonPercent' in value &&
    (typeof value.comparisonPercent === 'number' || value.comparisonPercent === null);

const formatNumber = (value: number) => new Intl.NumberFormat('es-MX').format(value);

const Metrics = () => {
    const [metrics, setMetrics] = useState<CmsMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const loadMetrics = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/cms/metrics', {
                    signal: controller.signal,
                    cache: 'no-store',
                });
                const contentType = response.headers.get('content-type') ?? '';
                if (!/application\/(?:[\w.+-]+\+)?json\b/i.test(contentType)) {
                    throw new Error('La API de métricas no está disponible. Verifica que el backend esté conectado.');
                }
                let result: unknown;
                try {
                    result = await readJsonResponse<unknown>(
                        response,
                        'No se pudieron cargar las métricas.',
                    );
                } catch (loadError) {
                    if (
                        loadError instanceof Error &&
                        loadError.message === 'El servidor devolvió una respuesta JSON no válida.'
                    ) {
                        throw new Error('La API de métricas devolvió datos no válidos.');
                    }
                    throw loadError;
                }
                if (!isCmsMetrics(result)) {
                    throw new Error('El servidor devolvió métricas no válidas.');
                }
                setMetrics(result);
                setError(null);
            } catch (loadError) {
                if (controller.signal.aborted) return;
                setError(loadError instanceof Error
                    ? loadError.message
                    : 'No se pudieron cargar las métricas.');
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        void loadMetrics();
        return () => controller.abort();
    }, [refreshKey]);

    const comparison = metrics?.comparisonPercent;
    const comparisonLabel = comparison === null || comparison === undefined
        ? 'SIN BASE DEL MES ANTERIOR'
        : `${comparison > 0 ? '+' : ''}${new Intl.NumberFormat('es-MX', {
            maximumFractionDigits: 1,
        }).format(comparison)}% VS MES ANTERIOR`;
    const comparisonColor = comparison === null || comparison === undefined
        ? 'text-zinc-400'
        : comparison > 0
            ? 'text-emerald-400'
            : comparison < 0
                ? 'text-red-400'
                : 'text-zinc-400';

    const cards = [
        {
            label: 'LECTORES MENSUALES',
            value: metrics ? formatNumber(metrics.monthlyVisits) : '—',
            detail: `VISITAS AL PORTAL ESTE MES · ${comparisonLabel}`,
            detailClassName: comparisonColor,
            valueClassName: 'text-white',
        },
        {
            label: 'PUBLICACIONES TOTALES',
            value: metrics ? formatNumber(metrics.publishedPosts) : '—',
            detail: 'PUBLICADAS EN TODAS LAS SECCIONES',
            detailClassName: 'text-zinc-400',
            valueClassName: 'text-white',
        },
        {
            label: 'ENTRADAS A RADIO',
            value: metrics ? formatNumber(metrics.radioEntries) : '—',
            detail: 'ACCESOS ESTE MES · NO SON OYENTES SIMULTÁNEOS',
            detailClassName: 'text-zinc-300',
            valueClassName: 'text-[#DC2626]',
        },
        {
            label: 'ARCHIVO FOTOGRÁFICO',
            value: metrics ? formatNumber(metrics.photoCount) : '—',
            detail: 'FOTOS EN GALERÍAS PUBLICADAS',
            detailClassName: 'text-amber-400',
            valueClassName: 'text-white',
        },
    ];

    return (
        <section aria-label="Métricas del portal" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                {import.meta.env.DEV && error ? (
                    <p role="alert" className="font-mono text-[10px] text-red-400">
                        {error}
                    </p>
                ) : <span />}
                <button
                    type="button"
                    onClick={() => setRefreshKey((key) => key + 1)}
                    disabled={isLoading}
                    className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-colors hover:text-white disabled:cursor-wait disabled:opacity-50"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualizar métricas
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.label} className="border border-zinc-800 bg-[#0E0E12] p-5">
                        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                            {card.label}
                        </div>
                        <div className={`font-display text-2xl font-black ${card.valueClassName}`}>
                            {isLoading && !metrics ? '…' : card.value}
                        </div>
                        <div className={`mt-1 font-mono text-[10px] ${card.detailClassName}`}>
                            {metrics ? card.detail : isLoading ? card.detail : 'DATOS NO DISPONIBLES'}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Metrics;
