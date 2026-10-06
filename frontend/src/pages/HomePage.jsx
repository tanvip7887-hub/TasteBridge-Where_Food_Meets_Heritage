import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { User, Shield, ChefHat, Bike, Sparkles, Utensils, BookOpen, Compass } from "lucide-react";

export const HomePage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-orange-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to TasteBridge
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Hello, {user?.name || "Food Explorer"}!
          </h1>
          <p className="text-sm text-gray-600">
            Your authenticated session is active as a{" "}
            <span className="font-bold text-orange-700">{user?.role || "CUSTOMER"}</span>.
          </p>
        </div>

        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
          {user?.role === "ADMIN" && <Shield className="w-6 h-6 text-amber-600" />}
          {user?.role === "COOK" && <ChefHat className="w-6 h-6 text-red-600" />}
          {user?.role === "DELIVERY_AGENT" && <Bike className="w-6 h-6 text-blue-600" />}
          {user?.role === "CUSTOMER" && <User className="w-6 h-6 text-emerald-600" />}
          <div>
            <p className="text-xs text-gray-500 font-medium">Account Status</p>
            <p className="text-xs font-bold text-emerald-600 uppercase">{user?.status || "ACTIVE"}</p>
          </div>
        </div>
      </section>

      {/* Module Overview Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Explore Modules</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/explore"
            className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-red-300 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-gray-900 group-hover:text-red-600 transition-colors">
              Cultural Discovery
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Explore authentic regional cuisines, rare home recipes, and ancient food traditions.
            </p>
          </Link>

          <div className="p-6 bg-white rounded-2xl border border-gray-200 opacity-90 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900">Dishes & Menu</h3>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                Upcoming Phase
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Order fresh home-cooked meals prepared by verified local cooks in your area.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200 opacity-90 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900">Cultural Stories</h3>
              <span className="text-[10px] bg-orange-100 text-orange-800 font-semibold px-2 py-0.5 rounded-full">
                Upcoming Phase
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Read origin tales, ingredient secret histories, and cooking wisdom from elders.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
