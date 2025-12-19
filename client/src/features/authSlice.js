import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL;
const AUTH_ROUTES = ['/user/login', '/user/signup', '/user/verify'];

// Create axios instance with credentials
export const apiClient = axios.create({
  baseURL: base,
  timeout: 10000,
  withCredentials: true // Send cookies automatically
});

// Response interceptor for auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response, just reject
    if (!error.response) {
      return Promise.reject(error);
    }

    //Never refresh on auth routes
    if (AUTH_ROUTES.some(route => originalRequest.url?.includes(route))) {
      return Promise.reject(error);
    }

    // Never retry refresh endpoint itself
    if (originalRequest.url?.includes('/user/refresh')) {
      return Promise.reject(error);
    }

    // ✅ Only refresh on protected route 401s
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await apiClient.post('/user/refresh');
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


// Verify authentication status with server
export const verifyAuth = createAsyncThunk(
  'auth/verify',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/user/verify');
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Not authenticated');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/user/login', credentials);
      return data.user;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ username, password, name }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/user/signup', { 
        username, 
        password, 
        name 
      });
      return data.user;
    } catch (error) {
      const message = error.response?.data?.error || error.error || 'Signup failed';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/user/logout');
      return true;
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
      return true;
    }
  }
);

export const fetchUserInfo = createAsyncThunk(
  'auth/fetchUserInfo',
  async (username, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/user/info', { username });
      return data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch user info';
      return rejectWithValue(message);
    }
  }
);

// Helper to handle async state
const handlePending = (state) => {
  state.isLoading = true;
  state.error = null;
};

const handleFulfilled = (state, action) => {
  state.isLoading = false;
  state.user = action.payload;
  state.isAuthenticated = true;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
  state.isAuthenticated = false;
  state.user = null;
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify Auth (on app load)
      .addCase(verifyAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      // Login
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, handleRejected)

      // Signup
      .addCase(signupUser.pending, handlePending)
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, handleRejected)

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Clear local state even if server logout fails
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })

      // Fetch User Info
      .addCase(fetchUserInfo.pending, handlePending)
      .addCase(fetchUserInfo.fulfilled, handleFulfilled)
      .addCase(fetchUserInfo.rejected, handleRejected);
  },
});

export const { logout, clearError, clearUser } = authSlice.actions;
export default authSlice.reducer;