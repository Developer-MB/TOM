import { Router } from 'express';
import galleriesRouter from './galleries.js';
import merchRouter from './merch.js';
import postsRouter from './posts.js';
import toursRouter from './tours.js';
import videosRouter from './videos.js';
import { asyncRoute } from '../../utils/http.js';
import { getFirebaseFirestore } from '../../config/firebase.js';
import os from 'node:os';

const router = Router();

router.use('/posts', postsRouter);
router.use('/galleries', galleriesRouter);
router.use('/videos', videosRouter);
router.use('/tours', toursRouter);
router.use('/merch', merchRouter);

router.get('/node-status', asyncRoute(async (_request, response) => {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const ticks of Object.values(cpu.times)) total += ticks;
    idle += cpu.times.idle;
  }
  const totalMemory = os.totalmem();
  const usedMemory = Math.max(0, totalMemory - os.freemem());
  const audioTracksCount = await getFirebaseFirestore().collection('cms_posts').count().get();
  response.setHeader('Cache-Control', 'no-store');
  response.json({
    serverName: os.hostname().toUpperCase(),
    platform: `${os.platform().toUpperCase()}-${os.arch().toUpperCase()}`,
    processUptimeSeconds: Math.floor(process.uptime()),
    systemUptimeSeconds: Math.floor(os.uptime()),
    cpuUsagePercent: total ? Math.round(((total - idle) / total) * 1000) / 10 : 0,
    cpuCores: cpus.length,
    memoryUsedMb: Math.round(usedMemory / (1024 * 1024)),
    memoryTotalMb: Math.round(totalMemory / (1024 * 1024)),
    memoryPercent: totalMemory ? Math.round((usedMemory / totalMemory) * 1000) / 10 : 0,
    rssMb: Math.round((process.memoryUsage().rss / (1024 * 1024)) * 10) / 10,
    activeRequests: 1,
    totalRequests: 1,
    bytesTransferred: 0,
    throughputBps: 0,
    audioTracksCount: audioTracksCount.data().count,
    timestamp: new Date().toISOString(),
  });
}));

export default router;
