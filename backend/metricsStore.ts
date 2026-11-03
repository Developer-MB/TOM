const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const runMetricsRedisCommand = async (command: string[]): Promise<unknown> => {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) {
    throw new Error('Configura UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN en Vercel.');
  }

  const response = await fetch(redisUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) {
    throw new Error(`El almacén de métricas respondió HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || typeof payload.error === 'string') {
    throw new Error('El almacén de métricas devolvió una respuesta no válida.');
  }
  return payload.result;
};

export const readMetricsCounter = async (key: string): Promise<number> => {
  const result = await runMetricsRedisCommand(['GET', key]);
  if (result === null) return 0;
  const count = typeof result === 'number'
    ? result
    : typeof result === 'string' && /^\d+$/.test(result)
      ? Number(result)
      : Number.NaN;
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error('El almacén de métricas devolvió un contador no válido.');
  }
  return count;
};
