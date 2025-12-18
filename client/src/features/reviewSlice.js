import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from './authSlice';

// Async thunk to fetch review details, including likes and comments
export const fetchReviewDetails = createAsyncThunk(
  'reviews/fetchReviewDetails',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/review/${reviewId}/details`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to update review
export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async (logDetails, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `/review/updateReview/${logDetails.reviewId}`, 
        logDetails
      );
      // Return the response data along with the request payload
      return { ...logDetails, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to add like
export const addLike = createAsyncThunk(
  'reviews/addLike',
  async ({ reviewId, username }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/review/${reviewId}/addLike`, { username });
      return { username, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to remove like
export const removeLike = createAsyncThunk(
  'reviews/removeLike',
  async ({ reviewId, username }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/review/${reviewId}/removeLike`, { username });
      return { username, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    reviewDetails: null,
    likes: [],
    comments: [],
    status: 'idle',
    error: null
  },
  reducers: {
    resetReviewSlice(state) {
      state.reviewDetails = null;
      state.likes = [];
      state.comments = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Review Details
      .addCase(fetchReviewDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchReviewDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reviewDetails = action.payload?.details || null;
        state.likes = action.payload?.likes || [];
        state.comments = action.payload?.comments || [];
      })
      .addCase(fetchReviewDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      
      // Add Like
      .addCase(addLike.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addLike.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Check if like already exists to prevent duplicates
        const alreadyLiked = state.likes.some(
          like => like.username === action.payload.username
        );
        if (!alreadyLiked) {
          state.likes.push({ username: action.payload.username });
        }
      })
      .addCase(addLike.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      
      // Remove Like
      .addCase(removeLike.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(removeLike.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.likes = state.likes.filter(
          like => like.username !== action.payload.username
        );
      })
      .addCase(removeLike.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      
      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.reviewDetails) {
          state.reviewDetails.review_text = action.payload.review;
          state.reviewDetails.review_date = action.payload.date;
          state.reviewDetails.spoilers = action.payload.spoilers;
          state.reviewDetails.rewatch = action.payload.rewatch;
          state.reviewDetails.rating = action.payload.rating;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  }
});

export const { resetReviewSlice } = reviewSlice.actions;
export default reviewSlice.reducer;