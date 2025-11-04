import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export default function TrendsAdvancedOnly() {
  // Advanced Trends
  const [advTheme, setAdvTheme] = useState("Streetwear 2025");
  const [platforms, setPlatforms] = useState(["instagram", "pinterest"]);
  const [hashtags, setHashtags] = useState("#streetwear #fashion2025");
  const [keywords, setKeywords] = useState("oversized, vintage");
  const [advRegion, setAdvRegion] = useState("global");
  const [timeRange, setTimeRange] = useState("30");
  const [depth, setDepth] = useState("detailed");
  const [advResult, setAdvResult] = useState(null);
  const [advLoading, setAdvLoading] = useState(false);
  const [advError, setAdvError] = useState(null);

  const fetchAdvancedTrends = async () => {
    setAdvLoading(true);
    setAdvError(null);
    try {
      const res = await axios.post(`${API_URL}/advanced-trends/analyze-advanced`, {
        theme: advTheme,
        platforms: platforms,
        hashtags: hashtags.split(" ").filter((h) => h.length > 0),
        keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0),
        region: advRegion,
        time_range: timeRange,
        output_format: "detailed",
        depth: depth,
      });
      setAdvResult(res.data.data);
    } catch (err) {
      setAdvError(err.response?.data?.detail || err.message);
    }
    setAdvLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-black min-h-screen text-white">
      {/* ADVANCED TRENDS SECTION */}
      <div className="bg-gradient-to-br from-gray-900/70 to-gray-800/40 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <h1 className="text-4xl font-light tracking-wide text-white mb-4">
          Advanced Trend Analysis
        </h1>
        <p className="text-gray-400 mb-8">
          Real-time web scraping · AI-based insights · Monochrome visual analytics
        </p>

        <div className="space-y-6">
          {/* Trend Theme Input */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">Trend Theme</label>
            <input
              type="text"
              value={advTheme}
              onChange={(e) => setAdvTheme(e.target.value)}
              placeholder="e.g., Streetwear 2025, Minimalism, Sustainable Fashion"
              className="w-full px-4 py-3 bg-gray-900 text-gray-100 rounded-xl border border-white/10 outline-none focus:border-white/30 transition"
            />
          </div>

          {/* Platforms Selection */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">Platforms</label>
            <div className="flex gap-6 flex-wrap text-gray-300">
              {["instagram", "pinterest", "tiktok"].map((platform) => (
                <label key={platform} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={platforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) setPlatforms([...platforms, platform]);
                      else setPlatforms(platforms.filter((p) => p !== platform));
                    }}
                    className="w-4 h-4 accent-white bg-gray-900 border border-gray-500"
                  />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Hashtags and Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 font-medium mb-2">Hashtags</label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#streetwear #fashion2025 #ootd"
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 rounded-xl border border-white/10 focus:border-white/30 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="oversized, vintage, sustainable"
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 rounded-xl border border-white/10 focus:border-white/30 outline-none transition"
              />
            </div>
          </div>

          {/* Region, Time Range, Depth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-300 font-medium mb-2">Region</label>
              <select
                value={advRegion}
                onChange={(e) => setAdvRegion(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 rounded-xl border border-white/10 focus:border-white/30 outline-none transition"
              >
                <option value="global">Global</option>
                <option value="asia">Asia</option>
                <option value="europe">Europe</option>
                <option value="america">Americas</option>
                <option value="africa">Africa</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Time Range (days)</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 rounded-xl border border-white/10 focus:border-white/30 outline-none transition"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Analysis Depth</label>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 rounded-xl border border-white/10 focus:border-white/30 outline-none transition"
              >
                <option value="basic">Basic</option>
                <option value="detailed">Detailed</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>
          </div>

          {/* Analysis Button */}
          <button
            onClick={fetchAdvancedTrends}
            disabled={advLoading}
            className="w-full bg-gradient-to-r from-gray-200 to-gray-400 text-black py-3 rounded-xl font-semibold tracking-wide hover:from-gray-100 hover:to-gray-300 transition shadow-[0_0_10px_rgba(255,255,255,0.2)] disabled:opacity-50"
          >
            {advLoading
              ? "Analyzing... Please wait ⏳"
              : "Start Advanced Analysis"}
          </button>

          {/* Error Message */}
          {advError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
              {advError}
            </div>
          )}

          {/* Results Section */}
          {advResult && (
            <div className="space-y-10 mt-10">
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  ["Posts Analyzed", advResult.metrics?.total_posts],
                  ["Instagram", advResult.metrics?.instagram],
                  ["Pinterest", advResult.metrics?.pinterest],
                  ["Hashtags", advResult.metrics?.unique_hashtags],
                ].map(([label, value], i) => (
                  <div
                    key={i}
                    className="bg-gray-900/70 rounded-xl p-5 border border-white/10"
                  >
                    <p className="text-gray-400 text-sm">{label}</p>
                    <p className="text-2xl font-bold text-gray-100">{value || 0}</p>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              {advResult.charts && (
                <div className="space-y-8">
                  {Object.entries(advResult.charts).map(([key, chart]) => (
                    <div
                      key={key}
                      className="bg-gray-900/70 border border-white/10 rounded-xl p-6"
                    >
                      <h4 className="text-lg font-medium text-gray-200 mb-4 capitalize">
                        {key.replace("_", " ")}
                      </h4>
                      <img
                        src={chart}
                        alt={key}
                        className="w-full rounded-xl"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Insights Section */}
              {advResult.insights && (
                <div className="space-y-8">
                  {advResult.insights.ai_forecast && (
                    <div className="bg-gray-900/70 border border-white/10 rounded-xl p-6">
                      <h3 className="text-xl font-medium text-gray-200 mb-3">AI Forecast</h3>
                      <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {advResult.insights.ai_forecast}
                      </p>
                    </div>
                  )}

                  {advResult.insights.recommendations && (
                    <div className="bg-gray-900/70 border border-white/10 rounded-xl p-6">
                      <h3 className="text-xl font-medium text-gray-200 mb-4">AI Recommendations</h3>
                      <ul className="space-y-2">
                        {advResult.insights.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-gray-300 flex items-start gap-2">
                            <span className="text-gray-500">—</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
