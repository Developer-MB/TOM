import type { IncomingMessage, ServerResponse } from 'node:http';
import os from 'node:os';
import { AUDIO_ASSETS } from '../../src/data/Radio';
import type { CmsNodeStatus } from '../../src/data/CmsTypes';

export default function handler(request: IncomingMessage, response: ServerResponse) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.statusCode = 405;
    response.end(JSON.stringify({ error: 'Método no permitido.' }));
    return;
  }

  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const ticks of Object.values(cpu.times)) total += ticks;
    idle += cpu.times.idle;
  }
  const cpuUsagePercent = total > 0 ? Math.round(((total - idle) / total) * 1000) / 10 : 0;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = Math.max(0, totalMem - freeMem);

  const payload: CmsNodeStatus = {
    serverName: os.hostname().toUpperCase(),
    platform: `${os.platform().toUpperCase()}-${os.arch().toUpperCase()}`,
    processUptimeSeconds: Math.floor(process.uptime()),
    systemUptimeSeconds: Math.floor(os.uptime()),
    cpuUsagePercent,
    cpuCores: cpus.length,
    memoryUsedMb: Math.round(usedMem / (1024 * 1024)),
    memoryTotalMb: Math.round(totalMem / (1024 * 1024)),
    memoryPercent: totalMem > 0 ? Math.round((usedMem / totalMem) * 1000) / 10 : 0,
    rssMb: Math.round((process.memoryUsage().rss / (1024 * 1024)) * 10) / 10,
    activeRequests: 1,
    totalRequests: 1,
    bytesTransferred: 0,
    throughputBps: 0,
    audioTracksCount: AUDIO_ASSETS.length,
    timestamp: new Date().toISOString(),
  };

  response.statusCode = 200;
  response.end(JSON.stringify(payload));
}

