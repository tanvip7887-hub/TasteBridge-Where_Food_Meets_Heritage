import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { initializeAuth } from "../store/slices/authSlice.js";
import MainLayout from "../layouts/MainLayout.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import OnboardingPage from "../pages/OnboardingPage.jsx";
import PlaceholderPage from "../pages/PlaceholderPage.jsx";
import Profile from "../pages/Profile.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
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

        {/* Public Unauthenticated Password Reset Routes */}
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />

        {/* User Onboarding Route */}
        <Route
          path="onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard Route */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Navigation & Stub Routes */}
        <Route path="explore" element={<PlaceholderPage />} />
        <Route path="become-a-cook" element={<PlaceholderPage />} />
        <Route path="become-a-delivery-agent" element={<PlaceholderPage />} />
        <Route path="cart" element={<PlaceholderPage />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="orders" element={<PlaceholderPage />} />
        <Route path="favourites" element={<PlaceholderPage />} />

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
