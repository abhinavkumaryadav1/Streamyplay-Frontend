import { IoSearch, IoClose } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { MdKeyboardVoice, MdLogout } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { userLogout } from "../Store/Slices/authSlice";
import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "../helper/axiosInstance";
import { Link } from "react-router-dom";
import debounce from "../helper/debounce";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const handleLogout = () => {
    dispatch(userLogout());
  };

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
        setSuggestions(filtered.slice(0, 6));
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
    fetchSuggestions(searchQuery);
  }, [searchQuery, fetchSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          e.preventDefault();
          navigate(`/watch/${suggestions[selectedIndex]._id}`);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 fixed top-0 left-0 z-40">
      {/* Left section - Logo only */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/" className="text-lg sm:text-xl font-bold text-red-600 hover:opacity-80 transition">
          StreamyPlay
        </Link>
      </div>

      {/* Middle - Search Bar */}
      <div className="hidden sm:flex items-center w-[40%] sm:w-[50%] max-w-xs sm:max-w-2xl relative" ref={searchRef}>
        <form onSubmit={handleSearch} className="flex-1 flex">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search videos..."
              className="w-full border border-gray-300 rounded-l-full px-4 py-2 focus:outline-none focus:border-blue-500 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <IoClose className="text-gray-500" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-gray-100 border border-l-0 border-gray-300 px-5 py-2 rounded-r-full hover:bg-gray-200 transition"
          >
            <IoSearch className="text-xl text-gray-600" />
          </button>
        </form>
        <button className="ml-3 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
          <MdKeyboardVoice className="text-xl" />
        </button>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (searchQuery.trim() || loading) && (
          <div className="absolute top-full left-0 right-12 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto"></div>
              </div>
            ) : suggestions.length > 0 ? (
              <ul>
                {suggestions.map((video, index) => {
                  const thumbnailUrl = typeof video.thumbnail === "string" 
                    ? video.thumbnail 
                    : video.thumbnail?.url;
                  
                  return (
                    <li key={video._id}>
                      <Link
                        to={`/watch/${video._id}`}
                        onClick={() => {
                          setShowSuggestions(false);
                          setSelectedIndex(-1);
                        }}
                        className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition ${
                          selectedIndex === index ? "bg-gray-100" : ""
                        }`}
                      >
                        <IoSearch className="text-gray-400 flex-shrink-0" />
                        {thumbnailUrl && (
                          <img
                            src={thumbnailUrl}
                            alt=""
                            className="w-10 h-6 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <span className="text-sm text-gray-700 truncate flex-1">
                          {video.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
                {searchQuery.trim() && (
                  <li className="border-t border-gray-100">
                    <button
                      onClick={handleSearch}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-left"
                    >
                      <IoSearch className="text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-blue-600">
                        Search for "{searchQuery}"
                      </span>
                    </button>
                  </li>
                )}
              </ul>
            ) : searchQuery.trim() ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No videos found for "{searchQuery}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Right section - Auth Buttons */}
      <div className="flex items-center gap-2 sm:gap-4">
        {!userData && (
          <button
            className="text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
        {!userData && (
          <button className="text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        )}
        {userData && (
          <button
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 border border-red-600 text-red-600 rounded-full hover:bg-red-50"
            onClick={handleLogout}
          >
            <MdLogout className="text-base sm:text-lg" /> Logout
          </button>
        )}
        {userData && userData.avatar ? (
          <Link to={`/channel/${userData.username}`}>
            <img
              src={typeof userData.avatar === "string" ? userData.avatar : userData.avatar?.url}
              alt="User Avatar"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-300 cursor-pointer hover:border-blue-500 transition"
            />
          </Link>
        ) : userData ? (
          <Link to={`/channel/${userData.username}`}>
            <FaUserCircle className="text-2xl sm:text-3xl text-gray-700 cursor-pointer hover:text-black" />
          </Link>
        ) : (
          <FaUserCircle className="text-2xl sm:text-3xl text-gray-700 cursor-pointer hover:text-black" />
        )}
      </div>
    </div>
  );
}
