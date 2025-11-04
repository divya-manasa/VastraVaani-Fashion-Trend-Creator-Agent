import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export default function Design() {
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("modern");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateDesign = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/design/generate`, {
        description,
        style,
      });
      setImageUrl(res.data.image_url);
    } catch (err) {
      setError(err.response?.data?.detail || "Error generating design");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 text-white px-4 py-10 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            🎨 VastraVaani AI Design Generator
          </h1>
          <p className="text-gray-400 text-lg">
            Create unique, AI-powered fashion concepts in seconds ✨
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-purple-900/30 to-fuchsia-900/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Design Description */}
          <div>
            <label className="block text-purple-300 font-semibold mb-2">
              📝 Design Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your design (e.g., ‘An elegant lavender saree with silver embroidery’)"
              rows="4"
              className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-purple-500/30 focus:border-fuchsia-500 outline-none placeholder-gray-500 transition-all"
            />
          </div>

          {/* Style Dropdown */}
          <div>
            <label className="block text-purple-300 font-semibold mb-2">
              🎭 Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-purple-500/30 focus:border-fuchsia-500 outline-none transition-all"
            >
              <option value="modern">Modern</option>
              <option value="vintage">Vintage</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="bohemian">Bohemian</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateDesign}
            disabled={!description || loading}
            className="w-full py-3 font-bold text-lg rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "⏳ Generating..." : "🚀 Generate Design"}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/50 text-red-300 px-5 py-3 rounded-xl text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Generated Output */}
          {imageUrl && (
            <div className="mt-10 text-center space-y-6">
              <h2 className="text-2xl font-semibold text-fuchsia-400">
                ✨ Your AI-Generated Fashion Design
              </h2>
              <img
                src={imageUrl}
                alt="Generated Design"
                className="w-full rounded-2xl border border-fuchsia-500/30 shadow-2xl transition-transform hover:scale-[1.02]"
              />
              <a
                href={imageUrl}
                download
                className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold rounded-xl hover:opacity-90 transition-all"
              >
                📥 Download Design
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
