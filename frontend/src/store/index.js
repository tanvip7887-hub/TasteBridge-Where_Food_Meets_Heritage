import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import locationReducer from "./locationSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
  },
});

export default store;
