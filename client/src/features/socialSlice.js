import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const base = 'http://localhost:3000/api'
export const fetchFollowers = createAsyncThunk('loggedInUser/followers', async ({ username },{rejectWithValue})=>{
    try{
        const response = await axios.get(`${base}/user/${username}/followers`);
        return response.data;
    }catch(err){
        return rejectWithValue(err.response?.data || err.message);
    }
});

//Async thunk to fetch followers
export const fetchFollowing = createAsyncThunk('loggedInUser/following', async ({ username },{rejectWithValue})=>{
    try{
        const response = await axios.get(`${base}/user/${username}/following`);
        return response.data;
    }catch(err){
        return rejectWithValue(err.response?.data || err.message);
    }
});

//Async thunk to follow user
export const followUser = createAsyncThunk(
    'loggedInUser/followUser',
    async ({userToFollow,loggedInUser}, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${base}/user/follow`, { 
                userToFollow:userToFollow,
                loggedInUser:loggedInUser
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
    async ({userToUnfollow,loggedInUser}, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${base}/user/unfollow`, {
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

export const fetchFollowingActivity = createAsyncThunk(
    '/loggedInUser/fetchFriendsLatestActivity',async ({following},{rejectWithValue})=>{
        try{
            const response = await axios.post(`${base}/user/latest-friends-activity`,{
                following:following,
            });
            return response.data;
        }
        catch(error){
            return rejectWithValue(error.response?.data || 'An error occured');
        }
    }
);


const socialSlice = createSlice({
    name: 'social',
    initialState: {
        followers: JSON.parse(localStorage.getItem('followers')) || [],
        following: JSON.parse(localStorage.getItem('following')) || [],
        activity: JSON.parse(localStorage.getItem('followingActivity')) || [],
        isLoading: false,
        error: null
    },
    reducers: {
        resetSocialState(state) {
            state.followers = [];
            state.following = [];
            state.activity = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFollowers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchFollowers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.followers = action.payload;
                localStorage.setItem("followers", JSON.stringify(action.payload));
            })
            .addCase(fetchFollowers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchFollowing.pending,(state)=>{
                state.isLoading = true;
            })
            .addCase(fetchFollowing.fulfilled, (state, action) => {
                state.isLoading = false;
                state.following = action.payload;
                localStorage.setItem("following", JSON.stringify(state.following));
            })
            .addCase(fetchFollowing.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(followUser.pending,(state)=>{
                state.isLoading = true;
            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.isLoading = false;
                const isAlreadyFollowing = state.following.some(user => user.id === action.payload.id);
    
                if (!isAlreadyFollowing) {
                    state.following.push(action.payload);
                    localStorage.setItem("following", JSON.stringify(state.following));
                }
            })
            .addCase(followUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(unfollowUser.pending,(state)=>{
                state.isLoading = true;
            })
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.following = state.following.filter(
                    (user) => user.username !== action.payload.username
                );
                localStorage.setItem("following", JSON.stringify(state.following));
            })
            .addCase(unfollowUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchFollowingActivity.pending, (state, action) => {
                state.isLoading = true;
            })
            .addCase(fetchFollowingActivity.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activity = action.payload;
                localStorage.setItem("activity", JSON.stringify(action.payload));
            })
            .addCase(fetchFollowingActivity.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { resetSocialState } = socialSlice.actions;
export default socialSlice.reducer;
