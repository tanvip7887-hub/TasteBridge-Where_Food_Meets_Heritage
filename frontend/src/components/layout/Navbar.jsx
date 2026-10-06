import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice.js";
import AuthModal from "../auth/AuthModal.jsx";
import { UtensilsCrossed, LogOut, User as UserIcon, Shield, ChefHat, Bike } from "lucide-react";

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-3.5 h-3.5 text-amber-600" />;
      case "COOK":
        return <ChefHat className="w-3.5 h-3.5 text-red-600" />;
      case "DELIVERY_AGENT":
        return <Bike className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <UserIcon className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-700 via-amber-600 to-amber-800 bg-clip-text text-transparent">
                TasteBridge
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider font-semibold text-amber-700">
                Where Food Meets Heritage
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-red-600 transition-colors">
              Home
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* User Info Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                  {getRoleIcon(user.role)}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-900 leading-tight">
                      {user.name}
                    </p>
                    <span className="text-[10px] font-bold text-orange-700 uppercase">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-all hover:shadow-md cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reusable Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Navbar;
