import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { authApi, type AdminUser } from "@/api/auth";
import { API_BASE_URL, setAccessToken, getAccessToken } from "@/api/axios";

interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  initialized: false,
};

export const initializeAuth = createAsyncThunk<AdminUser | null>("auth/initialize", async () => {
  let token = getAccessToken();
  if (!token) {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/refresh`,
        {},
        { withCredentials: true },
      );
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        token = data.accessToken;
      }
    } catch {
      return null;
    }
  }
  if (!token) return null;
  try {
    const { data } = await authApi.me();
    return data;
  } catch {
    return null;
  }
});

export const loginThunk = createAsyncThunk<AdminUser | null, { email: string; password: string }>(
  "auth/login",
  async ({ email, password }) => {
    const { data } = await authApi.login(email, password);
    setAccessToken(data.accessToken);
    if (data.user) return data.user;
    const me = await authApi.me();
    return me.data;
  },
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    await authApi.logout();
  } catch {}
  setAccessToken(null);
});

export const logoutAllThunk = createAsyncThunk("auth/logoutAll", async () => {
  try {
    await authApi.logoutAll();
  } catch {}
  setAccessToken(null);
});

export const refreshMeThunk = createAsyncThunk("auth/refreshMe", async () => {
  const { data } = await authApi.me();
  return data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AdminUser | null>) => {
      state.user = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(logoutAllThunk.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(refreshMeThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
