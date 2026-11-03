const getErrorMessage = (body: unknown): string | undefined => {
  if (typeof body !== 'object' || body === null || !('error' in body)) return undefined;
  return typeof body.error === 'string' ? body.error : undefined;
};

export const readJsonResponse = async <T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> => {
  const text = await response.text();
  let body: unknown;

  if (text.trim()) {
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

export const readJsonResponseOrFallback = <T>(
  response: Response,
  fallbackMessage: string,
  fallbackValue: T,
): Promise<T> => {
  if (response.status === 404) return Promise.resolve(fallbackValue);
  return readJsonResponse<T>(response, fallbackMessage);
};
