import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";
export const THEME_KEY = "amorette.theme";

interface ThemeState {
  theme: Theme;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    const prefers = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return prefers ? "dark" : "light";
  } catch {
    return "light";
  }
}

const initialState: ThemeState = { theme: getInitialTheme() };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => { state.theme = action.payload; },
    toggleTheme: (state) => { state.theme = state.theme === "dark" ? "light" : "dark"; },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
