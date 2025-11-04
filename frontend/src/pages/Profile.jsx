// src/pages/Profile.jsx
// Complete Profile Page with Backend Integration

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, token, updateProfile, getProfile, error: authError, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    location: user?.location || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    company: user?.company || "",
  });

  // Load profile on mount
  useEffect(() => {
    if (!user) {
      setLoading(true);
      getProfile().finally(() => setLoading(false));
    }
  }, [user, getProfile]);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        location: user.location || "",
        bio: user.bio || "",
        phone: user.phone || "",
        company: user.company || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");

    const success = await updateProfile(formData);
    setIsSaving(false);

    if (success) {
      setSuccessMessage("Profile updated successfully!");
      setEditMode(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#FFE5D0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFD6E0] mx-auto mb-4 flex items-center justify-center text-4xl animate-pulse">
            👤
          </div>
          <p className="text-[#1C1917] font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFE5D0] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFD6E0] to-[#FBB1B1] rounded-3xl p-8 mb-8 shadow-lg border-2 border-[#FFB7B2]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user?.photo || "https://via.placeholder.com/120"}
                alt={user?.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-[#EB285D] text-white p-2 rounded-full text-xl">
                ✓
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-[#D72660] mb-2">{user?.name}</h1>
              <p className="text-[#1C1917] text-lg font-semibold mb-1">{user?.email}</p>
              <p className="text-[#EB285D]">
                Plan: <span className="font-bold">{user?.plan || "Free"}</span>
              </p>
              <p className="text-[#1C1917] text-sm mt-2">{user?.location || "Location not set"}</p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-8 py-3 bg-gradient-to-r from-[#FFB7B2] to-[#EB285D] text-white rounded-xl font-bold hover:shadow-lg transition"
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
            ✓ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {authError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            ✕ {authError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b-2 border-[#FFD6E0]">
          {["overview", "edit", "security", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold text-lg transition capitalize ${
                activeTab === tab
                  ? "text-[#D72660] border-b-4 border-[#EB285D]"
                  : "text-[#1C1917] hover:text-[#EB285D]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && !editMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#FFD6E0] shadow-lg">
              <h3 className="text-[#1C1917] font-bold mb-2">Account Status</h3>
              <p className="text-[#EB285D] text-3xl font-bold mb-2">Active ✓</p>
              <p className="text-[#1C1917] text-sm">Joined: {new Date(user?.created_at).toLocaleDateString()}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-[#FFD6E0] shadow-lg">
              <h3 className="text-[#1C1917] font-bold mb-2">Current Plan</h3>
              <p className="text-[#EB285D] text-3xl font-bold mb-2">{user?.plan || "Free"}</p>
              <button className="text-[#EB285D] font-semibold hover:underline">Upgrade Plan →</button>
            </div>

            {/* Profile Details */}
            <div className="md:col-span-2 bg-white rounded-2xl p-6 border-2 border-[#FFD6E0] shadow-lg">
              <h3 className="text-[#D72660] font-bold text-xl mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[#1C1917] font-semibold text-sm">Full Name</label>
                  <p className="text-[#1C1917] text-lg">{formData.name}</p>
                </div>
                <div>
                  <label className="text-[#1C1917] font-semibold text-sm">Email</label>
                  <p className="text-[#1C1917] text-lg">{formData.email}</p>
                </div>
                <div>
                  <label className="text-[#1C1917] font-semibold text-sm">Location</label>
                  <p className="text-[#1C1917] text-lg">{formData.location || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-[#1C1917] font-semibold text-sm">Phone</label>
                  <p className="text-[#1C1917] text-lg">{formData.phone || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "edit" || editMode ? (
          <div className="bg-white rounded-2xl p-8 border-2 border-[#FFD6E0] shadow-lg">
            <h3 className="text-[#D72660] font-bold text-xl mb-6">Edit Profile</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-[#1C1917] font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD6E0] bg-[#FFE5D0]/30 text-[#1C1917] focus:border-[#EB285D] focus:outline-none"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-[#1C1917] font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD6E0] bg-gray-200 text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[#1C1917] font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD6E0] bg-[#FFE5D0]/30 text-[#1C1917] focus:border-[#EB285D] focus:outline-none"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[#1C1917] font-semibold mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD6E0] bg-[#FFE5D0]/30 text-[#1C1917] focus:border-[#EB285D] focus:outline-none"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-[#1C1917] font-semibold mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD6E0] bg-[#FFE5D0]/30 text-[#1C1917] focus:border-[#EB285D] focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[#1C1917] font-semibold mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD6E0] bg-[#FFE5D0]/30 text-[#1C1917] focus:border-[#EB285D] focus:outline-none"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-[#FFB7B2] to-[#EB285D] text-white py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        ) : null}

        {activeTab === "security" && (
          <div className="bg-white rounded-2xl p-8 border-2 border-[#FFD6E0] shadow-lg">
            <h3 className="text-[#D72660] font-bold text-xl mb-6">Security Settings</h3>
            <div className="space-y-4">
              <button className="w-full text-left px-6 py-4 border-2 border-[#FFD6E0] rounded-xl hover:bg-[#FFE5D0] transition">
                <p className="font-bold text-[#1C1917]">Change Password</p>
                <p className="text-sm text-[#EB285D]">Update your password regularly</p>
              </button>
              <button className="w-full text-left px-6 py-4 border-2 border-[#FFD6E0] rounded-xl hover:bg-[#FFE5D0] transition">
                <p className="font-bold text-[#1C1917]">Two-Factor Authentication</p>
                <p className="text-sm text-[#EB285D]">Add an extra layer of security</p>
              </button>
              <button className="w-full text-left px-6 py-4 border-2 border-[#FFD6E0] rounded-xl hover:bg-[#FFE5D0] transition">
                <p className="font-bold text-[#1C1917]">Active Sessions</p>
                <p className="text-sm text-[#EB285D]">Manage your active login sessions</p>
              </button>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-white rounded-2xl p-8 border-2 border-[#FFD6E0] shadow-lg">
            <h3 className="text-[#D72660] font-bold text-xl mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[#FFD6E0]">
                <div>
                  <p className="font-bold text-[#1C1917]">Login from Chrome</p>
                  <p className="text-sm text-[#EB285D]">Today at 9:30 AM</p>
                </div>
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[#FFD6E0]">
                <div>
                  <p className="font-bold text-[#1C1917]">Profile Updated</p>
                  <p className="text-sm text-[#EB285D]">Yesterday at 2:15 PM</p>
                </div>
                <span className="text-blue-600 font-bold">✎</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-bold text-[#1C1917]">Account Created</p>
                  <p className="text-sm text-[#EB285D]">{new Date(user?.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-purple-600 font-bold">+</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}