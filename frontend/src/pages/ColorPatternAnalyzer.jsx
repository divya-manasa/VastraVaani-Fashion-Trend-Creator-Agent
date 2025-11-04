import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api/color-pattern-analyzer";

export default function Colors() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze colors
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        `${API_URL}/analyze-llm`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAnalysis(response.data);
      setAnalyzing(false);
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.message || 
        "Error analyzing image. Make sure backend is running."
      );
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFE5D0] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-[#1C1917] mb-4">
            🎨 AI Color Analysis
          </h1>
          <p className="text-xl text-[#5C5C5C]">
            Upload an image to get AI-powered color analysis and recommendations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="md:col-span-1">
            <div className="bg-white/80 rounded-xl p-8 shadow-lg sticky top-8">
              <h2 className="text-2xl font-bold text-[#1C1917] mb-6">
                📤 Upload Image
              </h2>

              {/* File Input */}
              <div className="mb-6">
                <label className="block">
                  <div className="border-2 border-dashed border-[#FFB7B2] rounded-lg p-6 text-center cursor-pointer hover:border-[#EB285D] transition bg-[#FFE5D0]/50">
                    <p className="text-3xl mb-2">📷</p>
                    <p className="text-[#1C1917] font-bold">
                      Click to upload
                    </p>
                    <p className="text-sm text-[#5C5C5C]">
                      PNG, JPG, or GIF
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preview */}
              {preview && (
                <div className="mb-6">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || analyzing}
                className={`w-full py-3 rounded-lg font-bold text-white transition ${
                  analyzing || !selectedFile
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#EB285D] to-[#D72660] hover:shadow-lg"
                }`}
              >
                {analyzing ? "🔄 Analyzing..." : "✨ Analyze Colors"}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="md:col-span-2">
            {analysis ? (
              <div className="space-y-6">
                {/* Dominant Colors */}
                <div className="bg-white/80 rounded-xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-[#1C1917] mb-6">
                    🎯 Dominant Colors
                  </h3>
                  <div className="space-y-4">
                    {analysis.dominant_colors.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-lg shadow-md border-2 border-white"
                          style={{ backgroundColor: color.hex }}
                          title={color.hex}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-[#1C1917]">
                            {color.name}
                          </p>
                          <p className="text-sm text-[#5C5C5C]">
                            {color.hex} • {color.percentage}%
                          </p>
                          <p className="text-sm text-[#EB285D] italic">
                            {color.psychology}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pattern Analysis */}
                <div className="bg-white/80 rounded-xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-[#1C1917] mb-4">
                    🔍 Pattern Analysis
                  </h3>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-[#1C1917]">
                      {analysis.pattern_analysis.type}
                    </p>
                    <p className="text-[#5C5C5C]">
                      {analysis.pattern_analysis.description}
                    </p>
                    <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-[#FFB7B2] to-[#EB285D] h-2 rounded-full"
                        style={{
                          width: `${analysis.pattern_analysis.confidence}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-[#5C5C5C] mt-2">
                      Confidence: {analysis.pattern_analysis.confidence}%
                    </p>
                  </div>
                </div>

                {/* LLM Recommendations */}
                <div className="bg-white/80 rounded-xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-[#1C1917] mb-6">
                    🤖 AI Recommendations
                  </h3>

                  {/* Summary */}
                  <div className="mb-6 p-4 bg-[#FFE5D0] rounded-lg border-l-4 border-[#EB285D]">
                    <p className="text-[#1C1917] font-semibold">
                      {analysis.llm_analysis_summary}
                    </p>
                  </div>

                  {/* Recommended Colors */}
                  <div className="space-y-4">
                    {analysis.llm_recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-[#EB285D] pl-4 py-3"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-10 h-10 rounded-lg shadow-md"
                            style={{ backgroundColor: rec.color_hex }}
                            title={rec.color_hex}
                          />
                          <div>
                            <p className="font-bold text-[#1C1917]">
                              {rec.color_name}
                            </p>
                            <p className="text-xs text-[#5C5C5C]">
                              {rec.color_hex}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="font-semibold text-[#1C1917]">
                              Why it works:
                            </p>
                            <p className="text-[#5C5C5C]">{rec.reason}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-[#1C1917]">
                              Use case:
                            </p>
                            <p className="text-[#5C5C5C]">{rec.use_case}</p>
                          </div>
                        </div>

                        <div className="mt-2 p-2 bg-[#FFE5D0]/50 rounded">
                          <p className="text-xs text-[#1C1917]">
                            <strong>Psychology:</strong> {rec.psychology}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="py-3 bg-[#FFD6E0] text-[#1C1917] rounded-lg font-bold hover:bg-[#FFB7B2] transition">
                    💾 Save Analysis
                  </button>
                  <button
                    onClick={() => {
                      setAnalysis(null);
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    className="py-3 bg-[#FFB7B2] text-[#1C1917] rounded-lg font-bold hover:bg-[#FF9FA0] transition"
                  >
                    🔄 New Upload
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 rounded-xl p-12 shadow-lg text-center">
                <p className="text-[#5C5C5C] text-lg">
                  👈 Upload an image and click "Analyze Colors" to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}