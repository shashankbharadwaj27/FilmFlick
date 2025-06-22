import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'

const base = import.meta.env.VITE_API_BASE_URL;

export const addMovieToJournal = createAsyncThunk(
    'user/addMovieToJournal',
    async (logDetails, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${base}/user/log-movie`, logDetails);
            const insertedLog = response.data;
            const newMovie = {
                ...insertedLog,
                title: logDetails.movie.title,
                poster: logDetails.movie.poster
            };
            return newMovie;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchUserFavourites = createAsyncThunk(`loggedInUser/favourites`, async ({ username }, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${base}/user/${username}/favourites`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'An error occurred');
    }
});

export const getUserReviews = createAsyncThunk(
    'loggedInUser/getUserReviews',
    async ({ username }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base}/review/getUserReviews/${username}`);
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
      const response = await axios.put(`${base}/user/update-profile`, profileData);
      return response.data; 
    } catch (err) {
      return rejectWithValue(err.response.data || 'Failed to update profile');
    }
  }
);
const initialState = {
    reviews: JSON.parse(localStorage.getItem('reviews')) || [],
    favourites: JSON.parse(localStorage.getItem('favourites')) || [],
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
                localStorage.setItem('reviews', JSON.stringify(state.reviews));
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
                localStorage.setItem('favourites', JSON.stringify(state.favourites));
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
                state.favourites = action.payload;
                localStorage.setItem('favourites', JSON.stringify(state.favourites));
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
    }
});

export const { resetUserData } = userDataSlice.actions;
export default userDataSlice.reducer;
