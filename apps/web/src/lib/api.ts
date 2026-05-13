import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
  withCredentials: true,
  timeout: 15_000,
});

// ---- İstek: access token ekle ----
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ---- Cevap: 401 olursa refresh dene ----
let isRefreshing = false;
let waiters: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waiters.push((token) => {
          if (!token) return reject(error);
          original.headers.set('Authorization', `Bearer ${token}`);
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) throw error;

      const { data } = await axios.post(
        `${baseURL}/api/v1/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } },
      );
      const { accessToken, refreshToken: newRefresh } = data.data;
      useAuthStore.getState().setTokens(accessToken, newRefresh);
      waiters.forEach((cb) => cb(accessToken));
      waiters = [];
      original.headers.set('Authorization', `Bearer ${accessToken}`);
      return api(original);
    } catch (err) {
      waiters.forEach((cb) => cb(null));
      waiters = [];
      useAuthStore.getState().clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
