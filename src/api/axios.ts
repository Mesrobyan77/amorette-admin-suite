import axios from "axios";

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:7777";

export const TOKEN_KEY = "amorette.accessToken";

export const getAccessToken = () =>
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
export const setAccessToken = (t: string | null) => {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Refresh queue logic -----------------------------------------------------
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const subscribe = (cb: (token: string | null) => void) => pendingQueue.push(cb);
const broadcast = (token: string | null) => {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
};

const onUnauthenticated = () => {
  setAccessToken(null);
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config ?? {};
    const status = error.response?.status;
    const url: string = original?.url || "";

    // Don't try to refresh on auth endpoints themselves
    const isAuthCall =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/refresh") ||
      url.includes("/api/auth/logout");

    if (status === 401 && !original._retry && !isAuthCall) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribe((token) => {
            if (!token) return reject(error);
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken: string | undefined = data?.accessToken;
        if (!newToken) throw new Error("No accessToken in refresh response");
        setAccessToken(newToken);
        broadcast(newToken);
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        broadcast(null);
        onUnauthenticated();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401 && isAuthCall && url.includes("/api/auth/me")) {
      onUnauthenticated();
    }

    return Promise.reject(error);
  },
);

export default api;
