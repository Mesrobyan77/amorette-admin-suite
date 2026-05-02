import { useEffect, useMemo, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTheme, toggleTheme, THEME_KEY, type Theme } from "@/store/slices/themeSlice";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

/**
 * ThemeProvider syncs Redux theme state with <html class> and localStorage.
 * State itself lives in the Redux store (`state.theme`).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useAppSelector((s) => s.theme.theme);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  return <>{children}</>;
}

export function useTheme(): ThemeCtx {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.theme.theme);

  return useMemo<ThemeCtx>(
    () => ({
      theme,
      setTheme: (t) => dispatch(setTheme(t)),
      toggle: () => dispatch(toggleTheme()),
    }),
    [theme, dispatch],
  );
}
