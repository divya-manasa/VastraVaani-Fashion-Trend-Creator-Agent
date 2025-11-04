// src/components/NavbarWarm.jsx
// Warm & Cozy Peach Theme Navbar

import React, { useState, useRef, useEffect } from "react";

export default function NavbarWarm({ currentPage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef(null);

  const menuItems = [
    { id: "generator", label: "✨ Generator", description: "AI generation" },
    { id: "trends", label: "📊 Trends", description: "Fashion trends" },
    { id: "fabric-ai", label: "⚡ Fabric AI", description: "AI fabric analysis" },
    { id: "colors", label: "🎨 Colors", description: "Color palette" },
    { id: "stylist", label: "👗 Stylist", description: "Style advisor" },
    { id: "pricing", label: "💰 Pricing", description: "Subscription plans" },
    { id: "bookmarks", label: "🔖 Bookmarks", description: "Saved items" },
    { id: "ar-tryon", label: "👓 AR Try-On", description: "Virtual fitting" },
  ];

  const supportItems = [
    { id: "documentation", label: "📚 Documentation" },
    { id: "faq", label: "❓ FAQ" },
    { id: "contact", label: "💬 Contact" },
    { id: "feedback", label: "⭐ Feedback" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate("search", { query: searchQuery });
      setSearchQuery("");
    }
  };

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 bg-gradient-to-r from-orange-50 via-pink-50 to-rose-50 text-rose-900 border-b-2 border-orange-200 backdrop-blur-md shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            onClick={() => onNavigate("home")}
          >
            <div className="text-3xl font-bold">👗</div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-rose-500 bg-clip-text text-transparent">
                VastraVaani
              </h1>
              <p className="text-xs text-orange-600">Warm Fashion AI</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-lg transition text-sm font-medium ${
                  currentPage === item.id
                    ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md"
                    : "text-rose-700 hover:bg-orange-100"
                }`}
                title={item.description}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
           

            {/* Bookmarks */}
            <button
              onClick={() => onNavigate("bookmarks")}
              className={`p-2 rounded-full transition ${
                currentPage === "bookmarks"
                  ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white"
                  : "hover:bg-orange-100"
              }`}
              title="Saved bookmarks"
            >
              🔖
            </button>

            {/* Help Dropdown */}
            <div className="relative group">
              <button className="p-2 hover:bg-orange-100 rounded-full transition">
                ❓
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border-2 border-orange-200">
                {supportItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="w-full text-left px-4 py-2 hover:bg-orange-50 transition text-sm text-rose-700"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-orange-100 rounded-full transition"
              >
                <img
                  src="https://ui-avatars.com/api/?name=Divya&background=orange"
                  alt="User"
                  className="w-6 h-6 rounded-full border-2 border-orange-400"
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border-2 border-orange-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-orange-200">
                    <p className="font-semibold text-rose-900">Divya Sharma</p>
                    <p className="text-xs text-orange-600">divya@example.com</p>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate("profile");
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-orange-50 transition text-sm text-rose-700"
                  >
                    👤 Profile
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("settings");
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-orange-50 transition text-sm text-rose-700"
                  >
                    ⚙️ Settings
                  </button>

                  <div className="border-t border-orange-200 my-2" />

                  <button className="w-full text-left px-4 py-2 hover:bg-red-50 transition text-sm text-red-600">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-orange-100 rounded-lg transition"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-orange-200 py-4 space-y-2 bg-white">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-orange-50 rounded-lg px-3 py-2 mx-2 mb-3 border border-orange-200"
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-rose-900 placeholder-orange-400 outline-none flex-1"
              />
              <button type="submit" className="text-orange-500">
                🔍
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 px-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-lg transition text-sm font-medium text-center ${
                    currentPage === item.id
                      ? "bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md"
                      : "bg-orange-100 text-rose-700 hover:bg-orange-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}