// src/pages/FabricRecommender.jsx
import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const API_URL = "http://localhost:8000/api";

export default function FabricRecommender() {
  // ===== State Management =====
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [aiSummary, setAiSummary] = useState("");

  const [preferences, setPreferences] = useState({
    garment_type: "shirt",
    style_preference: "modern",
    season: "summer",
    color_preferences: [],
    fabric_preferences: [],
    budget_min: 100,
    budget_max: 5000,
    occasion: "casual",
    sustainability: false,
  });

  // ===== Handlers =====
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return setError("Please upload an image first.");
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadedImage);
      formData.append("garment_type", preferences.garment_type);

      const res = await axios.post(`${API_URL}/fabric-recommender/analyze-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImageAnalysis(res.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Error analyzing image");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleArrayInput = (key, value) => {
    const items = value.split(",").map((v) => v.trim()).filter(Boolean);
    setPreferences((prev) => ({ ...prev, [key]: items }));
  };

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...preferences,
        image_base64: imageAnalysis?.image_base64 || null,
      };
      const res = await axios.post(`${API_URL}/fabric-recommender/recommend`, payload);
      setRecommendations(res.data.recommendations);
      setAiSummary(res.data.ai_summary);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || "Error getting recommendations");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/fabric-recommender/export-pdf`,
        {
          recommendations,
          image_analysis: imageAnalysis,
          user_preferences: preferences,
          ai_summary: aiSummary,
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `fabric_recommendations_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Error exporting PDF");
    }
  };

  // ===== Theme Animations =====
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent mb-3 tracking-wide">
            🧵 VastraVaani Fabric Intelligence
          </h1>
          <p className="text-gray-300 text-lg">
            AI-driven fabric recommendations, powered by your style, season, and preferences
          </p>
        </motion.div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-8 text-sm font-semibold tracking-wide">
          {["Upload & Analyze", "Preferences", "Results"].map((label, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                  step >= i + 1
                    ? "bg-gradient-to-r from-fuchsia-600 to-pink-500 border-transparent"
                    : "border-gray-600 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`${
                  step >= i + 1 ? "text-white" : "text-gray-500"
                }`}
              >
                {label}
              </span>
              {i < 2 && <span className="text-gray-700">→</span>}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 rounded-lg p-4">
            ❌ {error}
          </div>
        )}

        {/* ===== STEP 1: IMAGE UPLOAD ===== */}
        {step === 1 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-purple-800/40"
          >
            <h2 className="text-2xl font-bold mb-6">📸 Upload Design Image</h2>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold">Garment Type</label>
                <select
                  value={preferences.garment_type}
                  onChange={(e) => handlePreferenceChange("garment_type", e.target.value)}
                  className="w-full bg-slate-800 border border-fuchsia-500/40 rounded-lg p-3 text-white"
                >
                  {["shirt", "dress", "pants", "gown", "blouse", "jacket", "skirt"].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="border-2 border-dashed border-fuchsia-500/60 rounded-xl p-8 text-center hover:border-fuchsia-400 transition-all">
                <input
                  id="upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label htmlFor="upload" className="cursor-pointer flex flex-col items-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 rounded-lg shadow-md border border-fuchsia-700/30"
                    />
                  ) : (
                    <>
                      <span className="text-6xl mb-3">📤</span>
                      <p className="text-lg">Click or drag to upload garment image</p>
                      <p className="text-sm text-gray-400">Supported: JPG, PNG (max 10MB)</p>
                    </>
                  )}
                </label>
              </div>

              <button
                onClick={analyzeImage}
                disabled={!uploadedImage || loading}
                className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-fuchsia-500/30"
              >
                {loading ? "🔍 Analyzing..." : "🔍 Analyze Image"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ===== STEP 2: PREFERENCES ===== */}
        {step === 2 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-fuchsia-800/40"
          >
            <h2 className="text-2xl font-bold mb-6">⚙️ Personalize Your Fabric Search</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["style_preference", "Style", ["modern", "traditional", "vintage", "minimalist", "bohemian"]],
                ["season", "Season", ["summer", "winter", "spring", "fall", "all-season"]],
                ["occasion", "Occasion", ["casual", "formal", "wedding", "party", "office", "festival"]],
              ].map(([key, label, options]) => (
                <div key={key}>
                  <label className="block mb-2 font-semibold">{label}</label>
                  <select
                    value={preferences[key]}
                    onChange={(e) => handlePreferenceChange(key, e.target.value)}
                    className="w-full bg-slate-800 border border-fuchsia-500/40 rounded-lg p-3"
                  >
                    {options.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div>
                <label className="block mb-2 font-semibold">Budget Min (₹)</label>
                <input
                  type="number"
                  value={preferences.budget_min}
                  onChange={(e) => handlePreferenceChange("budget_min", e.target.value)}
                  className="w-full bg-slate-800 border border-fuchsia-500/40 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Budget Max (₹)</label>
                <input
                  type="number"
                  value={preferences.budget_max}
                  onChange={(e) => handlePreferenceChange("budget_max", e.target.value)}
                  className="w-full bg-slate-800 border border-fuchsia-500/40 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Color Preferences</label>
                <input
                  type="text"
                  placeholder="e.g., Red, Blue, Green"
                  onChange={(e) => handleArrayInput("color_preferences", e.target.value)}
                  className="w-full bg-slate-800 border border-fuchsia-500/40 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Fabric Preferences</label>
                <input
                  type="text"
                  placeholder="e.g., Cotton, Silk, Linen"
                  onChange={(e) => handleArrayInput("fabric_preferences", e.target.value)}
                  className="w-full bg-slate-800 border border-fuchsia-500/40 rounded-lg p-3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.sustainability}
                    onChange={(e) => handlePreferenceChange("sustainability", e.target.checked)}
                    className="w-5 h-5 accent-pink-500"
                  />
                  <span>🌱 Prioritize sustainable fabrics</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold"
              >
                ← Back
              </button>
              <button
                onClick={getRecommendations}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 py-3 rounded-lg font-bold"
              >
                {loading ? "🔄 Loading..." : "🎯 Get Recommendations"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ===== STEP 3: RESULTS ===== */}
        {step === 3 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-fuchsia-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl p-8 border border-fuchsia-800/40 shadow-xl">
              <h2 className="text-2xl font-bold mb-4">🤖 AI Summary</h2>
              <p className="text-gray-200 leading-relaxed">{aiSummary}</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-fuchsia-800/40">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  🧶 Recommended Fabrics ({recommendations.length})
                </h2>
                <button
                  onClick={exportPDF}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold"
                >
                  📄 Export PDF
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-fuchsia-700 text-fuchsia-300">
                      <th className="p-3">Image</th>
                      <th className="p-3">Fabric Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Price/m</th>
                      <th className="p-3">Supplier</th>
                      <th className="p-3">Match</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendations.map((rec, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-800 hover:bg-slate-800/40 transition-all"
                      >
                        <td className="p-3">
                          {rec.image_url ? (
                            <img
                              src={rec.image_url}
                              alt={rec.fabric_name}
                              className="w-16 h-16 rounded object-cover border border-fuchsia-700/30"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-800 rounded flex items-center justify-center">
                              🧵
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-white">{rec.fabric_name}</p>
                          <p className="text-sm text-gray-400">{rec.ai_reasoning?.slice(0, 80)}...</p>
                        </td>
                        <td className="p-3 text-gray-300">{rec.fabric_type}</td>
                        <td className="p-3 text-gray-300">₹{rec.price_per_meter}</td>
                        <td className="p-3 text-gray-300">{rec.supplier}</td>
                        <td className="p-3">
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                            {(rec.compatibility_score * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-3">
                          <a
                            href={rec.purchase_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-fuchsia-600 hover:bg-fuchsia-700 px-4 py-2 rounded font-semibold text-white transition-all"
                          >
                            Buy 🛒
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setImageAnalysis(null);
                setRecommendations([]);
                setImagePreview(null);
              }}
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-fuchsia-500/30"
            >
              🔄 Start New Search
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
