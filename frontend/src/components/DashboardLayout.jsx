// src/components/DashboardLayout.jsx
// Unified Dashboard with Peach-Pink Theme

import React, { useState } from "react";

const NAV_ITEMS = [
  { icon: "🏡", label: "Home", key: "home" },
  { icon: "✨", label: "AI Generator", key: "generator" },
  { icon: "📈", label: "Trends", key: "trends" },
  { icon: "🧶", label: "Fabric AI", key: "fabric-ai" },
  { icon: "🎨", label: "Colors", key: "colors" },
  { icon: "👗", label: "Stylist", key: "stylist" },
  { icon: "💰", label: "Pricing", key: "pricing" },
  { icon: "🔖", label: "Bookmarks", key: "bookmarks" },
  { icon: "👓", label: "AR Try-On", key: "ar-tryon" },
  { icon: "👤", label: "Profile", key: "profile" },
];

export default function DashboardLayout({ 
  currentPage, 
  onNavigate, 
  children, 
  user, 
  onLogout 
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FFE5D0]">
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-gradient-to-b from-[#FFD6E0] to-[#FBB1B1]
        shadow-2xl border-r-4 border-[#FFB7B2] transition-all duration-300
        ${sidebarExpanded ? "w-64" : "w-20"} z-40
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b-2 border-[#FFB7B2]">
          <div className="flex items-center justify-between">
            {sidebarExpanded && (
              <div className="flex-1">
                <h1 className="text-lg font-bold text-[#D72660]">VastraVaani</h1>
                <p className="text-xs text-[#EB285D]">Fashion AI</p>
              </div>
            )}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="p-2 hover:bg-[#FFE5D0] rounded-lg transition text-[#D72660]"
              title={sidebarExpanded ? "Collapse" : "Expand"}
            >
              {sidebarExpanded ? "⏪" : "⏩"}
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b-2 border-[#FFB7B2] text-center relative">
          <img
            src={user?.photo || "https://via.placeholder.com/50"}
            alt={user?.name}
            className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-[#FFB7B2]"
          />
          {sidebarExpanded && (
            <>
              <p className="font-bold text-[#D72660] text-sm">{user?.name}</p>
              <p className="text-xs text-[#EB285D]">{user?.plan} Plan</p>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="mt-2 w-full py-1 text-xs font-semibold text-white bg-gradient-to-r from-[#FFB7B2] to-[#EB285D] rounded-lg hover:shadow-lg transition"
              >
                Settings
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                ${
                  currentPage === item.key
                    ? "bg-gradient-to-r from-[#FFB7B2] to-[#EB285D] text-white shadow-lg"
                    : "text-[#1C1917] hover:bg-[#FFE5D0]"
                }
              `}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarExpanded && (
                <span className="text-sm font-semibold">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t-2 border-[#FFB7B2]">
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-xl
              bg-red-100 hover:bg-red-200 text-red-700 font-semibold
              transition-all
            `}
            title="Logout"
          >
            <span className="text-xl">🚪</span>
            {sidebarExpanded && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`
        flex-1 transition-all duration-300
        ${sidebarExpanded ? "ml-64" : "ml-20"}
      `}>
        {/* Top Bar */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-[#FFD6E0] p-4 z-30">
          <div className="flex items-center justify-between max-w-full">
            <h2 className="text-2xl font-bold text-[#D72660]">
              {NAV_ITEMS.find(item => item.key === currentPage)?.label || "Dashboard"}
            </h2>
            <div className="flex items-center gap-4">
              {/* Quick Search */}
              <div className="hidden md:flex items-center gap-2 bg-[#FFE5D0] px-4 py-2 rounded-full border border-[#FFD6E0]">
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-[#1C1917] text-sm"
                />
                <span>🔍</span>
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 hover:bg-[#FFE5D0] rounded-full transition">
                <span className="text-xl">🔔</span>
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-[#FFE5D0] rounded-full transition"
                >
                  <img
                    src={user?.photo || "https://via.placeholder.com/32"}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full border border-[#FFD6E0]"
                  />
                  <span className="hidden sm:inline text-[#1C1917] font-semibold text-sm">
                    {user?.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#FFD6E0] z-50">
                    <button
                      onClick={() => onNavigate("profile")}
                      className="w-full text-left px-4 py-2 hover:bg-[#FFE5D0] text-[#1C1917] text-sm font-semibold transition"
                    >
                      👤 Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-[#FFE5D0] text-[#1C1917] text-sm font-semibold transition">
                      ⚙️ Settings
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-700 text-sm font-semibold transition border-t border-[#FFD6E0]"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}