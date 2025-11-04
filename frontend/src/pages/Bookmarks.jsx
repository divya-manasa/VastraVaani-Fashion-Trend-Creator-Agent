import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("tips");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get(`${API_URL}/bookmarks/list`);
      setBookmarks(res.data.bookmarks);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    }
  };

  const addBookmark = async () => {
    if (!title || !content) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/bookmarks/add`, {
        title,
        content,
        category,
        tags: [],
      });
      setTitle("");
      setContent("");
      setCategory("tips");
      fetchBookmarks();
    } catch (err) {
      setError("Error adding bookmark");
    }
    setLoading(false);
  };

  const deleteBookmark = async (index) => {
    try {
      await axios.delete(`${API_URL}/bookmarks/delete/${index}`);
      fetchBookmarks();
    } catch (err) {
      setError("Error deleting bookmark");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-300">
        <h1 className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400">
          📚 Knowledge Bookmarks
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left - Add Bookmark */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">➕ Save Knowledge</h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark Title"
              className="w-full px-4 py-3 mb-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Save your insights or notes..."
              rows="5"
              className="w-full px-4 py-3 mb-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 mb-6 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              <option value="tips">💡 Tips</option>
              <option value="trends">📊 Trends</option>
              <option value="recommendations">⭐ Recommendations</option>
              <option value="notes">📝 Notes</option>
            </select>

            <button
              onClick={addBookmark}
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Saving..." : "💾 Save Bookmark"}
            </button>

            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}
          </div>

          {/* Right - Bookmarks List */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              📖 My Bookmarks ({bookmarks.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {bookmarks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No bookmarks yet. Start saving your ideas.
                </p>
              ) : (
                bookmarks.map((bm, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{bm.title}</h4>
                      <button
                        onClick={() => deleteBookmark(idx)}
                        className="text-gray-400 hover:text-red-600 transition-colors text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {bm.content.length > 100
                        ? bm.content.substring(0, 100) + "..."
                        : bm.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
