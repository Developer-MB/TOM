import React, { useEffect, useState } from 'react';
import { Server } from 'lucide-react';
import type { CmsNodeStatus } from '../../data/Cms';
import type { AudioTrack } from '../../data/mockData';

interface NodoProps {
    currentTrack?: AudioTrack;
    isPlaying?: boolean;
    audioAnalyser?: AnalyserNode | null;
}

interface NetworkInformationLike {
    downlink?: number;
    effectiveType?: string;
    rtt?: number;
    addEventListener?: (type: string, listener: () => void) => void;
    removeEventListener?: (type: string, listener: () => void) => void;
}

const formatDuration = (totalSeconds: number): string => {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const days = Math.floor(safeSeconds / 86_400);
    const hours = Math.floor((safeSeconds % 86_400) / 3_600);
    const minutes = Math.floor((safeSeconds % 3_600) / 60);
    const seconds = safeSeconds % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    return days > 0 ? `${days}D ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
};

const formatBandwidth = (
    throughputBps: number,
    isPlaying: boolean,
    downlinkMbps: number | null,
): string => {
    const streamBps = isPlaying ? 1_411_200 : 0; // 1411.2 kbps FLAC stream
    const activeBps = throughputBps + streamBps;

    if (activeBps >= 1_000_000) {
        return `${(activeBps / 1_000_000).toFixed(2)} Mbps`;
    }
    if (activeBps >= 1_000) {
        return `${(activeBps / 1_000).toFixed(1)} Kbps`;
    }
    if (downlinkMbps !== null && downlinkMbps > 0) {
        return `${downlinkMbps.toFixed(1)} Mbps (LINK)`;
    }
    return `${activeBps} bps`;
};

const Nodo: React.FC<NodoProps> = ({
    currentTrack,
    isPlaying = false,
    audioAnalyser = null,
}) => {
    const [nodeStatus, setNodeStatus] = useState<CmsNodeStatus | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [pingMs, setPingMs] = useState<number | null>(null);
    const [elapsedTicks, setElapsedTicks] = useState<number>(0);
    const [checks, setChecks] = useState<{ ok: number; total: number }>({ ok: 0, total: 0 });
    const [dspLevel, setDspLevel] = useState<number>(0);
    const [downlinkMbps, setDownlinkMbps] = useState<number | null>(null);

    // Poll backend node telemetry every 3 seconds
    useEffect(() => {
        const controller = new AbortController();

        const fetchNodeStatus = async () => {
            const startedAt = performance.now();
            try {
                const response = await fetch('/api/cms/node-status', {
                    signal: controller.signal,
                    cache: 'no-store',
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = (await response.json()) as CmsNodeStatus;
                const latency = Math.max(1, Math.round(performance.now() - startedAt));

                setNodeStatus(data);
                setPingMs(latency);
                setIsOnline(true);
                setElapsedTicks(0);
                setChecks((prev) => ({ ok: prev.ok + 1, total: prev.total + 1 }));
            } catch {
                if (controller.signal.aborted) return;
                setIsOnline(false);
                setChecks((prev) => ({ ok: prev.ok, total: prev.total + 1 }));
            }
        };

        void fetchNodeStatus();
        const pollId = window.setInterval(() => {
            void fetchNodeStatus();
        }, 3_000);

        return () => {
            controller.abort();
            window.clearInterval(pollId);
        };
    }, []);

    // 1-second local ticker to keep uptime advancing smoothly between polls
    useEffect(() => {
        const tickId = window.setInterval(() => {
            setElapsedTicks((ticks) => ticks + 1);
        }, 1_000);
        return () => window.clearInterval(tickId);
    }, []);

    // Real-time DSP load calculation from Web Audio API AnalyserNode
    useEffect(() => {
        if (!audioAnalyser || !isPlaying) {
            setDspLevel(0);
            return;
        }

        const buffer = new Uint8Array(audioAnalyser.frequencyBinCount);
        const intervalId = window.setInterval(() => {
            audioAnalyser.getByteFrequencyData(buffer);
            const sum = buffer.reduce((acc, val) => acc + val, 0);
            const avg = buffer.length > 0 ? sum / buffer.length : 0;
            const normalized = Math.round((avg / 255) * 1000) / 10;
            setDspLevel(normalized);
        }, 500);

        return () => window.clearInterval(intervalId);
    }, [audioAnalyser, isPlaying]);

    // Browser Network Information API listener
    useEffect(() => {
        const nav = navigator as Navigator & { connection?: NetworkInformationLike };
        const connection = nav.connection;
        if (!connection) return;

        const updateConnection = () => {
            setDownlinkMbps(typeof connection.downlink === 'number' ? connection.downlink : null);
        };

        updateConnection();
        connection.addEventListener?.('change', updateConnection);
        return () => connection.removeEventListener?.('change', updateConnection);
    }, []);

    const sampleRateHz = audioAnalyser?.context.sampleRate ?? 48_000;
    const sampleRateKhz = Math.round((sampleRateHz / 1000) * 10) / 10;

    const uptimeSeconds = (nodeStatus?.processUptimeSeconds ?? 0) + elapsedTicks;
    const availabilityPercent =
        checks.total > 0 ? ((checks.ok / checks.total) * 100).toFixed(2) : '100.00';

    const cpuPercent = nodeStatus
        ? Math.min(100, Math.round((nodeStatus.cpuUsagePercent + dspLevel * 0.15) * 10) / 10)
        : dspLevel;

    const masterServerLabel = nodeStatus
        ? `${nodeStatus.serverName} (${nodeStatus.cpuCores} CORES)`
        : typeof window !== 'undefined'
            ? window.location.hostname.toUpperCase()
            : 'LOCAL-NODE';

    const bandwidthLabel = formatBandwidth(
        nodeStatus?.throughputBps ?? 0,
        isPlaying,
        downlinkMbps,
    );

    return (
        <div className="border border-zinc-800 bg-[#0E0E12] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#DC2626]" /> NODO ICECAST FLAC
                </span>
                <div className="flex items-center gap-2">
                    {pingMs !== null && (
                        <span className="font-mono text-[10px] text-zinc-400">
                            {pingMs}ms
                        </span>
                    )}
                    <span
                        title={isOnline ? 'Nodo en línea' : 'Sin conexión con el servidor'}
                        className={`w-2 h-2 rounded-full ${
                            isOnline
                                ? 'bg-emerald-500 animate-ping'
                                : 'bg-red-500'
                        }`}
                    />
                </div>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between gap-2">
                    <span className="text-zinc-500 shrink-0">SERVIDOR MASTER:</span>
                    <span className="text-zinc-200 truncate text-right" title={masterServerLabel}>
                        {masterServerLabel}
                    </span>
                </div>
                <div className="flex justify-between gap-2">
                    <span className="text-zinc-500 shrink-0">UPTIME STREAM:</span>
                    <span className="text-emerald-400 font-bold text-right">
                        {availabilityPercent}% ({formatDuration(uptimeSeconds)})
                    </span>
                </div>
                <div className="flex justify-between gap-2">
                    <span className="text-zinc-500 shrink-0">CARGA CPU / DSP:</span>
                    <span className="text-zinc-200 text-right">
                        {cpuPercent.toFixed(1)}% @ {sampleRateKhz}kHz
                    </span>
                </div>
                {nodeStatus && (
                    <div className="flex justify-between gap-2">
                        <span className="text-zinc-500 shrink-0">MEMORIA NODO:</span>
                        <span className="text-zinc-200 text-right">
                            {nodeStatus.rssMb} MB ({nodeStatus.memoryPercent}%)
                        </span>
                    </div>
                )}
                <div className="flex justify-between gap-2">
                    <span className="text-zinc-500 shrink-0">ANCHO DE BANDA:</span>
                    <span className="text-[#DC2626] font-bold text-right">
                        {bandwidthLabel}
                    </span>
                </div>
                <div className="flex justify-between gap-2 pt-2 border-t border-zinc-800/80">
                    <span className="text-zinc-500 shrink-0">CABINA:</span>
                    <span
                        className={`truncate text-right font-bold ${
                            isPlaying ? 'text-emerald-400' : 'text-zinc-400'
                        }`}
                        title={
                            currentTrack
                                ? `${currentTrack.artist} — ${currentTrack.title}`
                                : undefined
                        }
                    >
                        {isPlaying && currentTrack
                            ? `ON AIR · ${currentTrack.artist}`
                            : `STANDBY (${nodeStatus?.audioTracksCount ?? 21} PISTAS)`}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Nodo;
