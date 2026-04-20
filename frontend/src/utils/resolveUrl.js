/**
 * Resolves a backend URL path to an absolute URL.
 * If the URL is already absolute (http://, https://, blob:), it returns it as-is.
 * Otherwise, it prefixes it with the backend URL.
 * 
 * @param {string} path - The image or media path.
 * @returns {string} The fully resolved URL.
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const BACKEND_ORIGIN = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

export function resolveUrl(path) {
  if (!path) return path;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return `${BACKEND_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}
