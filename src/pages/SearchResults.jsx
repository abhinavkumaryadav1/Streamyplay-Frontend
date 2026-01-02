import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllVideos, makeVideosNull } from "../Store/Slices/videoSlice";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../skeleton/VideoCardSkeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import { IoSearch, IoFilter, IoClose, IoChevronDown } from "react-icons/io5";

const SORT_OPTIONS = [
  { label: "Upload date (newest)", sortBy: "createdAt", sortType: "desc" },
  { label: "Upload date (oldest)", sortBy: "createdAt", sortType: "asc" },
  { label: "View count (high to low)", sortBy: "views", sortType: "desc" },
  { label: "View count (low to high)", sortBy: "views", sortType: "asc" },
  { label: "Duration (longest)", sortBy: "duration", sortType: "desc" },
  { label: "Duration (shortest)", sortBy: "duration", sortType: "asc" },
];

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const dispatch = useDispatch();
  const { videos, loading } = useSelector((state) => state.video);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortType, setSortType] = useState(searchParams.get("sortType") || "desc");
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

  useEffect(() => {
    if (query) {
      dispatch(makeVideosNull());
      dispatch(
        getAllVideos({
          query,
          page: 1,
          limit,
          sortBy,
          sortType,
        })
      );
      setPage(1);
    }
  }, [dispatch, query, sortBy, sortType]);

  const fetchMoreVideos = useCallback(() => {
    const nextPage = page + 1;
    dispatch(
      getAllVideos({
        query,
        page: nextPage,
        limit,
        sortBy,
        sortType,
      })
    );
    setPage(nextPage);
  }, [dispatch, page, query, sortBy, sortType]);

  const handleSortChange = (option) => {
    setSortBy(option.sortBy);
    setSortType(option.sortType);
    setShowSortDropdown(false);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sortBy", option.sortBy);
    newParams.set("sortType", option.sortType);
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSortBy("createdAt");
    setSortType("desc");
    const newParams = new URLSearchParams();
    newParams.set("q", query);
    setSearchParams(newParams);
  };

  const hasActiveFilters = sortBy !== "createdAt" || sortType !== "desc";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-16 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <IoSearch className="text-2xl text-gray-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Search results for "{query}"
                </h1>
                <p className="text-sm text-gray-600">
                  {videos.docs?.length || 0} videos found
                </p>
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition font-medium text-sm ${
                showFilters || hasActiveFilters
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <IoFilter className="text-lg" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
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

          {/* Results */}
          {loading && videos.docs.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, index) => (
                <VideoCardSkeleton key={index} />
              ))}
            </div>
          ) : videos.docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <IoSearch className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-sm">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={videos.docs.length}
              next={fetchMoreVideos}
              hasMore={videos.hasNextPage}
              loader={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6">
                  {[...Array(4)].map((_, index) => (
                    <VideoCardSkeleton key={`loader-${index}`} />
                  ))}
                </div>
              }
              endMessage={
                <p className="text-center text-gray-500 py-8 text-sm">
                  No more results
                </p>
              }
              scrollThreshold={0.9}
              style={{ overflow: "visible" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {videos.docs.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchResults;
