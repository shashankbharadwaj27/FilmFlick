import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL;
export const fetchTargetUserProfile = createAsyncThunk('/user/profile', async (username, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${base}/user/${username}/profile`);
        return response.data; 
    } catch (error) {
        return rejectWithValue(error.response?.data || 'An error occurred');
    }
});

// Slice
const targetUserSlice = createSlice({
    name: 'targetUser',
    initialState: {
        targetUser: {
            userinfo: {},
            reviews: [],
            favourites: [],
            followers: [],
            following: []
        },
        isLoading: false,
        error: null,
    },
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTargetUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTargetUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                const { userinfo,reviews, favourites,followers,following } = action.payload;
                state.targetUser = {
                    userinfo,
                    reviews,
                    favourites,
                    followers,
                    following
                };
            })
            .addCase(fetchTargetUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

// Actions and reducer export
export const { clearErrors } = targetUserSlice.actions;
export default targetUserSlice.reducer;
