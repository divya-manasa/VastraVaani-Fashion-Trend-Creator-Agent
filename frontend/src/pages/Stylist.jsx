import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export default function Stylist() {
  const [messages, setMessages] = useState([
    { type: "ai", text: "🕶️ Hello, I’m your VastraVaani AI Stylist — here to help you refine your look in timeless monochrome style." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((msg) => ({
        user: msg.type === "user" ? msg.text : "",
        assistant: msg.type === "ai" ? msg.text : "",
      }));

      const res = await axios.post(`${API_URL}/stylist/chat`, {
        message: userMessage,
        history,
      });

      setMessages((prev) => [...prev, { type: "ai", text: res.data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { type: "ai", text: "⚠️ Sorry, something went wrong. Try again soon." }]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 font-inter">
      <div className="bg-gradient-to-br from-black via-neutral-900 to-neutral-800 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl h-[550px] flex flex-col">
        <h1 className="text-4xl font-light text-white tracking-wide mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-white to-gray-400">
            🖤 VastraVaani Stylist AI
          </span>
        </h1>

        {/* Chat window */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 bg-white/5 rounded-2xl p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs sm:max-w-md px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.type === "user"
                    ? "bg-gradient-to-r from-gray-200 to-gray-400 text-black font-medium"
                    : "bg-neutral-800/70 border border-white/10 text-gray-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-gray-400 text-sm animate-pulse">⌛ Your stylist is curating ideas...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about styling, outfits, or aesthetics..."
            className="flex-1 px-4 py-3 bg-neutral-900 text-white rounded-2xl border border-white/10 placeholder-gray-500 focus:ring-1 focus:ring-gray-400 outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-gray-200 to-gray-400 text-black hover:from-white hover:to-gray-300 transition-all disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
