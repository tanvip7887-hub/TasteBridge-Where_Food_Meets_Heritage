import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice.js";
import LocationDrawer from "./LocationDrawer.jsx";
import AuthModal from "../auth/AuthModal.jsx";
import {
  UtensilsCrossed,
  MapPin,
  ChevronDown,
  Bell,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  UserCheck,
  Package,
  Heart,
  LogOut,
  Shield,
  ChefHat,
  Bike,
} from "lucide-react";

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { selectedLocation } = useSelector((state) => state.location || {});

  // Dropdown & Mobile Menu States
  const [locationDrawerOpen, setLocationDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'notification' | 'profile' | null
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth Modal State (for Logged-Out Landing Navbar)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [routerLocation]);

  const handleLogout = () => {
    dispatch(logout());
    setActiveDropdown(null);
    navigate("/");
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownName);
    }
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

  // User display first name (e.g. "TANVI")
  const userFirstName = user?.name
    ? user.name.split(" ")[0].toUpperCase()
    : "TANVI";

  /* =========================================================================
     1. LOGGED-OUT NAVBAR (PRESERVED LANDING PAGE NAVBAR EXACTLY)
     ========================================================================= */
  if (!isAuthenticated) {
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



            {/* Auth Actions */}
            <div className="flex items-center gap-3">
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
  }

  /* =========================================================================
     2. LOGGED-IN NAVBAR (HOMEPAGE LOGGED-IN NAVBAR)
     Items left-to-right:
     1. TasteBridge Logo (exact same logo)
     2. Location selector (📍 Select location ▼)
     3. Become a Cook
     4. Become a Delivery Agent
     5. Notification bell (with red dot & 3 mock notifications)
     6. Cart (badge 0)
     7. Profile button & ProfileDropdown (thin terracotta top border, exactly 4 items)
     ========================================================================= */
  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFF8F0] border-b border-[#2B1B12]/10 shadow-xs h-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3 sm:gap-6">
          
          {/* LEFT SIDE: 1. Logo & 2. Location Selector */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* 1. Exact Same TasteBridge Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="TasteBridge Home"
            >
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

            {/* 2. Location Selector (📍 Select location ▼) */}
            <button
              onClick={() => {
                setLocationDrawerOpen(true);
                setActiveDropdown(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#2B1B12]/15 text-xs font-medium text-[#2B1B12] hover:border-red-600 transition-all max-w-[140px] sm:max-w-[200px] cursor-pointer"
              aria-label="Select delivery location"
            >
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="truncate font-sans font-medium">
                {selectedLocation?.shortName || "Select location"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            </button>
          </div>

          {/* DESKTOP NAV ITEMS (3, 4, 5, 6, 7) */}
          <div className="hidden md:flex items-center gap-6">
            {/* 3. Become a Cook */}
            <Link
              to="/become-a-cook"
              className="text-xs font-semibold text-gray-700 hover:text-red-600 transition-colors"
            >
              Become a Cook
            </Link>

            {/* 4. Become a Delivery Agent */}
            <Link
              to="/become-a-delivery-agent"
              className="text-xs font-semibold text-gray-700 hover:text-red-600 transition-colors"
            >
              Become a Delivery Agent
            </Link>

            {/* 5. Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => toggleDropdown("notification")}
                className="relative p-2 text-gray-700 hover:text-red-600 hover:bg-white rounded-full transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {/* Red notification dot */}
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-[#FFF8F0]" />
              </button>

              {/* Notification Dropdown */}
              {activeDropdown === "notification" && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Notifications
                    </h3>
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">
                      3 New
                    </span>
                  </div>

                  <div className="space-y-2.5 text-left">
                    <div className="p-2.5 bg-[#FFF8F0] border border-orange-200 rounded-xl">
                      <p className="text-xs font-semibold text-gray-900">
                        Welcome to TasteBridge!
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Explore authentic home cooks near Paud Road, Pune.
                      </p>
                    </div>
                    <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <p className="text-xs font-semibold text-gray-900">
                        Rajasthani Workshop
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Join the Dal Baati Churma masterclass this Saturday.
                      </p>
                    </div>
                    <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <p className="text-xs font-semibold text-gray-900">
                        Order Status Update
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Your home chef has started preparing your meal.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-red-600 hover:bg-white rounded-full transition-colors cursor-pointer flex items-center"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            {/* 7. Profile Button & ProfileDropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => toggleDropdown("profile")}
                className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-colors cursor-pointer"
                aria-label="User profile menu"
              >
                <UserIcon className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-gray-900 uppercase">
                  {userFirstName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* LOGGED-IN PROFILE DROPDOWN: Small white card, rounded corners, soft shadow, thin terracotta line along top edge, EXACTLY 4 ITEMS */}
              {activeDropdown === "profile" && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border-t-4 border-t-[#D2552B] border-x border-b border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left font-medium">
                  {/* Item 1: Profile */}
                  <Link
                    to="/profile"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-800 hover:bg-[#FFF8F0] hover:text-[#D2552B] transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-gray-500" /> Profile
                  </Link>

                  {/* Item 2: Orders */}
                  <Link
                    to="/orders"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-800 hover:bg-[#FFF8F0] hover:text-[#D2552B] transition-colors"
                  >
                    <Package className="w-4 h-4 text-gray-500" /> Orders
                  </Link>

                  {/* Item 3: Favourites */}
                  <Link
                    to="/favourites"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-800 hover:bg-[#FFF8F0] hover:text-[#D2552B] transition-colors"
                  >
                    <Heart className="w-4 h-4 text-gray-500" /> Favourites
                  </Link>

                  {/* Item 4: Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE NAVBAR (< 768px): Logo, Location, Cart, Profile, Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-red-600 rounded-full cursor-pointer"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Mobile Profile Trigger */}
            <button
              onClick={() => toggleDropdown("profile")}
              className="p-2 text-red-600 hover:bg-white rounded-full transition-colors cursor-pointer"
              aria-label="User profile menu"
            >
              <UserIcon className="w-5 h-5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE SLIDE-OUT MENU PANEL */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFF8F0] border-b border-[#2B1B12]/10 px-4 py-5 space-y-3 animate-in slide-in-from-top duration-200 shadow-lg text-left">
            <Link
              to="/become-a-cook"
              className="block p-2.5 text-sm font-semibold text-gray-900 hover:bg-white rounded-xl transition-colors"
            >
              Become a Cook
            </Link>
            <Link
              to="/become-a-delivery-agent"
              className="block p-2.5 text-sm font-semibold text-gray-900 hover:bg-white rounded-xl transition-colors"
            >
              Become a Delivery Agent
            </Link>
          </div>
        )}
      </header>

      {/* Location Drawer */}
      <LocationDrawer
        isOpen={locationDrawerOpen}
        onClose={() => setLocationDrawerOpen(false)}
      />
    </>
  );
};

export default Navbar;
