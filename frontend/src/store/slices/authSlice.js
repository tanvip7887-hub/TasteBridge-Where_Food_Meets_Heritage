import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";
import { tokenStorage } from "../../utils/tokenStorage.js";

// Async Thunk: Restore session on startup via GET /api/v1/auth/me
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue }) => {
    const token = tokenStorage.getToken();
    if (!token) {
      return { user: null, token: null };
    }
    try {
      const response = await api.get("/auth/me");
      return { user: response.data, token };
    } catch (error) {
      tokenStorage.removeToken();
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk: Register User (POST /api/v1/auth/register)
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async Thunk: Verify OTP (POST /api/v1/auth/register/verify-otp)
export const verifyRegisterOtp = createAsyncThunk(
  "auth/verifyRegisterOtp",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register/verify-otp", payload);
      const { token, user } = response.data;
      tokenStorage.setToken(token);
      return { token, user };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async Thunk: Resend OTP (POST /api/v1/auth/register/resend-otp)
export const resendRegisterOtp = createAsyncThunk(
  "auth/resendRegisterOtp",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register/resend-otp", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async Thunk: Login User (POST /api/v1/auth/login)
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { token, user } = response.data;
      tokenStorage.setToken(token);
      return { token, user };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  user: null,
  token: tokenStorage.getToken(),
  isAuthenticated: false,
  loading: false,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      tokenStorage.removeToken();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      } else {
        state.user = { ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // initializeAuth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "Login failed" };
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "Registration failed" };
      })
      // verifyRegisterOtp
      .addCase(verifyRegisterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRegisterOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyRegisterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "OTP verification failed" };
      })
      // resendRegisterOtp
      .addCase(resendRegisterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendRegisterOtp.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendRegisterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "Resend OTP failed" };
      });
  },
});

export const { logout, clearAuthError, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;


