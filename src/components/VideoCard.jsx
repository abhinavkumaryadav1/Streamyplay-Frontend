import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "../helper/timeUtils";

function VideoCard({ video }) {
  const {
    _id,
    thumbnail,
    title,
    duration,
    views,
    createdAt,
    ownerDetails,
  } = video;

  // Get thumbnail URL (handle both string and object formats)
  const thumbnailUrl = typeof thumbnail === "string" ? thumbnail : thumbnail?.url;
  
  // Get owner info from ownerDetails
  const owner = ownerDetails;

  // Format duration (seconds to MM:SS or HH:MM:SS)
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format views count
  const formatViews = (count) => {
    if (!count) return "0 views";
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  // Get avatar URL (handle both string and object formats)
  const avatarUrl = typeof owner?.avatar === "string" ? owner?.avatar : owner?.avatar?.url;

  return (
    <Link to={`/watch/${_id}`} className="block group">
      <div className="flex flex-col w-full">
        {/* Thumbnail Container */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-200">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-gray-500 text-sm">No Thumbnail</span>
            </div>
          )}
          {/* Duration Badge */}
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Video Info */}
        <div className="flex gap-3 mt-3">
          {/* Channel Avatar */}
          <Link
            to={`/channel/${owner?.username}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={owner?.username}
                className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-sm font-semibold">
                  {owner?.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
          </Link>

          {/* Title and Meta */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-5 group-hover:text-blue-600 transition">
              {title}
            </h3>
            <Link
              to={`/channel/${owner?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-gray-600 hover:text-gray-900 mt-1 block"
            >
              {owner?.fullName || owner?.username}
            </Link>
            <div className="text-xs text-gray-500 mt-0.5">
              <span>{formatViews(views)}</span>
              <span className="mx-1">•</span>
              <span>{formatDistanceToNow(createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default VideoCard;
