import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllVideos, makeVideosNull } from "../Store/Slices/videoSlice";
import { setFilters, resetFilters as resetUIFilters } from "../Store/Slices/uiSlice";
import VideoGrid from "../components/VideoGrid";
import { IoClose, IoChevronDown } from "react-icons/io5";

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
  const { showFilters, sortBy, sortType } = useSelector((state) => state.ui);
  const [page, setPage] = useState(1);
  const limit = 12;

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
    dispatch(setFilters({ sortBy: option.sortBy, sortType: option.sortType }));
    setShowSortDropdown(false);
  };

  const resetFilters = () => {
    dispatch(resetUIFilters());
  };

  const hasActiveFilters = sortBy !== "createdAt" || sortType !== "desc";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content Area - adjusts for navbar and sidebar */}
      <div className="pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Filter Panel - controlled from Navbar */}
          {showFilters && (
            <div className="mb-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Sort By Dropdown */}
                    <div className="relative" ref={sortDropdownRef}>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Sort by
                      </label>
                      <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="flex items-center justify-between gap-2 min-w-[200px] px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition text-sm"
                      >
                        <span className="text-gray-700 dark:text-gray-200">{currentSortLabel}</span>
                        <IoChevronDown
                          className={`text-gray-500 dark:text-gray-400 transition-transform ${
                            showSortDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {showSortDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
                          {SORT_OPTIONS.map((option) => (
                            <button
                              key={`${option.sortBy}-${option.sortType}`}
                              onClick={() => handleSortChange(option)}
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                                sortBy === option.sortBy && sortType === option.sortType
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                  : "text-gray-700 dark:text-gray-200"
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
                      className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                    >
                      <IoClose className="text-lg" />
                      Reset filters
                    </button>
                  )}
                </div>

                {/* Active Filters Tags */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                      {currentSortLabel}
                      <button
                        onClick={resetFilters}
                        className="hover:text-blue-900 dark:hover:text-blue-300 ml-0.5"
                      >
                        <IoClose />
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

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

export default Home;
