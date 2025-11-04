// src/pages/HomeCarousel.jsx
// VastraVaani - Carousel Hero Home Page (Marcella Inspired)

import React, { useState, useEffect } from "react";

export default function HomeCarousel({ onNavigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const heroSlides = [
    {
      id: 1,
      title: "VASTRAVAANI ON YOU!",
      subtitle: "Experience AI-powered fashion in our latest collection this season",
      images: [
        "https://i.pinimg.com/736x/b1/35/df/b135df3c0e7ecb4e457bdf43e5778355.jpg",
        "https://i.pinimg.com/736x/de/f1/8d/def18d9fd555f241780233e547b76e28.jpg",
        "https://i.pinimg.com/1200x/12/c0/e5/12c0e5d58f921f4bc9466f6026f20b83.jpg",
      ],
      cta: "EXPLORE COLLECTION",
    },
    {
      id: 2,
      title: "DESIGN YOUR STYLE",
      subtitle: "AI-powered design tools for modern fashion",
      images: [
        "https://imgs.search.brave.com/TbRa2jFrcjfHJpcmUp8H1CitiPzlBw9H1zaYS0YIytY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNzA3/NDM3NzEzL3Bob3Rv/L3BvcnRyYWl0LW9m/LXNlcmlvdXMtYmxh/Y2stbWFuLXdlYXJp/bmctc3VuZ2xhc3Nl/cy5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9Vkw2MFVybkNO/Q3R5LUJXYVFUVG45/RGxpdnpRd3NKV0I4/Ty1CU29iZnh4ST0",
        "https://imgs.search.brave.com/NTdOfG0lsCfL6aPnx713ENdgIacR1pMSnIwC0qd11Bo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTc0/NDk2NTg2L3Bob3Rv/L2hhbmRzb21lLXlv/dW5nLWd1eS1zdGFu/ZGluZy1jYXN1YWxs/eS5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9STh1TDkzYzRV/LVIzTDZGWkY5ZDJJ/bUdaZjZmUDNGWGM4/N1Y4dlE2NW9laz0",
        "https://imgs.search.brave.com/MKnku8lLEyKPmkppswBMpfn7UHFjNifsKsqF5eU3XOg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNjky/OTA5OTIyL3Bob3Rv/L2hlcy1vZmYtb24t/YW4tYWR2ZW50dXJl/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz1QREd1SU0weW9C/RjZyb0dJRHdtSlhP/RGU4ZklSWldhd21q/T0U0Um5iN2ZBPQ",
      ],
      cta: "START DESIGNING",
    },
  ];

  const currentHero = heroSlides[currentSlide];

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, heroSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Carousel Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Main Hero Grid - 3 Images */}
        <div className="absolute inset-0 grid grid-cols-3 gap-0">
          {currentHero.images.map((img, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden group"
              onMouseEnter={() => setAutoPlay(false)}
              onMouseLeave={() => setAutoPlay(true)}
            >
              <img
                src={img}
                alt={`Slide ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
            </div>
          ))}
        </div>

        {/* Text Overlay - Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <div className="text-center text-white drop-shadow-lg max-w-3xl px-6">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight">
              {currentHero.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              {currentHero.subtitle}
            </p>
            <button
              onClick={() => onNavigate("generator")}
              className="bg-black hover:bg-gray-900 text-white px-12 py-4 font-bold text-lg tracking-widest transition"
            >
              {currentHero.cta}
            </button>
          </div>
        </div>

        {/* Slide Indicators - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-30">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === idx
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-3 transition"
        >
          ← PREV
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % heroSlides.length)}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-3 transition"
        >
          NEXT →
        </button>
      </section>

      {/* Featured Section */}
      <section className="py-20 px-6 md:px-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-widest text-gray-500 mb-4">NEW IN</p>
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-8">
            This Season's Highlights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Design Studio",
                desc: "Create stunning designs instantly",
                emoji: "✨",
                image: "https://imgs.search.brave.com/WPB9JsSZkQ-qbIiGEWLcwCHg4MzRxRFC2Abh9TlH8yA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9mYXNo/aW9uLWNyZWF0aXZl/LWRlc2lnbi1zdHVk/aW8taW50ZXJpb3It/Y29uY2VwdC1haS1n/ZW5lcmF0aXZlLTI4/OTYwNzczOC5qcGc",
              },
              {
                title: "Virtual Try-On",
                desc: "See yourself in any outfit",
                emoji: "👓",
                image: "https://imgs.search.brave.com/wjwmVdBtwImqgujv4IGvRgvcRJyUNpLZEs3yH4VKMrM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wLnR1/cmJvc3F1aWQuY29t/L3RzLXRodW1iL204/L1JJZFVKVC9YNC9h/c2lhbl9idXNpbmVz/c3dvbWFuX2luX2Zv/cm1hbF9zdWl0X2Z1/cl9yaWdnZWRfMDAw/L2pwZy8xNzE1Nzgz/MTE5LzMwMHgzMDAv/c2hhcnBfZml0X3E4/NS9kNmZhYzZiZTI5/YTZiZjIwNTAwZmUw/ZjVkOWJmMGM5ZjQx/NzhiN2RlL2FzaWFu/X2J1c2luZXNzd29t/YW5faW5fZm9ybWFs/X3N1aXRfZnVyX3Jp/Z2dlZF8wMDAuanBn",
              },
              {
                title: "Trend Analytics",
                desc: "Stay ahead of fashion trends",
                emoji: "📊",
                image: "https://www.simplilearn.com/ice9/free_resources_article_thumb/data_analyticstrendsmin.jpg",
              },
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative overflow-hidden mb-6 h-80">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                </div>
                <div className="text-2xl mb-2">{item.emoji}</div>
                <h3 className="text-2xl font-bold text-black mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.desc}</p>
                <a href="#" className="text-black font-semibold hover:text-gray-600 transition">
                  DISCOVER →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-widest text-gray-500 mb-4">COLLECTIONS</p>
          <h2 className="text-3xl font-bold text-black mb-12">
            Explore Our AI Collections
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "Minimalism", count: "150+ Items", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80" },
              { title: "Sustainable", count: "200+ Items", image: "https://imgs.search.brave.com/OZpZMYTeb5fo1gjzx6iFPjC9b0OYAKFumXWj6BNNhas/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9iLnNo/ZS1idXkuY29tL3dw/LWNvbnRlbnQvdXBs/b2Fkcy9UeXBlcy1v/Zi1TdXN0YWluYWJs/ZS1GYWJyaWNzLUlu/bm92YXRpdmUtRmFi/cmljcy5qcGc" },
              { title: "Contemporary", count: "180+ Items", image: "https://media.istockphoto.com/id/679419590/photo/rolls-of-cloth-for-sale-in-a-fabric-shop-in-rome-italy.jpg?s=612x612&w=0&k=20&c=OwKBmYgIAxj6xWpNy99_eQRFdPCFQnPCJMCHWa27ahc=" },
              { title: "Luxury", count: "120+ Items", image: "https://imgs.search.brave.com/2jUjpPw1rYebB7pHgJBHDDWsZCrW-hDe5aRdrpoRt_Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTMz/MTg4NTU1Ni9waG90/by9jbG9zZS11cC1v/Zi1jbG90aGVzLWhh/bmdpbmctb24td2lu/ZG93LWF0LXN0b3Jl/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz1qdEZ6a2ZSNTl2/a1d4RHZVWXZGUUJK/RmE5bm9QS3R3U2M2/VzJVZ3FUakd3PQ" },
            ].map((collection, i) => (
              <div key={i} className="relative overflow-hidden group h-80">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">{collection.title}</h3>
                  <p className="text-sm text-white/80">{collection.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: "11", label: "AI Agents", desc: "Specialized experts" },
              { num: "1000+", label: "Designs", desc: "Ready to use" },
              { num: "50K+", label: "Colors", desc: "Perfect palettes" },
              { num: "24/7", label: "Support", desc: "Always here" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-5xl font-bold text-black mb-2">{stat.num}</p>
                <p className="font-bold text-black mb-1">{stat.label}</p>
                <p className="text-gray-600 text-sm">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Transform Your Fashion?
          </h2>
          <p className="text-lg text-white/80 mb-10">
            Join thousands using VASTRAVAANI's AI-powered tools to create amazing fashion.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button
              onClick={() => onNavigate("generator")}
              className="px-12 py-4 bg-white text-black hover:bg-gray-100 font-bold text-lg tracking-widest transition"
            >
              GET STARTED
            </button>
            <button
              onClick={() => onNavigate("trends")}
              className="px-12 py-4 border-2 border-white text-white hover:bg-white hover:text-black font-bold text-lg tracking-widest transition"
            >
              EXPLORE TRENDS
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-200 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-black mb-4">VASTRAVAANI</h4>
              <p className="text-sm text-gray-600">
                AI-powered fashion intelligence platform
              </p>
            </div>
            {[
              { title: "SHOP", items: ["New", "Collections", "Sale"] },
              { title: "COMPANY", items: ["About", "Contact", "Blog"] },
              { title: "CONNECT", items: ["Instagram", "Twitter", "Pinterest"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold text-black mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.items.map((item, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-gray-600 hover:text-black transition">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>© 2025 VASTRAVAANI. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-black">
                Privacy
              </a>
              <a href="#" className="hover:text-black">
                Terms
              </a>
              <a href="#" className="hover:text-black">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}