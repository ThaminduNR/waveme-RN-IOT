import axios from 'axios';
import { API_BASE_URL } from '@env';
import { getToken, removeToken } from './tokenStorage';

const baseURL = API_BASE_URL ?? 'http://localhost:5000';

/** Auth routes must not send a stale Bearer token (e.g. before login replaces it). */
const PUBLIC_AUTH_PREFIXES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/verify-reset-code',
  '/api/auth/reset-password',
];

function isPublicAuthPath(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  return PUBLIC_AUTH_PREFIXES.some((p) => url === p || url.startsWith(`${p}?`));
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  if (isPublicAuthPath(config.url)) {
    return config;
  }
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await removeToken();
    }
    return Promise.reject(error);
  },
);
