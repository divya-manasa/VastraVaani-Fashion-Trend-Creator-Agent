// src/pages/Register.jsx
// Complete Register Page with Backend Integration

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register({ onAuthSuccess, onToggleMode }) {
  const { register, error: authError, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service");
      return;
    }

    // Attempt registration
    const success = await register(formData.email, formData.password, formData.name);

    if (success) {
      onAuthSuccess?.();
    } else {
      setError(authError || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE5D0] to-[#FFD6E0] flex items-center justify-center p-4">
      {/* Left Side - Info */}
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center text-center px-8">
        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFB7B2] to-[#EB285D] mx-auto mb-6 flex items-center justify-center text-6xl shadow-2xl">
            🎨
          </div>
          <h1 className="text-6xl font-bold text-[#D72660] mb-4">Join VastraVaani</h1>
          <p className="text-2xl text-[#1C1917] mb-2 font-semibold">Start Your Fashion Journey</p>
          <p className="text-xl text-[#EB285D]">Powered by 11 AI Agents</p>
        </div>

        {/* Features */}
        <div className="space-y-5 text-left max-w-sm">
          <div className="flex items-start gap-4 bg-white/80 p-4 rounded-2xl border border-[#FFD6E0]">
            <span className="text-3xl">🚀</span>
            <div>
              <h3 className="font-bold text-[#D72660] text-lg">Get Started Instantly</h3>
              <p className="text-[#1C1917] text-sm">Create an account in less than 2 minutes</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white/80 p-4 rounded-2xl border border-[#FFD6E0]">
            <span className="text-3xl">🎁</span>
            <div>
              <h3 className="font-bold text-[#D72660] text-lg">Free Trial</h3>
              <p className="text-[#1C1917] text-sm">7 days free access to all premium features</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white/80 p-4 rounded-2xl border border-[#FFD6E0]">
            <span className="text-3xl">💼</span>
            <div>
              <h3 className="font-bold text-[#D72660] text-lg">Professional Tools</h3>
              <p className="text-[#1C1917] text-sm">Advanced AI tools designed for designers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full md:w-1/2 max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-2 border-[#FFD6E0]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#FFD6E0] mx-auto mb-4 flex items-center justify-center text-3xl">
              ✨
            </div>
            <h2 className="text-3xl font-bold text-[#D72660] mb-2">Create Account</h2>
            <p className="text-[#1C1917]">Join the VastraVaani community</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-[#1C1917] mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Peach Designer"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD6E0] bg-[#FFE5D0]/30 text-[#1C1917] placeholder-[#EB285D]/50 focus:outline-none focus:border-[#EB285D] focus:ring-2 focus:ring-[#FFB7B2] focus:bg-white transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1C1917] mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD6E0] bg-[#FFE5D0]/30 text-[#1C1917] placeholder-[#EB285D]/50 focus:outline-none focus:border-[#EB285D] focus:ring-2 focus:ring-[#FFB7B2] focus:bg-white transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1C1917] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD6E0] bg-[#FFE5D0]/30 text-[#1C1917] placeholder-[#EB285D]/50 focus:outline-none focus:border-[#EB285D] focus:ring-2 focus:ring-[#FFB7B2] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-[#EB285D] hover:text-[#D72660] transition"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <p className="text-xs text-[#EB285D] mt-1">Min. 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1C1917] mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD6E0] bg-[#FFE5D0]/30 text-[#1C1917] placeholder-[#EB285D]/50 focus:outline-none focus:border-[#EB285D] focus:ring-2 focus:ring-[#FFB7B2] focus:bg-white transition"
              />
            </div>

            {/* Error Message */}
            {(error || authError) && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-xl">
                <p className="font-semibold">⚠️ Error</p>
                <p className="text-sm">{error || authError}</p>
              </div>
            )}

            {/* Terms & Conditions */}
            <label className="flex items-start gap-3 text-[#1C1917] cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-2 border-[#FFD6E0]"
              />
              <span className="text-sm">
                I agree to VastraVaani's{" "}
                <a href="#" className="font-bold text-[#EB285D] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-bold text-[#EB285D] hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FFB7B2] to-[#EB285D] text-white py-3 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 mt-6"
            >
              {loading ? "🔄 Creating Account..." : "✨ Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#FFD6E0]"></div>
            <span className="text-[#EB285D] text-sm font-semibold">OR</span>
            <div className="flex-1 h-px bg-[#FFD6E0]"></div>
          </div>

          {/* Social Register */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#FFD6E0] hover:bg-[#FFE5D0] transition font-semibold text-[#1C1917]"
            >
              <span>🔵</span>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#FFD6E0] hover:bg-[#FFE5D0] transition font-semibold text-[#1C1917]"
            >
              <span>🍎</span>
              Apple
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-[#1C1917]">
            Already have an account?{" "}
            <button
              onClick={onToggleMode}
              className="font-bold text-[#EB285D] hover:text-[#D72660] transition"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}