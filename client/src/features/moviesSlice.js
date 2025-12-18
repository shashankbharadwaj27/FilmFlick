import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import { apiClient } from "./authSlice";

const base = import.meta.env.VITE_API_BASE_URL;


// Generic thunk factory to reduce repetition
const createMovieThunk = (name, endpoint) =>
  createAsyncThunk(name, async (payload, { rejectWithValue }) => {
    try {
      const url = typeof payload === 'string' ? `${endpoint}/${payload}` : endpoint;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error ${name}:`, error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  });

// Thunks
export const fetchPopularMovies = createMovieThunk(
  'movies/fetchPopularMovies',
  '/movie/new-releases'
);

export const fetchTopRatedMovies = createMovieThunk(
  'movies/fetchTopRatedMovies',
  '/movie/top-rated'
);

export const fetchMovieDetails = createMovieThunk(
  'movies/fetchMovieDetails',
  '/movie'
);

// Helper function to handle async state
const handleAsyncState = (state, action, key) => {
  state.loading = false;
  state.error = null;
  if (key) state[key] = action.payload;
};

const handleAsyncError = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

// Initial state
const initialState = {
  popular: [],
  topRated: [],
  movieDetails: {},
  loading: false,
  error: null,
};

// Creating the movies slice
const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    clearMovieDetails: (state) => {
      state.movieDetails = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Popular Movies
    builder
      .addCase(fetchPopularMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularMovies.fulfilled, (state, action) => {
        handleAsyncState(state, action, 'popular');
      })
      .addCase(fetchPopularMovies.rejected, (state, action) => {
        handleAsyncError(state, action);
      })

      // Top Rated Movies
      .addCase(fetchTopRatedMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopRatedMovies.fulfilled, (state, action) => {
        handleAsyncState(state, action, 'topRated');
      })
      .addCase(fetchTopRatedMovies.rejected, (state, action) => {
        handleAsyncError(state, action);
      })

      // Movie Details
      .addCase(fetchMovieDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        handleAsyncState(state, action, 'movieDetails');
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        handleAsyncError(state, action);
      })
  },
});

export const { clearMovieDetails, clearError } = moviesSlice.actions;
export default moviesSlice.reducer;