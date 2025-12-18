import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiClient } from './authSlice';

// Async thunk to fetch followers
export const fetchFollowers = createAsyncThunk(
    'loggedInUser/followers', 
    async ({ username }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/user/${username}/followers`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// Async thunk to fetch following
export const fetchFollowing = createAsyncThunk(
    'loggedInUser/following', 
    async ({ username }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/user/${username}/following`);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// Async thunk to follow user
export const followUser = createAsyncThunk(
    'loggedInUser/followUser',
    async ({ userToFollow, loggedInUser }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`/user/follow`, { 
                userToFollow: userToFollow,
                loggedInUser: loggedInUser
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'An error occurred');
        }
    }
);

// Async thunk to unfollow a user
export const unfollowUser = createAsyncThunk(
    'loggedInUser/unfollowUser',
    async ({ userToUnfollow, loggedInUser }, { rejectWithValue }) => {
        try {
            const response = await apiClient.delete(`/user/unfollow`, {
                data: {
                    userToUnfollow: userToUnfollow,
                    loggedInUser: loggedInUser,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'An error occurred');
        }
    }
);

// Async thunk to fetch following activity
export const fetchFollowingActivity = createAsyncThunk(
    'loggedInUser/fetchFriendsLatestActivity',
    async ({ following }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(`/user/latest-friends-activity`, {
                following: following,
            });
            console.log(response);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'An error occurred');
        }
    }
);

const socialSlice = createSlice({
    name: 'social',
    initialState: {
        followers: [],
        following: [],
        activity: [],
        isLoading: false,
        error: null
    },
    reducers: {
        resetSocialState(state) {
            state.followers = [];
            state.following = [];
            state.activity = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Followers
            .addCase(fetchFollowers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchFollowers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.followers = action.payload;
            })
            .addCase(fetchFollowers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Fetch Following
            .addCase(fetchFollowing.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchFollowing.fulfilled, (state, action) => {
                state.isLoading = false;
                state.following = action.payload;
            })
            .addCase(fetchFollowing.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Follow User
            .addCase(followUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.isLoading = false;
                const isAlreadyFollowing = state.following.some(
                    user => user.id === action.payload.id
                );
    
                if (!isAlreadyFollowing) {
                    state.following.push(action.payload);
                }
            })
            .addCase(followUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Unfollow User
            .addCase(unfollowUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.following = state.following.filter(
                    (user) => user.username !== action.payload.username
                );
            })
            .addCase(unfollowUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Fetch Following Activity
            .addCase(fetchFollowingActivity.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchFollowingActivity.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activity = action.payload;
            })
            .addCase(fetchFollowingActivity.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { resetSocialState } = socialSlice.actions;
export default socialSlice.reducer;