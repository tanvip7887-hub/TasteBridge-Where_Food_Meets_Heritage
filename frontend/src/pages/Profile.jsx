import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout, updateUserProfile } from "../store/slices/authSlice.js";
import { mockProfileData } from "../data/mockProfile.js";
import { mockAddresses as initialMockAddresses } from "../data/mockAddresses.js";
import {
  User,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Home as HomeIcon,
  Briefcase,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  Lock,
  ShieldCheck,
  LogOut,
  Package,
  Heart,
  ShoppingBag,
  ArrowRight,
  X,
  Building,
  AlertCircle,
  Check,
  Calendar,
  Sparkles,
} from "lucide-react";

export const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Profile Information State
  const [profileData, setProfileData] = useState(() => ({
    name: user?.name || mockProfileData.name,
    email: user?.email || mockProfileData.email,
    phone: user?.phone || mockProfileData.phone,
    role: user?.role || mockProfileData.role,
    memberSince: mockProfileData.memberSince,
  }));

  // Sync with Redux user state when updated
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        role: user.role || prev.role,
      }));
    }
  }, [user]);

  // Personal Info Edit Mode
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    name: profileData.name,
    phone: profileData.phone,
  });
  const [infoFeedback, setInfoFeedback] = useState(null);

  // Saved Addresses State
  const [addresses, setAddresses] = useState(() => initialMockAddresses);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    title: "",
    shortName: "",
    fullAddress: "",
    phone: "",
    type: "Home",
    isDefault: false,
  });
  const [addressFeedback, setAddressFeedback] = useState(null);

  // Password Security Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Handler: Start editing profile info
  const handleStartEditInfo = () => {
    setInfoForm({
      name: profileData.name,
      phone: profileData.phone,
    });
    setIsEditingInfo(true);
    setInfoFeedback(null);
  };

  // Handler: Save profile info
  const handleSaveInfo = (e) => {
    e.preventDefault();
    if (!infoForm.name.trim()) {
      setInfoFeedback({ type: "error", message: "Full Name cannot be empty." });
      return;
    }

    const updated = {
      ...profileData,
      name: infoForm.name.trim(),
      phone: infoForm.phone.trim(),
    };

    setProfileData(updated);
    dispatch(updateUserProfile({ name: updated.name, phone: updated.phone }));
    setIsEditingInfo(false);
    setInfoFeedback({
      type: "success",
      message: "Personal details updated successfully!",
    });

    setTimeout(() => {
      setInfoFeedback(null);
    }, 4000);
  };

  // Handler: Set Address as Default
  const handleSetDefaultAddress = (addressId) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))
    );
    setAddressFeedback("Default address updated!");
    setTimeout(() => setAddressFeedback(null), 3000);
  };

  // Handler: Delete Address
  const handleDeleteAddress = (addressId) => {
    setAddresses((prev) => {
      const filtered = prev.filter((addr) => addr.id !== addressId);
      // If deleted address was default, set first remaining as default
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    setAddressFeedback("Address removed successfully.");
    setTimeout(() => setAddressFeedback(null), 3000);
  };

  // Handler: Open Add Address Modal
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: "Home",
      title: "",
      shortName: "",
      fullAddress: "",
      phone: profileData.phone || "+91 98765 43210",
      type: "Home",
      isDefault: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  // Handler: Open Edit Address Modal
  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label || "Home",
      title: addr.title || addr.label || "",
      shortName: addr.shortName || "",
      fullAddress: addr.fullAddress || "",
      phone: addr.phone || profileData.phone,
      type: addr.type || "Home",
      isDefault: !!addr.isDefault,
    });
    setAddressModalOpen(true);
  };

  // Handler: Save Address (Add/Edit)
  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.title.trim() || !addressForm.fullAddress.trim()) {
      return;
    }

    if (editingAddress) {
      // Edit existing
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === editingAddress.id) {
            return {
              ...a,
              label: addressForm.type,
              title: addressForm.title,
              shortName: addressForm.shortName || addressForm.title,
              fullAddress: addressForm.fullAddress,
              phone: addressForm.phone,
              type: addressForm.type,
              isDefault: addressForm.isDefault,
            };
          }
          return addressForm.isDefault ? { ...a, isDefault: false } : a;
        })
      );
      setAddressFeedback("Address updated successfully!");
    } else {
      // Add new
      const newId = `addr-${Date.now()}`;
      const newAddr = {
        id: newId,
        label: addressForm.type,
        title: addressForm.title,
        shortName: addressForm.shortName || addressForm.title,
        fullAddress: addressForm.fullAddress,
        phone: addressForm.phone,
        type: addressForm.type,
        isDefault: addressForm.isDefault || addresses.length === 0,
        lat: 18.5204,
        lon: 73.8567,
      };

      setAddresses((prev) => {
        let list = [...prev];
        if (newAddr.isDefault) {
          list = list.map((a) => ({ ...a, isDefault: false }));
        }
        return [newAddr, ...list];
      });
      setAddressFeedback("New address added successfully!");
    }

    setAddressModalOpen(false);
    setTimeout(() => setAddressFeedback(null), 3000);
  };

  // Handler: Save Password Change
  const handleSavePassword = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSuccess("Password updated successfully!");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setTimeout(() => {
      setPasswordModalOpen(false);
      setPasswordSuccess("");
    }, 1500);
  };

  // Handler: Logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "TP";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Get Icon for address type
  const getAddressIcon = (type) => {
    switch (type) {
      case "Home":
        return <HomeIcon className="w-4 h-4 text-red-600" />;
      case "Work":
        return <Briefcase className="w-4 h-4 text-amber-600" />;
      default:
        return <Building className="w-4 h-4 text-emerald-600" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-red-600">
          <User className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Sign in to view Profile</h2>
        <p className="text-sm text-gray-600 max-w-sm">
          Please log in to manage your account details, addresses, and orders.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* feedback message toast at top if active */}
      {infoFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs transition-all ${
            infoFeedback.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          {infoFeedback.type === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{infoFeedback.message}</span>
        </div>
      )}

      {/* 1. PROFILE HEADER CARD */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-200/90 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Subtle Decorative Background Glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          {/* Avatar Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
            {getInitials(profileData.name)}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {profileData.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-amber-800 text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-amber-600" /> {profileData.role}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> {profileData.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> {profileData.phone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Member since {profileData.memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Action: Edit Profile Button */}
        <div className="relative z-10 w-full md:w-auto flex items-center gap-3">
          <button
            onClick={handleStartEditInfo}
            className="w-full md:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        </div>
      </section>

      {/* 2. PROFILE INFORMATION SECTION */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 text-red-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
              <p className="text-xs text-gray-500">Manage your name and contact details</p>
            </div>
          </div>

          {!isEditingInfo && (
            <button
              onClick={handleStartEditInfo}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>

        {!isEditingInfo ? (
          /* Read-Only Profile View */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-[#FFF8F0]/60 rounded-2xl border border-orange-100 space-y-1">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Full Name</p>
              <p className="text-sm font-semibold text-gray-900">{profileData.name}</p>
            </div>

            <div className="p-4 bg-[#FFF8F0]/60 rounded-2xl border border-orange-100 space-y-1">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-semibold text-gray-900">{profileData.email}</p>
            </div>

            <div className="p-4 bg-[#FFF8F0]/60 rounded-2xl border border-orange-100 space-y-1">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phone Number</p>
              <p className="text-sm font-semibold text-gray-900">{profileData.phone}</p>
            </div>
          </div>
        ) : (
          /* Editable Form Mode */
          <form onSubmit={handleSaveInfo} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={infoForm.name}
                  onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={infoForm.phone}
                  onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-gray-400 font-normal flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Cannot be changed
                </span>
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-3.5 py-2 text-xs border border-gray-200 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditingInfo(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 3 & 4. SAVED ADDRESSES & DEFAULT ADDRESS SECTION */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 text-red-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
              <p className="text-xs text-gray-500">Manage delivery locations for quick ordering</p>
            </div>
          </div>

          <button
            onClick={handleOpenAddAddress}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FFF8F0] hover:bg-orange-100 border border-orange-200 text-red-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>

        {addressFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{addressFeedback}</span>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-3">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">No saved addresses yet</p>
            <button
              onClick={handleOpenAddAddress}
              className="px-4 py-2 bg-red-600 text-white font-semibold text-xs rounded-xl cursor-pointer hover:bg-red-700"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between space-y-3 ${
                  addr.isDefault
                    ? "bg-[#FFF8F0]/70 border-red-300 ring-2 ring-red-500/10 shadow-xs"
                    : "bg-white border-gray-200 hover:border-orange-300"
                }`}
              >
                {/* Top Badge & Type */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-lg border border-gray-100 shadow-xs">
                      {getAddressIcon(addr.type || addr.label)}
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {addr.label || addr.type}
                    </span>
                  </div>

                  {addr.isDefault ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <Check className="w-3 h-3" /> Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-gray-900 line-clamp-1">
                    {addr.title || addr.shortName}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {addr.fullAddress}
                  </p>
                  {addr.phone && (
                    <p className="text-[11px] text-gray-500 pt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" /> {addr.phone}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-3 text-xs">
                  <button
                    onClick={() => handleOpenEditAddress(addr)}
                    className="text-gray-600 hover:text-red-600 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-gray-400 hover:text-red-600 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>



      {/* 6. ACCOUNT SECURITY SECTION */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 text-amber-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Account Security</h2>
              <p className="text-xs text-gray-500">Manage your password and security options</p>
            </div>
          </div>

          <button
            onClick={() => {
              setPasswordModalOpen(true);
              setPasswordError("");
              setPasswordSuccess("");
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" /> Change Password
          </button>
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <p className="font-bold text-gray-900">Password Authentication</p>
            <p className="text-gray-500">Last changed recently</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
            Protected
          </span>
        </div>
      </section>

      {/* 7. LOGOUT SECTION */}
      <section className="bg-red-50/70 border border-red-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-gray-900">Ready to log out?</h3>
          <p className="text-xs text-gray-600">
            Ending your session will return you to the TasteBridge landing page.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Logout of Account
        </button>
      </section>

      {/* =========================================================================
         MODAL 1: ADD / EDIT ADDRESS MODAL
         ========================================================================= */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                {["Home", "Work", "Other"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAddressForm({ ...addressForm, type: t, label: t })}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      addressForm.type === t
                        ? "bg-red-600 text-white border-red-600 shadow-xs"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {getAddressIcon(t)} {t}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Address Title / Label</label>
                <input
                  type="text"
                  value={addressForm.title}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, title: e.target.value })
                  }
                  placeholder="e.g. Chintamani Nagar or Paud Road Office"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Full Address</label>
                <textarea
                  rows={3}
                  value={addressForm.fullAddress}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, fullAddress: e.target.value })
                  }
                  placeholder="Flat/House No, Building, Street, Area, City, Pin Code"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Contact Phone Number</label>
                <input
                  type="text"
                  value={addressForm.phone}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, phone: e.target.value })
                  }
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="set-default"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, isDefault: e.target.checked })
                  }
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <label htmlFor="set-default" className="font-medium text-gray-700 cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         MODAL 2: CHANGE PASSWORD MODAL
         ========================================================================= */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
