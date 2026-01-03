import React from "react";

function VideoCardSkeleton() {
  return (
    <div className="flex flex-col w-full animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="w-full aspect-video rounded-xl bg-gray-200 dark:bg-gray-700"></div>

      {/* Info Skeleton */}
      <div className="flex gap-3 mt-3">
        {/* Avatar Skeleton */}
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>

        {/* Text Skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export default VideoCardSkeleton;
