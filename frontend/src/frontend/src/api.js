import axios from "axios";

// In production (Vercel), set VITE_API_URL to your Render backend URL.
// e.g. https://placement-portal-backend.onrender.com/api
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8010/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
          localStorage.setItem("access_token", data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Keep-alive ping ───────────────────────────────────────────────────────────
// Pings the backend every 5 minutes so Render's free tier doesn't sleep.
const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function startKeepAlive() {
  setInterval(async () => {
    try {
      await axios.get(`${BASE_URL}/ping/`);
    } catch {
      // silently ignore — this is best-effort
    }
  }, PING_INTERVAL_MS);
}

startKeepAlive();
