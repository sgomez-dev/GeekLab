// Helper to build complete image URLs for product images.
// Accepts:
// - absolute URLs (http(s)://...) -> returned unchanged
// - paths starting with /uploads or uploads or /somepath -> normalized to BACKEND_URL + path (ensuring leading slash)
// - plain filenames (e.g. '1762645...png') -> normalized to BACKEND_URL + '/uploads/' + filename

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://geeklab-back.sgomez.dev';

export function buildImageUrl(image) {
  if (!image) return '/placeholder.png';
  // already an absolute URL
  if (/^https?:\/\//i.test(image)) return image;

  // if image looks like a data URL, return as-is
  if (/^data:/i.test(image)) return image;

  // strip whitespace
  const trimmed = String(image).trim();
  if (!trimmed) return '/placeholder.png';

  // if it already starts with /uploads or uploads, ensure leading slash then join
  if (/^\/?uploads\//i.test(trimmed)) {
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${BACKEND_URL}${path}`;
  }

  // if it starts with a slash but not /uploads, keep it (could be other static dir)
  if (trimmed.startsWith('/')) return `${BACKEND_URL}${trimmed}`;

  // otherwise treat as filename and prefix with /uploads/
  return `${BACKEND_URL}/uploads/${trimmed}`;
}

export default buildImageUrl;
