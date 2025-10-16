import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL;
// Asynchronous thunk for fetching actor details
export const fetchActorDetails = createAsyncThunk(
    'actor/fetchActorDetails',
    async (actorId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base}/person/${actorId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching actor details:', error.message);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Asynchronous thunk for fetching actor movie credits
export const fetchActorCredits = createAsyncThunk(
    'actor/fetchActorCredits',
    async (actorId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base}/person/${actorId}/credits`);
            return response.data;
        } catch (error) {
            console.error('Error fetching actor credits:', error.message);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const creditsSlice = createSlice({
    name: 'credits',
    initialState: {
        actorDetails: null,
        actorCredits: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Actor Details
            .addCase(fetchActorDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActorDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.actorDetails = action.payload;
            })
            .addCase(fetchActorDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch Actor Credits
            .addCase(fetchActorCredits.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActorCredits.fulfilled, (state, action) => {
                state.loading = false;
                state.actorCredits = action.payload;
            })
            .addCase(fetchActorCredits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default creditsSlice.reducer;
