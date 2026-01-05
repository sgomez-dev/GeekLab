const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  // Default to localhost for development
  return 'http://localhost:4000';
};

let BACKEND_URL = getBackendUrl();
// Normalize trailing slash removal
BACKEND_URL = BACKEND_URL.replace(/\/$/, '');

export function buildImageUrl(image) {
  if (!image) return '/placeholder.png';

  let val = String(image).trim();
  if (!val) return '/placeholder.png';

  if (/^https?:\/\//i.test(val) || /^data:/i.test(val)) return val;

  val = val.replace(/^\/+/, '/');

  if (!val.startsWith('/uploads/') && !val.startsWith('/')) {
    val = '/uploads/' + val;
  }

  if (!val.startsWith('/')) val = '/' + val;

  const url = BACKEND_URL + val;
  return url.replace(/([^:]\/)\/+/, '$1/'); 
}

export default buildImageUrl;
