import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export default function Pricing() {
  const [productName, setProductName] = useState("");
  const [cost, setCost] = useState("");
  const [targetMarket, setTargetMarket] = useState("mid-range");
  const [competition, setCompetition] = useState("");
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const suggestPricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/pricing/suggest`, {
        product_name: productName,
        cost: parseFloat(cost),
        target_market: targetMarket,
        competition,
      });
      setStrategy(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white font-inter px-6 py-10">
      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-10 space-y-8">
        <h1 className="text-4xl font-light tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-white to-gray-400">
          💰 Smart Pricing Strategy
        </h1>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Product Name"
            className="px-4 py-3 bg-neutral-900 text-white rounded-2xl border border-white/10 placeholder-gray-500 focus:ring-1 focus:ring-gray-400 outline-none"
          />

          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Production Cost ($)"
            className="px-4 py-3 bg-neutral-900 text-white rounded-2xl border border-white/10 placeholder-gray-500 focus:ring-1 focus:ring-gray-400 outline-none"
          />

          <select
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            className="px-4 py-3 bg-neutral-900 text-white rounded-2xl border border-white/10 focus:ring-1 focus:ring-gray-400 outline-none"
          >
            <option value="budget">Budget</option>
            <option value="mid-range">Mid-Range</option>
            <option value="premium">Premium</option>
            <option value="luxury">Luxury</option>
          </select>

          <input
            type="text"
            value={competition}
            onChange={(e) => setCompetition(e.target.value)}
            placeholder="Competition Level"
            className="px-4 py-3 bg-neutral-900 text-white rounded-2xl border border-white/10 placeholder-gray-500 focus:ring-1 focus:ring-gray-400 outline-none"
          />
        </div>

        {/* Button */}
        <button
          onClick={suggestPricing}
          disabled={!productName || !cost || loading}
          className="w-full py-3 rounded-2xl font-semibold bg-gradient-to-r from-gray-200 to-gray-400 text-black hover:from-white hover:to-gray-300 transition-all disabled:opacity-40"
        >
          {loading ? "🔄 Analyzing..." : "📊 Get Pricing Strategy"}
        </button>

        {/* Error message */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/40 text-red-300 p-3 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* Strategy Output */}
        {strategy && (
          <div className="mt-8 bg-neutral-900/70 border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-3">
              📈 Suggested Strategy
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {strategy.strategy}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
