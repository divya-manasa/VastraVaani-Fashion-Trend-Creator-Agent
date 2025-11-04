import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export default function DesignGenerator() {
  const [step, setStep] = useState(1);

  // Inputs
  const [gender, setGender] = useState("Female");
  const [outfitType, setOutfitType] = useState("Lehenga");
  const [occasion, setOccasion] = useState("Wedding");
  const [colors, setColors] = useState("Lavender, Silver");
  const [fabricPref, setFabricPref] = useState("Silk");
  const [region, setRegion] = useState("Indian");
  const [styleKeywords, setStyleKeywords] = useState("embroidered, elegant");
  const [designDescription, setDesignDescription] = useState("");

  // Generated Data
  const [summary, setSummary] = useState("");
  const [prompt, setPrompt] = useState("");
  const [fabrics, setFabrics] = useState([]);
  const [collage, setCollage] = useState(null);
  const [inspirationCount, setInspirationCount] = useState(0);
  const [generatedImage, setGeneratedImage] = useState(null);

  const [useRefiner, setUseRefiner] = useState(true);
  const [downloadFormat, setDownloadFormat] = useState("png");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const femaleOutfits = [
    "Lehenga", "Saree", "Kurti", "Gown", "Anarkali", "Western Dress", "Sharara", "Jumpsuit"
  ];
  const maleOutfits = [
    "Sherwani", "Suit", "Dhoti", "Kurta", "Shirt", "Blazer", "Traditional Wear", "Casual Outfit"
  ];

  const getOutfitOptions = () => (gender === "Male" ? maleOutfits : femaleOutfits);

  // --- API Calls ---
  const generatePrompt = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/design-generator/generate-prompt`, {
        outfit_type: outfitType,
        occasion,
        gender,
        colors: colors.split(",").map(c => c.trim()),
        fabric_preference: fabricPref,
        regional_preference: region,
        style_keywords: styleKeywords.split(",").map(k => k.trim()),
        design_description: designDescription,
      });
      setSummary(res.data.summary);
      setPrompt(res.data.prompt);
      setFabrics(res.data.fabrics);
      setCollage(res.data.inspiration_collage);
      setInspirationCount(res.data.inspiration_count);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Error generating prompt");
    }
    setLoading(false);
  };

  const generateImage = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/design-generator/generate-image`, {
        prompt,
        use_refiner: useRefiner,
      });
      setGeneratedImage(res.data.image);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || "Error generating image");
    }
    setLoading(false);
  };

  const downloadImage = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/design-generator/download-image`,
        null,
        {
          params: { prompt, format: downloadFormat, use_refiner: useRefiner },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `vastravaani-design.${downloadFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  const reset = () => {
    setStep(1);
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 text-white px-4 py-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-3">
            👗 VastraVaani AI Design Generator
          </h1>
          <p className="text-gray-400 text-lg tracking-wide">
            Generate Custom Fashion Designs • Powered by Pinterest + AI
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center items-center gap-4 text-sm">
          {["Design Input", "Preview & Refine", "Generated Output"].map(
            (label, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 ${
                  step >= i + 1 ? "text-pink-400" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= i + 1
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-gray-700"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="hidden sm:inline">{label}</span>
              </div>
            )
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-400/50 text-red-300 px-6 py-3 rounded-xl text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-gradient-to-br from-purple-900/30 to-fuchsia-900/20 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-purple-300 mb-6">
              ✨ Design Input Details
            </h2>

            {/* Gender */}
            <div className="flex gap-4 mb-6">
              {["Female", "Male"].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGender(g);
                    setOutfitType(
                      g === "Female" ? femaleOutfits[0] : maleOutfits[0]
                    );
                  }}
                  className={`flex-1 py-3 font-bold rounded-xl transition ${
                    gender === g
                      ? "bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white shadow-lg"
                      : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                  }`}
                >
                  {g === "Female" ? "👗 Female" : "👔 Male"}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <select
                value={outfitType}
                onChange={(e) => setOutfitType(e.target.value)}
                className="bg-slate-900/80 border border-purple-500/30 rounded-lg px-4 py-3"
              >
                {getOutfitOptions().map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>

              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="bg-slate-900/80 border border-purple-500/30 rounded-lg px-4 py-3"
              >
                <option>Wedding</option>
                <option>Partywear</option>
                <option>Festival</option>
                <option>Casual</option>
                <option>Office</option>
              </select>
            </div>

            <input
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="Colors (comma-separated)"
              className="w-full mb-4 bg-slate-900/80 border border-purple-500/30 rounded-lg px-4 py-3"
            />

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <select
                value={fabricPref}
                onChange={(e) => setFabricPref(e.target.value)}
                className="bg-slate-900/80 border border-purple-500/30 rounded-lg px-4 py-3"
              >
                <option>Silk</option>
                <option>Cotton</option>
                <option>Satin</option>
                <option>Velvet</option>
              </select>

              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="bg-slate-900/80 border border-purple-500/30 rounded-lg px-4 py-3"
              >
                <option>Indian</option>
                <option>Western</option>
                <option>Fusion</option>
              </select>
            </div>

            <input
              value={styleKeywords}
              onChange={(e) => setStyleKeywords(e.target.value)}
              placeholder="Style keywords (e.g., embroidered, elegant)"
              className="w-full mb-4 bg-slate-900/80 border border-purple-500/30 rounded-lg px-4 py-3"
            />
            <textarea
              value={designDescription}
              onChange={(e) => setDesignDescription(e.target.value)}
              placeholder="Describe your design vision..."
              rows={3}
              className="w-full mb-6 bg-slate-900/80 border border-purple-500/30 rounded-lg px-4 py-3"
            />

            <button
              onClick={generatePrompt}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 hover:opacity-90 transition"
            >
              {loading ? "⏳ Generating..." : "🚀 Generate Design Inspirations"}
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-8">
            {collage && (
              <div className="bg-slate-900/50 border border-purple-400/30 rounded-2xl p-6 backdrop-blur-lg">
                <h3 className="text-xl font-semibold text-purple-300 mb-3">
                  📌 Pinterest Inspirations ({inspirationCount})
                </h3>
                <img src={collage} alt="collage" className="rounded-xl shadow-lg" />
              </div>
            )}

            <div className="bg-slate-900/50 border border-purple-400/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-purple-300 mb-3">
                ✏️ AI Image Prompt
              </h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full bg-slate-950/70 border border-purple-400/30 rounded-lg px-4 py-3 text-sm font-mono"
              />
            </div>

            <div className="flex justify-between items-center max-w-3xl mx-auto">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-slate-800 rounded-lg font-semibold hover:bg-slate-700"
              >
                ← Back
              </button>
              <button
                onClick={generateImage}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 rounded-lg font-bold hover:opacity-90"
              >
                🎨 Generate AI Design →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-8">
            {generatedImage && (
              <div className="bg-slate-900/60 border border-pink-400/30 rounded-2xl p-6 text-center">
                <h3 className="text-2xl font-semibold text-pink-400 mb-4">
                  💫 Your AI-Generated Design
                </h3>
                <img
                  src={generatedImage}
                  alt="AI Design"
                  className="rounded-xl mx-auto shadow-2xl"
                />
              </div>
            )}

            <div className="flex justify-center gap-4">
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value)}
                className="bg-slate-900 border border-purple-400/30 rounded-lg px-4 py-2"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
              <button
                onClick={downloadImage}
                className="px-6 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-lg font-bold hover:opacity-90"
              >
                📥 Download
              </button>
            </div>

            <button
              onClick={reset}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold rounded-xl hover:opacity-90"
            >
              🔁 Create New Design
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
