import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { foodCategories } from "../data/foodCategories.js";
import {
  Sparkles,
  UtensilsCrossed,
  Users,
  ChefHat,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Bike,
  Compass,
  Package,
  Heart,
  UserCheck,
  BookOpen,
  Award,
} from "lucide-react";

export const HomePage = () => {
  const { user } = useSelector((state) => state.auth);
  const userFirstName = user?.name ? user.name.split(" ")[0] : "Food Explorer";

  // Carousel Scroll State
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollLimits = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScrollLimits();
      el.addEventListener("scroll", checkScrollLimits);
      window.addEventListener("resize", checkScrollLimits);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScrollLimits);
      window.removeEventListener("resize", checkScrollLimits);
    };
  }, []);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-5 h-5 text-amber-600" />;
      case "COOK":
        return <ChefHat className="w-5 h-5 text-red-600" />;
      case "DELIVERY_AGENT":
        return <Bike className="w-5 h-5 text-blue-600" />;
      default:
        return <User className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. WELCOME / ONBOARDING HERO BANNER (STATIC, NO VIDEO) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-orange-200/90 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Decorative Background Glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Welcome to TasteBridge
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Welcome back, <span className="bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">{userFirstName}</span>
          </h1>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            What would you like to experience today?
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed font-normal">
            TasteBridge connects you with authentic home-cooked meals, local family dining experiences, and traditional cooking workshops passed down through generations.
          </p>
        </div>

        {/* User Role & Session Card */}
        <div className="relative z-10 w-full sm:w-auto px-5 py-4 bg-gray-50/90 border border-gray-200/80 rounded-2xl flex items-center justify-between sm:justify-start gap-4 shrink-0 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-xs">
            {getRoleIcon(user?.role)}
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Session Active</p>
            <p className="text-xs font-bold text-gray-900 leading-snug">
              {user?.name || "Food Explorer"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full uppercase">
                {user?.role || "CUSTOMER"}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                {user?.status || "ACTIVE"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE PRIMARY EXPERIENCE CARDS */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">
            Choose Your Culinary Experience
          </h2>
          <p className="text-sm text-gray-600">
            Three ways to connect with authentic regional food and heritage home chefs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: ORDER */}
          <Link
            to="/explore?type=order"
            className="group p-6 bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-red-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                Delivery
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-3 group-hover:text-red-600 transition-colors">
                Order Home-Cooked Food
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed font-normal">
                Discover authentic regional dishes prepared by home cooks and delivered to your door.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-red-600">
              <span>Explore Food</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: DINE */}
          <Link
            to="/explore?type=dining"
            className="group p-6 bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                Experience
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-3 group-hover:text-amber-600 transition-colors">
                Dine With Local Families
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed font-normal">
                Share a meal with local families and experience food traditions where they belong.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Explore Dining</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 3: LEARN */}
          <Link
            to="/explore?type=workshop"
            className="group p-6 bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ChefHat className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md">
                Masterclass
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-3 group-hover:text-orange-600 transition-colors">
                Learn Traditional Recipes
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed font-normal">
                Join hands-on cooking workshops and learn recipes passed down through generations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-orange-700">
              <span>Explore Workshops</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. FOOD DISCOVERY SECTION ("EXPLORE FLAVOURS") */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">
              Explore Flavours
            </h2>
            <p className="text-sm text-gray-600">
              Discover regional dishes and food traditions from across India.
            </p>
          </div>

          {/* Carousel Scroll Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                canScrollLeft
                  ? "border-gray-300 bg-white text-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-xs"
                  : "border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                canScrollRight
                  ? "border-gray-300 bg-white text-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-xs"
                  : "border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Category Carousel */}
        <div
          ref={scrollRef}
          className="flex items-center gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {foodCategories.map((item) => (
            <Link
              key={item.id}
              to={`/explore?cuisine=${encodeURIComponent(item.name)}`}
              className="flex flex-col items-center shrink-0 group snap-start cursor-pointer w-28 sm:w-32"
            >
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden p-1 border-2 border-transparent group-hover:border-red-400 transition-all bg-white shadow-xs">
                <img
                  src={item.image}
                  alt={`Authentic ${item.name} regional food`}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";
                  }}
                />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-gray-900 group-hover:text-red-600 transition-colors mt-3 text-center">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. CULTURE / HERITAGE SECTION ("MORE THAN JUST A MEAL") */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xs space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-amber-700" /> TasteBridge Promise
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            More Than Just a Meal
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed font-normal">
            TasteBridge is a culture-first marketplace. Beyond food delivery, we preserve ancestral recipes, honor family kitchens, and share the origin stories behind every regional dish.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-orange-100/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Ancestral Recipes</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-normal">
              Crafted by home chefs using hand-ground spices and traditional cooking methods.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-orange-100/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Cultural Storytelling</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-normal">
              Learn the history, festive significance, and secret ingredients behind every meal.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-orange-100/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Community Connections</h3>
            <p className="text-xs text-gray-600 leading-relaxed font-normal">
              Supporting local families while bringing people together over authentic food.
            </p>
          </div>
        </div>
      </section>

      {/* 5. QUICK SHORTCUTS SECTION */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Quick Shortcuts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/explore"
            className="p-4 bg-white rounded-2xl border border-gray-200/80 hover:border-red-300 shadow-xs hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-900 group-hover:text-red-600 transition-colors">Explore Food</p>
              <p className="text-[10px] text-gray-500">All Cuisines</p>
            </div>
          </Link>

          <Link
            to="/orders"
            className="p-4 bg-white rounded-2xl border border-gray-200/80 hover:border-orange-300 shadow-xs hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-900 group-hover:text-orange-600 transition-colors">My Orders</p>
              <p className="text-[10px] text-gray-500">Track History</p>
            </div>
          </Link>

          <Link
            to="/favourites"
            className="p-4 bg-white rounded-2xl border border-gray-200/80 hover:border-rose-300 shadow-xs hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-900 group-hover:text-rose-600 transition-colors">Favourites</p>
              <p className="text-[10px] text-gray-500">Saved Items</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="p-4 bg-white rounded-2xl border border-gray-200/80 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-900 group-hover:text-emerald-600 transition-colors">My Profile</p>
              <p className="text-[10px] text-gray-500">Account Details</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
