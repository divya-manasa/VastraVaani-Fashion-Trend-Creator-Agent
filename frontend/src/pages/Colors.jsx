// src/pages/ColorPatternAnalyzer.jsx
// VastraVaani – Color & Pattern Analysis Agent (AI-Powered)

import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export default function ColorPatternAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const analyzeImage = async () => {
    if (!uploadedImage) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadedImage);

      const res = await axios.post(`${API_URL}/color-pattern-analyzer/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });

      setAnalysisResults(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Analysis failed";
      setError(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent drop-shadow-lg mb-3">
            🎨 VastraVaani Color & Pattern Analyzer
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Discover color palettes, detect fabric patterns, and gain AI-driven fashion insights — all from your design images.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 rounded-xl p-4 mb-6 shadow-lg">
            {error}
          </div>
        )}

        {/* Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-slate-800/60 backdrop-blur-md border border-purple-500/40 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <h2 className="text-2xl font-semibold mb-5">📸 Upload Design</h2>

            <div className="border-2 border-dashed border-purple-500 rounded-xl p-8 text-center mb-6 hover:bg-slate-900/30 transition-all">
              <input
                type="file"
                accept="image/*"
                id="upload"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="upload" className="cursor-pointer flex flex-col items-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 rounded-lg mb-4 border border-purple-500/30 shadow-lg"
                  />
                ) : (
                  <>
                    <div className="text-5xl mb-3">📤</div>
                    <p className="text-lg font-semibold text-gray-300 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-400">Supports JPG, PNG (max 10MB)</p>
                  </>
                )}
              </label>
            </div>

            <button
              onClick={analyzeImage}
              disabled={loading || !uploadedImage}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 font-bold rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "🔄 Analyzing..." : "✨ Analyze Image"}
            </button>
          </div>

          {/* Results Section */}
          {analysisResults && (
            <div className="space-y-6">
              {/* Analyzed Image */}
              <div className="bg-slate-800/60 border border-purple-500/30 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">✅ Analyzed Image</h3>
                <img
                  src={analysisResults.image_base64}
                  alt="Analyzed Output"
                  className="w-full rounded-lg border border-purple-600/30 shadow-md"
                />
              </div>

              {/* Pattern Info */}
              {analysisResults.pattern_analysis && (
                <div className="bg-slate-800/60 border border-pink-500/30 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">🔍 Pattern Analysis</h3>
                  <div className="space-y-3">
                    <p>
                      <span className="text-gray-400 text-sm">Type:</span>{" "}
                      <span className="font-semibold capitalize text-pink-400">
                        {analysisResults.pattern_analysis.type}
                      </span>
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {analysisResults.pattern_analysis.description}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400 mb-1">Confidence</p>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{
                            width: `${analysisResults.pattern_analysis.confidence * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs mt-1 text-gray-400">
                        {(analysisResults.pattern_analysis.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dominant Colors */}
        {analysisResults?.dominant_colors && (
          <div className="mt-10 bg-slate-800/60 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6">🎨 Dominant Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {analysisResults.dominant_colors.map((color, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-full h-24 md:h-32 rounded-lg mb-2 border border-gray-700 shadow-md"
                    style={{ backgroundColor: color.hex }}
                  />
                  <p className="text-sm font-semibold">{color.name}</p>
                  <p className="text-xs text-gray-400">{color.hex}</p>
                  <p className="text-xs text-gray-500">{color.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Color Palette */}
        {analysisResults?.color_palette && (
          <div className="mt-10 bg-slate-800/60 backdrop-blur-md border border-pink-500/30 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-6">🌈 AI-Generated Palette</h2>
            <p className="text-sm text-gray-400 mb-3">
              Harmony Type:{" "}
              <span className="font-semibold text-pink-400 capitalize">
                {analysisResults.color_palette.harmony_type}
              </span>
            </p>

            {/* Primary Color */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-24 h-24 rounded-lg shadow-lg border-2 border-gray-700"
                style={{
                  backgroundColor: analysisResults.color_palette.primary.hex,
                }}
              />
              <div>
                <p className="font-semibold text-lg">
                  {analysisResults.color_palette.primary.name}
                </p>
                <p className="text-gray-400 text-sm">
                  {analysisResults.color_palette.primary.hex}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  RGB(
                  {analysisResults.color_palette.primary.rgb.r},{" "}
                  {analysisResults.color_palette.primary.rgb.g},{" "}
                  {analysisResults.color_palette.primary.rgb.b})
                </p>
              </div>
            </div>

            {/* Secondary + Complementary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analysisResults.color_palette.secondary?.map((c, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-full h-20 rounded-lg mb-2 border border-gray-700"
                    style={{ backgroundColor: c.hex }}
                  />
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.hex}</p>
                </div>
              ))}
              {analysisResults.color_palette.complementary && (
                <div className="text-center">
                  <div
                    className="w-full h-20 rounded-lg mb-2 border border-gray-700"
                    style={{
                      backgroundColor:
                        analysisResults.color_palette.complementary.hex,
                    }}
                  />
                  <p className="text-sm font-semibold">
                    {analysisResults.color_palette.complementary.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {analysisResults.color_palette.complementary.hex}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {analysisResults?.ai_insights && (
          <div className="mt-10 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-600/40 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-3">🤖 AI Insights</h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              {analysisResults.ai_insights}
            </p>
          </div>
        )}

        {/* Styling Recommendations */}
        {analysisResults?.styling_recommendations && (
          <div className="mt-6 bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-600/40 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-3">👗 Styling Recommendations</h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              {analysisResults.styling_recommendations}
            </p>
          </div>
        )}

        {/* Reset Button */}
        {analysisResults && (
          <button
            onClick={() => {
              setAnalysisResults(null);
              setUploadedImage(null);
              setImagePreview(null);
              setError(null);
            }}
            className="w-full mt-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 rounded-lg py-3 font-bold shadow-lg transition-all"
          >
            🔄 Analyze Another Image
          </button>
        )}
      </div>
    </div>
  );
}
