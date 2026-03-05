import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

// ── Async Thunks ─────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authApi.login(credentials);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await authApi.register(userData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch (_) {}
    }
    localStorage.clear();
  }
);

// ── Slice ─────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:         JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken:  localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isLoading:    false,
    error:        null,
  },
  reducers: {
    clearError:     (state) => { state.error = null; },
    sessionExpired: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isLoading    = false;
        state.user         = payload.user;
        state.accessToken  = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        localStorage.setItem('accessToken',  payload.accessToken);
        localStorage.setItem('refreshToken', payload.refreshToken);
        localStorage.setItem('user',         JSON.stringify(payload.user));
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error     = payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.isLoading    = false;
        state.user         = payload.user;
        state.accessToken  = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        localStorage.setItem('accessToken',  payload.accessToken);
        localStorage.setItem('refreshToken', payload.refreshToken);
        localStorage.setItem('user',         JSON.stringify(payload.user));
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error     = payload;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user         = null;
      state.accessToken  = null;
      state.refreshToken = null;
    });
  },
});

export const { clearError, sessionExpired } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectUser            = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.accessToken;
export const selectAuthLoading     = (state) => state.auth.isLoading;
export const selectAuthError       = (state) => state.auth.error;