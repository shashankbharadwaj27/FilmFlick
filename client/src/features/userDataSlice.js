import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiClient } from './authSlice';

const base = import.meta.env.VITE_API_BASE_URL;

export const addMovieToJournal = createAsyncThunk(
    'user/addMovieToJournal',
    async (logDetails, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`/user/log-movie`, logDetails);
            const insertedLog = response.data;
            const newMovie = {
                ...insertedLog,
                title: logDetails.movie.title,
                poster: logDetails.movie.poster_path
            };
            return newMovie;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchUserFavourites = createAsyncThunk(
    'loggedInUser/favourites', 
    async ({ username }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/user/${username}/favourites`);
            console.log(response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'An error occurred');
        }
    }
);

export const getUserReviews = createAsyncThunk(
    'loggedInUser/getUserReviews',
    async ({ username }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/review/getUserReviews/${username}`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateProfile = createAsyncThunk(
    'user/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/user/update-profile`, profileData);
            return response.data; 
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to update profile');
        }
    }
);

const initialState = {
    reviews: [],
    favourites: [],
    user: null,
    isLoading: false,
    error: null,
};

const userDataSlice = createSlice({
    name: 'userData',
    initialState,
    reducers: {
        resetUserData(state) {
            state.reviews = [];
            state.favourites = [];
            state.user = null;
            state.error = null;
        },
        // Add a reducer to handle user data updates
        updateUserData(state, action) {
            const { name, bio, location } = action.payload;
            state.user = { ...state.user, name, bio, location };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserReviews.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews = action.payload;
            })
            .addCase(getUserReviews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchUserFavourites.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserFavourites.fulfilled, (state, action) => {
                state.isLoading = false;
                state.favourites = action.payload;
            })
            .addCase(fetchUserFavourites.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.isLoading = false;

                const { name, bio, location, favourites } = action.payload;
                
                // Update state 
                state.favourites = favourites || state.favourites;
                state.user = { 
                    ...state.user, 
                    name, 
                    bio, 
                    location 
                };
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { resetUserData, updateUserData } = userDataSlice.actions;
export default userDataSlice.reducer;