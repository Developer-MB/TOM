const getErrorMessage = (body: unknown): string | undefined => {
  if (typeof body !== 'object' || body === null || !('error' in body)) return undefined;
  return typeof body.error === 'string' ? body.error : undefined;
};

const isHtmlPayload = (response: Response, text: string): boolean => {
  const contentType = (response.headers.get('content-type') ?? '').toLowerCase();
  if (contentType.includes('text/html')) return true;
  const trimmed = text.trimStart().toLowerCase();
  return trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html');
};

export const readJsonResponse = async <T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> => {
  const text = await response.text();
  let body: unknown;

  if (text.trim()) {
    if (isHtmlPayload(response, text)) {
      throw new Error(`${fallbackMessage} (el servidor de archivos estáticos no soporta esta ruta API).`);
    }
    try {
      body = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new Error('El servidor devolvió una respuesta JSON no válida.');
      }
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(body) ?? `${fallbackMessage} (HTTP ${response.status}).`);
  }

  if (body === undefined) {
    throw new Error('El servidor devolvió una respuesta vacía.');
  }

  return body as T;
};

export const readJsonResponseOrFallback = async <T>(
  response: Response,
  fallbackMessage: string,
  fallbackValue: T,
): Promise<T> => {
  if (!response.ok) return fallbackValue;

  const contentType = (response.headers.get('content-type') ?? '').toLowerCase();
  if (contentType.includes('text/html')) {
    return fallbackValue;
  }

  try {
    return await readJsonResponse<T>(response, fallbackMessage);
  } catch {
    return fallbackValue;
  }
};
