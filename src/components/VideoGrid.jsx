import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import VideoCard from "./VideoCard";
import VideoCardSkeleton from "../skeleton/VideoCardSkeleton";

function VideoGrid({ videos, fetchMore, hasNextPage, loading }) {
  return (
    <div className="w-full">
      {/* Initial Loading State */}
      {loading && videos.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(12)].map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* No Videos State */}
      {!loading && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <svg
            className="w-24 h-24 mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2">No videos found</h3>
          <p className="text-sm">Try searching for something else</p>
        </div>
      )}

      {/* Videos Grid with Infinite Scroll */}
      {videos.length > 0 && (
        <InfiniteScroll
          dataLength={videos.length}
          next={fetchMore}
          hasMore={hasNextPage}
          loader={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6">
              {[...Array(4)].map((_, index) => (
                <VideoCardSkeleton key={`loader-${index}`} />
              ))}
            </div>
          }
          endMessage={
            <p className="text-center text-gray-500 py-8 text-sm">
              You've reached the end! 🎬
            </p>
          }
          scrollThreshold={0.9}
          style={{ overflow: "visible" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}

export default VideoGrid;
