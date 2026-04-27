import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import { authApi, type AdminUser } from "@/api/auth";
import { getAccessToken, setAccessToken } from "@/api/axios";

interface AuthCtx {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await authApi.me();
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const token = getAccessToken();
      if (!token) { setLoading(false); return; }
      await loadMe();
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [loadMe]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    setAccessToken(data.accessToken);
    if (data.user) setUser(data.user);
    else await loadMe();
  }, [loadMe]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    setAccessToken(null);
    setUser(null);
  }, []);

  const logoutAll = useCallback(async () => {
    try { await authApi.logoutAll(); } catch {}
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login, logout, logoutAll,
    refreshMe: loadMe,
  }), [user, loading, login, logout, logoutAll, loadMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
