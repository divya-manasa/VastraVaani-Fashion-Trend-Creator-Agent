// src/pages/Login.jsx
// Complete Login Page with Backend Integration

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onAuthSuccess, onToggleMode }) {
  const { login, error: authError, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Attempt login
    const success = await login(email, password);

    if (success) {
      if (rememberMe) {
        localStorage.setItem("vastravaani_remember_email", email);
      }
      onAuthSuccess?.();
    } else {
      setError(authError || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE5D0] to-[#FFD6E0] flex items-center justify-center p-4">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center text-center px-8">
        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFB7B2] to-[#EB285D] mx-auto mb-6 flex items-center justify-center text-6xl shadow-2xl">
            👗
          </div>
          <h1 className="text-6xl font-bold text-[#D72660] mb-4">VastraVaani</h1>
          <p className="text-2xl text-[#1C1917] mb-2 font-semibold">AI-Powered Fashion Platform</p>
          <p className="text-xl text-[#EB285D]">The Voice of Fashion</p>
        </div>

        {/* Features */}
        <div className="space-y-5 text-left max-w-sm">
          <div className="flex items-start gap-4 bg-white/80 p-4 rounded-2xl border border-[#FFD6E0]">
            <span className="text-3xl">✨</span>
            <div>
              <h3 className="font-bold text-[#D72660] text-lg">AI-Powered Insights</h3>
              <p className="text-[#1C1917] text-sm">Real-time trend analysis & predictions</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white/80 p-4 rounded-2xl border border-[#FFD6E0]">
            <span className="text-3xl">🎨</span>
            <div>
              <h3 className="font-bold text-[#D72660] text-lg">Design Generation</h3>
              <p className="text-[#1C1917] text-sm">Create stunning designs instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-white/80 p-4 rounded-2xl border border-[#FFD6E0]">
            <span className="text-3xl">👭</span>
            <div>
              <h3 className="font-bold text-[#D72660] text-lg">AI Styling</h3>
              <p className="text-[#1C1917] text-sm">Personal AI assistant for your style</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-2 border-[#FFD6E0]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#FFD6E0] mx-auto mb-4 flex items-center justify-center text-3xl">
              👤
            </div>
            <h2 className="text-3xl font-bold text-[#D72660] mb-2">Welcome Back</h2>
            <p className="text-[#1C1917]">Sign in to your VastraVaani account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-[#1C1917] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD6E0] bg-[#FFE5D0]/30 text-[#1C1917] placeholder-[#EB285D]/50 focus:outline-none focus:border-[#EB285D] focus:ring-2 focus:ring-[#FFB7B2] focus:bg-white transition"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-[#1C1917] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            {/* Error Message */}
            {(error || authError) && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-xl">
                <p className="font-semibold">⚠️ Error</p>
                <p className="text-sm">{error || authError}</p>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#1C1917] cursor-pointer hover:text-[#EB285D]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-[#FFD6E0]"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-[#EB285D] hover:text-[#D72660] font-semibold transition"
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FFB7B2] to-[#EB285D] text-white py-3 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {loading ? "🔄 Signing in..." : "✨ Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#FFD6E0]"></div>
            <span className="text-[#EB285D] text-sm font-semibold">OR</span>
            <div className="flex-1 h-px bg-[#FFD6E0]"></div>
          </div>

          {/* Social Login */}
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

          {/* Register Link */}
          <p className="text-center text-[#1C1917]">
            Don't have an account?{" "}
            <button
              onClick={onToggleMode}
              className="font-bold text-[#EB285D] hover:text-[#D72660] transition"
            >
              Sign up here
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#1C1917] mt-6">
          By signing in, you agree to our{" "}
          <a href="#" className="font-semibold text-[#EB285D] hover:underline">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}