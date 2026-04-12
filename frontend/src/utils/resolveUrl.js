/**
 * Resolves a backend URL path to an absolute URL.
 * If the URL is already absolute (http://, https://, blob:), it returns it as-is.
 * Otherwise, it prefixes it with the backend URL.
 * 
 * @param {string} path - The image or media path.
 * @returns {string} The fully resolved URL.
 */
export function resolveUrl(path) {
  if (!path) return path;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
}
