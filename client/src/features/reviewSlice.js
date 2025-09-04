import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const base = 'http://localhost:3000/api'
// Async thunk to fetch review details, including likes and comments
export const fetchReviewDetails = createAsyncThunk(
  'reviews/fetchReviewDetails',
  async (reviewId) => {
    const response = await axios.get(`${base}/review/${reviewId}/details`);
    return response.data;
  }
);

export const updateReview = createAsyncThunk(
  '/reviews/updateReview',
  async (logDetails)=>{
    await axios.post(`${base}/review/updateReview/${logDetails.reviewId}`,logDetails);
    return logDetails;
  }
)

export const addLike = createAsyncThunk(
  'reviews/addLike',
  async ({reviewId,username}) => {
    await axios.post(`${base}/review/${reviewId}/addLike`,{username});
  }
)

export const removeLike = createAsyncThunk(
  'reviews/removeLike',
  async ({reviewId,username}) => {
    await axios.post(`${base}/review/${reviewId}/removeLike`,{username});
  }
)

const reviewSlice = createSlice({
    name: 'Review',
    initialState: {
      reviewDetails: null,
      likes: [],
      status: 'idle',
      error: null
    },
    reducers: {
      resetReviewSlice(state){
        state.reviewDetails = null,
        state.likes = [],
        state.status = 'idle',
        state.error = null
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchReviewDetails.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchReviewDetails.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.reviewDetails = action.payload?.details[0];
          state.likes = action.payload?.likes;
          state.comments = action.payload?.comments;
        })
        .addCase(fetchReviewDetails.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        })
        .addCase(addLike.pending,(state)=>{
          // state.status = 'loading';
        })
        .addCase(addLike.fulfilled,(state,action)=>{
          state.status = 'succeeded';
          state.likes.push({ username: action.meta.arg.username });
        })
        .addCase(addLike.rejected,(state,action)=>{
          state.status = 'failed';
          state.error = action.error.message;
        })
        .addCase(removeLike.pending,(state)=>{
          // state.status = 'loading';
        })
        .addCase(removeLike.fulfilled,(state,action)=>{
          state.status = 'succeeded';
          state.likes = state.likes.filter(like=>like.username!==action.meta.arg.username);
        })
        .addCase(removeLike.rejected,(state,action)=>{
          state.status = 'failed';
          state.error = action.error.message;
        })
        .addCase(updateReview.pending, (state) => {
          // state.status = 'loading';
        })
        .addCase(updateReview.fulfilled, (state, action) => {
          state.status = 'succeeded';
          const targetReview = state.reviewDetails; 
          if (targetReview) {
            targetReview.review_text = action.payload.review; 
            targetReview.review_date = action.payload.date; 
            targetReview.spoilers = action.payload.spoilers; 
            targetReview.rewatch = action.payload.rewatch; 
            targetReview.rating = action.payload.rating; 
          }
        })        
        .addCase(updateReview.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        })
    }
  });


  export const {resetReviewSlice} = reviewSlice.actions;
  export default reviewSlice.reducer;
  