import axios from 'axios';

const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  const backendUrl = (envUrl ? String(envUrl) : 'http://localhost:4000').replace(/\/$/, '');
  return backendUrl;
};

const BACKEND_URL = getBackendUrl();

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

let currentToken: string | null = null;

/**
 * Actualiza el token JWT en memoria (sin persistir).
 * La UI lo llamará desde su estado global con runes.
 */
export function setAuthToken(token: string | null) {
  currentToken = token;

  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function getAuthToken() {
  return currentToken;
}

