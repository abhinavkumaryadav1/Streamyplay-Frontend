import React from "react";

function VideoCardHorizontalSkeleton() {
  return (
    <div className="flex gap-3 w-full animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="flex-shrink-0 w-40 sm:w-44 aspect-video rounded-lg bg-gray-200 dark:bg-gray-700"></div>

      {/* Info Skeleton */}
      <div className="flex-1 py-0.5 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export default VideoCardHorizontalSkeleton;
