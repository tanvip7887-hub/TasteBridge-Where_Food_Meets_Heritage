import { createSlice } from "@reduxjs/toolkit";

const LOCAL_STORAGE_KEY = "tastebridge_location";

const loadLocationFromStorage = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to parse saved location from localStorage:", error);
  }
  return {
    shortName: "Select location",
    fullName: "Paud Road, Kothrud, Pune",
    lat: 18.5074,
    lon: 73.8077,
    isDefault: true,
  };
};

const initialState = {
  selectedLocation: loadLocationFromStorage(),
};

export const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocation: (state, action) => {
      const newLoc = {
        shortName: action.payload.shortName || "Selected Location",
        fullName: action.payload.fullName || action.payload.shortName || "",
        lat: action.payload.lat || null,
        lon: action.payload.lon || null,
        isDefault: false,
      };
      state.selectedLocation = newLoc;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLoc));
      } catch (error) {
        console.error("Failed to save location to localStorage:", error);
      }
    },
    clearLocation: (state) => {
      const defaultLoc = {
        shortName: "Select location",
        fullName: "",
        lat: null,
        lon: null,
        isDefault: true,
      };
      state.selectedLocation = defaultLoc;
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (error) {
        console.error("Failed to remove location from localStorage:", error);
      }
    },
  },
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
