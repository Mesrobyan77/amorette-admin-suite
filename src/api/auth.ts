import api from "./axios";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; user?: AdminUser }>("/api/auth/login", { email, password }),
  me: () => api.get<AdminUser>("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
  logoutAll: () => api.post("/api/auth/logout-all"),
  refresh: () => api.post<{ accessToken: string }>("/api/auth/refresh"),
};
