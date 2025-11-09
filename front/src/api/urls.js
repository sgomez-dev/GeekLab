const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'geeklab.sgomez.dev') {
      return 'https://geeklab-back.sgomez.dev';
    }
    if (hostname === '15.15.15.7') {
      return 'http://15.15.15.7:32131';
    }
  }
  return 'http://15.15.15.7:32131';
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
