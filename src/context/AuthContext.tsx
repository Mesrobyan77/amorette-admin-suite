import { useEffect, useMemo, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  initializeAuth, loginThunk, logoutThunk, logoutAllThunk, refreshMeThunk,
} from "@/store/slices/authSlice";
import type { AdminUser } from "@/api/auth";

interface AuthCtx {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

/**
 * AuthProvider now bootstraps the Redux auth state on mount.
 * State itself lives in the Redux store (`state.auth`).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((s) => s.auth.initialized);

  useEffect(() => {
    if (!initialized) dispatch(initializeAuth());
  }, [dispatch, initialized]);

  return <>{children}</>;
}

export function useAuth(): AuthCtx {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((s) => s.auth);

  return useMemo<AuthCtx>(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login: async (email, password) => {
      await dispatch(loginThunk({ email, password })).unwrap();
    },
    logout: async () => { await dispatch(logoutThunk()); },
    logoutAll: async () => { await dispatch(logoutAllThunk()); },
    refreshMe: async () => { await dispatch(refreshMeThunk()); },
  }), [user, loading, dispatch]);
}
