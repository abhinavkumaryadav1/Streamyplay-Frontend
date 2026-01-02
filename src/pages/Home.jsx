import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllVideos, makeVideosNull } from "../Store/Slices/videoSlice";
import VideoGrid from "../components/VideoGrid";
import { IoFilter, IoClose, IoChevronDown } from "react-icons/io5";

const SORT_OPTIONS = [
  { label: "Upload date (newest)", sortBy: "createdAt", sortType: "desc" },
  { label: "Upload date (oldest)", sortBy: "createdAt", sortType: "asc" },
  { label: "View count (high to low)", sortBy: "views", sortType: "desc" },
  { label: "View count (low to high)", sortBy: "views", sortType: "asc" },
  { label: "Duration (longest)", sortBy: "duration", sortType: "desc" },
  { label: "Duration (shortest)", sortBy: "duration", sortType: "asc" },
];

function Home() {
  const dispatch = useDispatch();
  const { videos, loading } = useSelector((state) => state.video);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortType, setSortType] = useState("desc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef(null);

  // Get current sort label
  const currentSortLabel = SORT_OPTIONS.find(
    (opt) => opt.sortBy === sortBy && opt.sortType === sortType
  )?.label || "Upload date (newest)";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch videos on initial load or when sort changes
  useEffect(() => {
    dispatch(makeVideosNull());
    dispatch(
      getAllVideos({
        page: 1,
        limit,
        sortBy,
        sortType,
      })
    );
    setPage(1);
  }, [dispatch, sortBy, sortType]);

  // Fetch more videos for infinite scroll
  const fetchMoreVideos = useCallback(() => {
    const nextPage = page + 1;
    dispatch(
      getAllVideos({
        page: nextPage,
        limit,
        sortBy,
        sortType,
      })
    );
    setPage(nextPage);
  }, [dispatch, page, sortBy, sortType]);

  const handleSortChange = (option) => {
    setSortBy(option.sortBy);
    setSortType(option.sortType);
    setShowSortDropdown(false);
  };

  const resetFilters = () => {
    setSortBy("createdAt");
    setSortType("desc");
  };

  const hasActiveFilters = sortBy !== "createdAt" || sortType !== "desc";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area - adjusts for navbar and sidebar */}
      <div className="pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Category Tags & Filter Button */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              {/* Category Tags */}
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 pb-2">
                  <CategoryTag label="All" active />
                  <CategoryTag label="Music" />
                  <CategoryTag label="Gaming" />
                  <CategoryTag label="News" />
                  <CategoryTag label="Sports" />
                  <CategoryTag label="Entertainment" />
                  <CategoryTag label="Education" />
                  <CategoryTag label="Technology" />
                  <CategoryTag label="Comedy" />
                </div>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition font-medium text-sm shrink-0 ${
                  showFilters || hasActiveFilters
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <IoFilter className="text-lg" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Sort By Dropdown */}
                    <div className="relative" ref={sortDropdownRef}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Sort by
                      </label>
                      <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex items-center justify-between gap-2 min-w-[200px] px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition text-sm"
                      >
                        <span className="text-gray-700">{currentSortLabel}</span>
                        <IoChevronDown
                          className={`text-gray-500 transition-transform ${
                            showSortDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {showSortDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                          {SORT_OPTIONS.map((option) => (
                            <button
                              key={`${option.sortBy}-${option.sortType}`}
                              onClick={() => handleSortChange(option)}
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition ${
                                sortBy === option.sortBy && sortType === option.sortType
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-700"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reset Filters */}
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition"
                    >
                      <IoClose className="text-lg" />
                      Reset filters
                    </button>
                  )}
                </div>

                {/* Active Filters Tags */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {currentSortLabel}
                      <button
                        onClick={resetFilters}
                        className="hover:text-blue-900 ml-0.5"
                      >
                        <IoClose />
                      </button>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Video Grid */}
          <VideoGrid
            videos={videos.docs}
            fetchMore={fetchMoreVideos}
            hasNextPage={videos.hasNextPage}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

// Category Tag Component
function CategoryTag({ label, active = false }) {
  return (
    <button
      className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
        active
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

export default Home;
