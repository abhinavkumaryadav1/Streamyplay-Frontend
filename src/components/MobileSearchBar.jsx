import { IoSearch, IoClose } from "react-icons/io5";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../helper/axiosInstance";
import debounce from "../helper/debounce";

export default function MobileSearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search function
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get(`/video?search=${encodeURIComponent(query)}&limit=20`);
        // Filter to only show videos whose title starts with the query
        const filtered = (response.data.data.docs || []).filter((video) =>
          video.title.toLowerCase().startsWith(query.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 5));
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(search);
  }, [search, fetchSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setSearch("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={searchRef}
      className="sm:hidden fixed top-14 left-0 w-full z-30 bg-white px-2 py-2 border-b border-gray-200"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search videos..."
            className="w-full rounded-full border border-gray-300 px-4 py-2 pr-8 text-sm focus:outline-none focus:border-blue-500 bg-gray-50"
            aria-label="Search"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
            >
              <IoClose className="text-gray-500" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-gray-100 border border-gray-300 rounded-full p-2 hover:bg-gray-200"
          aria-label="Search"
        >
          <IoSearch className="text-xl text-gray-700" />
        </button>
      </form>

      {/* Mobile Search Suggestions */}
      {showSuggestions && (search.trim() || loading) && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto"></div>
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((video) => {
                const thumbnailUrl = typeof video.thumbnail === "string" 
                  ? video.thumbnail 
                  : video.thumbnail?.url;
                
                return (
                  <li key={video._id}>
                    <Link
                      to={`/watch/${video._id}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                    >
                      {thumbnailUrl && (
                        <img
                          src={thumbnailUrl}
                          alt=""
                          className="w-16 h-10 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {video.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
              <li>
                <button
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 hover:bg-gray-50 text-blue-600 text-sm"
                >
                  <IoSearch />
                  <span>View all results for "{search}"</span>
                </button>
              </li>
            </ul>
          ) : search.trim() ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No videos found for "{search}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
