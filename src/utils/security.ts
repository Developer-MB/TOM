/**
 * Utilidades de seguridad defensiva (AppSec) para sanitización de entradas,
 * prevención de XSS mediante esquemas URI peligrosos (javascript:, data:, vbscript:)
 * y validación de datos financieros.
 */

const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_TAG_STRIP_REGEX = /<\/?(?:script|iframe|object|embed|svg|math|style|link|meta)[^>]*>/gi;

/**
 * Limpia texto de entrada eliminando caracteres de control no imprimibles
 * y etiquetas HTML potencialmente ejecutables, respetando una longitud máxima.
 */
export const sanitizePlainText = (input: unknown, maxLength = 2000): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(CONTROL_CHARS_REGEX, '')
    .replace(HTML_TAG_STRIP_REGEX, '')
    .trim()
    .slice(0, maxLength);
};

/**
 * Valida y sanitiza una URL externa permitiendo exclusivamente los protocolos
 * seguros `https:` y `http:`. Bloquea `javascript:`, `data:`, `vbscript:` y `file:`.
 * Devuelve cadena vacía `""` si la URL no es segura o es inválida.
 */
export const sanitizeHttpUrl = (rawUrl: unknown): string => {
  if (typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
};

/**
 * Verifica que una fecha de vencimiento de tarjeta en formato MM/AA
 * corresponda al mes/año actual o futuro (y un rango razonable de hasta +25 años).
 */
export const isCardExpiryValid = (expiryMmYy: string): boolean => {
  const match = expiryMmYy.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const yearTwoDigits = Number(match[2]);
  const fullYear = 2000 + yearTwoDigits;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (fullYear < currentYear) return false;
  if (fullYear === currentYear && month < currentMonth) return false;
  if (fullYear > currentYear + 25) return false;

  return true;
};

