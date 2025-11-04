// src/pages/FabricsProfessional.jsx
// Fabrics Page - Professional Theme

import React, { useState } from "react";

export default function FabricsProfessional() {
  const [selectedType, setSelectedType] = useState("all");

  const fabrics = [
    {
      id: 1,
      name: "Premium Cotton",
      type: "natural",
      properties: ["Breathable", "Soft", "Durable"],
      sustainability: "High",
      image: "https://images.unsplash.com/photo-1585499539261-3e158e9e0a26?w=500&q=80",
    },
    {
      id: 2,
      name: "Silk Blend",
      type: "luxury",
      properties: ["Lustrous", "Smooth", "Elegant"],
      sustainability: "Medium",
      image: "https://images.unsplash.com/photo-1578932750294-708xris34de?w=500&q=80",
    },
    {
      id: 3,
      name: "Organic Linen",
      type: "eco",
      properties: ["Strong", "Breathable", "Eco-friendly"],
      sustainability: "Very High",
      image: "https://images.unsplash.com/photo-1585299571304-8d07071924b3?w=500&q=80",
    },
    {
      id: 4,
      name: "Tech Polyester",
      type: "synthetic",
      properties: ["Water-resistant", "Durable", "Lightweight"],
      sustainability: "Low",
      image: "https://images.unsplash.com/photo-1570579722262-ae269acacef0?w=500&q=80",
    },
    {
      id: 5,
      name: "Recycled Polyester",
      type: "eco",
      properties: ["Sustainable", "Durable", "Affordable"],
      sustainability: "Very High",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
    },
    {
      id: 6,
      name: "Wool Blend",
      type: "natural",
      properties: ["Warm", "Elastic", "Long-lasting"],
      sustainability: "High",
      image: "https://images.unsplash.com/photo-1577572112468-c21a56f1cbd3?w=500&q=80",
    },
  ];

  const types = ["all", "natural", "luxury", "eco", "synthetic"];

  const filteredFabrics =
    selectedType === "all"
      ? fabrics
      : fabrics.filter((f) => f.type === selectedType);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-6 md:px-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-widest text-gray-500 mb-4">MATERIALS</p>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-4">
            Fabric Library
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Explore premium fabrics analyzed by our AI fabric experts. Find the
            perfect material for your designs.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 px-6 md:px-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2 text-sm font-semibold tracking-widest whitespace-nowrap transition ${
                selectedType === type
                  ? "bg-black text-white"
                  : "border border-gray-300 text-black hover:bg-gray-50"
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* Fabrics Grid */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFabrics.map((fabric) => (
            <div key={fabric.id} className="border border-gray-200 overflow-hidden group">
              <div className="relative overflow-hidden h-64">
                <img
                  src={fabric.image}
                  alt={fabric.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-black">{fabric.name}</h3>
                  <span className="text-xs font-semibold bg-gray-100 px-2 py-1 text-black">
                    {fabric.sustainability}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {fabric.properties.map((prop, i) => (
                    <span
                      key={i}
                      className="text-xs text-gray-600 border border-gray-300 px-2 py-1"
                    >
                      {prop}
                    </span>
                  ))}
                </div>
                <a
                  href="#"
                  className="text-sm font-semibold text-black hover:text-gray-600 transition"
                >
                  VIEW DETAILS →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-gray-50 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-sm font-semibold text-black mb-2">Premium Selection</p>
            <p className="text-gray-600">
              Curated collection of the finest fabrics
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-black mb-2">AI Analyzed</p>
            <p className="text-gray-600">Each fabric analyzed for quality</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-black mb-2">Sustainable</p>
            <p className="text-gray-600">Eco-friendly options available</p>
          </div>
        </div>
      </section>
    </div>
  );
}