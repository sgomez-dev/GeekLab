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

const BACKEND_URL = getBackendUrl();

export function buildImageUrl(image) {
  if (!image) return '/1762645164725-43831552-sgt.png';
  
  if (/^https?:\/\//i.test(image)) return image;
  if (/^data:/i.test(image)) return image;

  const trimmed = String(image).trim();
  if (!trimmed) return '/1762645164725-43831552-sgt.png';

  if (trimmed.startsWith('/uploads/')) {
    return `${BACKEND_URL}${trimmed}`;
  }

  if (trimmed.startsWith('uploads/')) {
    return `${BACKEND_URL}/${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    return `${BACKEND_URL}${trimmed}`;
  }

  return `${BACKEND_URL}/uploads/${trimmed}`;
}

export default buildImageUrl;
