import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const base = 'http://localhost:3000/api'
// Asynchronous thunk for fetching popular movies
export const fetchPopularMovies = createAsyncThunk(
    'movies/fetchPopularMovies',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base}/movie/new-releases`);
            return response.data; 
        } catch (error) {
            console.error('Error fetching popular movies:', error.message);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Asynchronous thunk for fetching top-rated movies
export const fetchTopRatedMovies = createAsyncThunk(
    'movies/fetchTopRatedMovies',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base}/movie/top-rated`);
            console.log(response.data)
            return response.data;
        } catch (error) {
            console.error('Error fetching top rated movies:', error.message);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Asynchronous thunk for fetching movie details
export const fetchMovieDetails = createAsyncThunk(
    'movies/fetchMovieDetails',
    async (movieId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base}/movie/${movieId}`);
            console.log(response.data)
            return response.data[0];
        } catch (error) {
            console.error('Error fetching movie details:', error.message);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Asynchronous thunk for fetching movie cast
export const fetchCast = createAsyncThunk(
    'movies/fetchCast',
    async (movieId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base}/movie/credits/${movieId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching movie credits:', error.message);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Creating the movies slice
const moviesSlice = createSlice({
    name: 'movies',
    initialState: {
        popular: [],
        topRated: [],
        movieDetails: [],
        cast:[],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPopularMovies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPopularMovies.fulfilled, (state, action) => {
                state.loading = false;
                state.popular = action.payload;
            })
            .addCase(fetchPopularMovies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchTopRatedMovies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopRatedMovies.fulfilled, (state, action) => {
                state.loading = false;
                state.topRated = action.payload;
            })
            .addCase(fetchTopRatedMovies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMovieDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMovieDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.movieDetails = action.payload;
            })
            .addCase(fetchMovieDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCast.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCast.fulfilled, (state, action) => {
                state.loading = false;
                state.cast = action.payload;
            })
            .addCase(fetchCast.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default moviesSlice.reducer;
