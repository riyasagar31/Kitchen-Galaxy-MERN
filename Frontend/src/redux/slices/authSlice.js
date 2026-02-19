import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../../api/http.js';

const initialState = {
    user: (() => {
        try {
            const savedUser = localStorage.getItem('user_data');
            if (!savedUser || savedUser === "undefined" || savedUser === "null") return null;
            return JSON.parse(savedUser);
        } catch (error) {
            localStorage.removeItem('user_data');
            localStorage.removeItem('token');
            return null;
        }
    })(),
    loading: true,
    error: null,
};

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const res = await http.get('/auth/me');
        const userData = res.data.user;
        localStorage.setItem('user_data', JSON.stringify(userData));
        return userData;
    } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
        return rejectWithValue(err.response?.data?.error || err.message);
    }
});

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
    try {
        const res = await http.post('/auth/login', { email, password });
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        return userData;
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || err.response?.data?.message || "Invalid credentials");
    }
});

export const registerUser = createAsyncThunk('auth/register', async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
        const res = await http.post('/auth/register', { name, email, password, role });
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.error || err.response?.data?.message || "Registration failed");
    }
});

export const updateUserProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
    try {
        const res = await http.put('/auth/profile', profileData);
        const userData = res.data.user;
        localStorage.setItem('user_data', JSON.stringify(userData));
        return userData;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Failed to update profile");
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            localStorage.removeItem('user_data');
            state.user = null;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkAuth.pending, (state) => { state.loading = true; })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.user = null;
                state.loading = false;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            });
    }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
