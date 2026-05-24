import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
// Lazy import to avoid circular dependency — socket imports axios
let _reconnectSocketWithToken: ((token: string) => void) | null = null;
if (typeof window !== 'undefined') {
  import('./socket').then((m) => {
    _reconnectSocketWithToken = m.reconnectSocketWithToken;
  });
}

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

// ── Authenticated API instance ────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends httpOnly refresh-token cookie automatically
});

// ── Request: attach access token ─────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: silent token refresh on 401 ────────────────────
let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(err: unknown, token: string | null) {
  queue.forEach(({ resolve, reject }) => {
    if (err) reject(err);
    else resolve(token!);
  });
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean };

    // Don't intercept non-401s, already-retried requests,
    // or the refresh endpoint itself (prevents infinite loop)
    if (
      err.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/refresh') ||
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/signup') ||
      original.url?.includes('/auth/verify-login') ||
      original.url?.includes('/auth/verify-signup') ||
      original.url?.includes('/auth/resend-otp')
    ) {
      return Promise.reject(err);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${token}`,
        };
        return api(original);
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newToken = data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);
      // Update socket auth token so next reconnect uses the fresh token
      _reconnectSocketWithToken?.(newToken);
      processQueue(null, newToken);

      original.headers = {
        ...original.headers,
        Authorization: `Bearer ${newToken}`,
      };
      return api(original);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
