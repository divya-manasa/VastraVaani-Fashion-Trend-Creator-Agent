// src/App.jsx
// VastraVaani - Complete Platform with Authentication & Dashboard

import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Import all page components
import Home from "./pages/Home";
import Trends from "./pages/Trends";
import Colors from "./pages/Colors";
import FabricRecommender from "./pages/FabricRecommender";
import Stylist from "./pages/Stylist";
import Pricing from "./pages/Pricing";
import Bookmarks from "./pages/Bookmarks";
import ARTryOn from "./pages/ARTryOn";
import Profile from "./pages/Profile";
import DesignGenerator from "./pages/DesignGenerator";
import Design from "./pages/Design";

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFE5D0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFD6E0] mx-auto mb-4 flex items-center justify-center text-4xl animate-pulse">
            👗
          </div>
          <p className="text-[#1C1917] font-semibold">Loading VastraVaani...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login/register
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFE5D0] to-[#FFD6E0]">
        {authMode === "login" ? (
          <Login
            onAuthSuccess={() => setCurrentPage("home")}
            onToggleMode={() => setAuthMode("register")}
          />
        ) : (
          <Register
            onAuthSuccess={() => setCurrentPage("home")}
            onToggleMode={() => setAuthMode("login")}
          />
        )}
      </div>
    );
  }

  // Render the appropriate page content
  const renderContent = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "generator":
        return <DesignGenerator />;
      case "design":
        return <Design />;
      case "trends":
        return <Trends />;
      case "fabric-ai":
        return <FabricRecommender />;
      case "colors":
        return <Colors />;
      case "stylist":
        return <Stylist />;
      case "pricing":
        return <Pricing />;
      case "bookmarks":
        return <Bookmarks />;
      case "ar-tryon":
        return <ARTryOn />;
      case "profile":
        return <Profile />;
      default:
        return <Home />;
    }
  };

  // Authenticated user - render dashboard
  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      user={user}
      onLogout={() => {
        logout();
        setCurrentPage("home");
      }}
    >
      <div className="transition-all duration-300 ease-in-out">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}