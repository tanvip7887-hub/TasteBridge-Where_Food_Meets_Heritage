import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { initializeAuth } from "../store/slices/authSlice.js";
import MainLayout from "../layouts/MainLayout.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import OnboardingPage from "../pages/OnboardingPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export const AppRoutes = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Dynamic Root Route: Shows HomePage if authenticated, LandingPage if public */}
        <Route
          index
          element={isAuthenticated ? <HomePage /> : <LandingPage />}
        />

        {/* User Onboarding Route */}
        <Route
          path="onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard/Profile Route */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route
          path="*"
          element={isAuthenticated ? <HomePage /> : <LandingPage />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
