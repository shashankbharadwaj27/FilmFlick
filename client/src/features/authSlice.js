import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const base = 'http://localhost:3000/api'
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, thunkAPI) => {
    try {
        const { data } = await axios.post(`${base}/user/login`, credentials);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message);
    }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, thunkAPI) => {
    try {
        await axios.post(`${base}/user/logout`);
        localStorage.clear();
        return true;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message);
    }
});

export const userSignup = createAsyncThunk('auth/signup', async ({ username, password, name }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${base}/user/signup`, { username, password, name });
        const result = response.data;
        localStorage.setItem('user', JSON.stringify(result.user));
        return result;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'An error occurred');
    }
});

export const getUserInfo = createAsyncThunk('auth/userinfo',async(username,{rejectWithValue})=>{
    try {
        const response = await axios.post(`${base}/user/info`, { username });
        const result = response.data;
        localStorage.setItem('user', JSON.stringify(result[0]));
        return result[0];
    } catch (error) {
        return rejectWithValue(error.response?.data || 'An error occurred');
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: JSON.parse(localStorage.getItem('user')) || null,
        isAuthenticated: !!localStorage.getItem('user'),
        isLoading: false,
        error: null,
    },
    reducers: {
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.clear();
        },
        clearErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(getUserInfo.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserInfo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
    }
});

export const { logout, clearErrors } = authSlice.actions;
export default authSlice.reducer;
