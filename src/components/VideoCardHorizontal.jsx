import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { formatDistanceToNow } from "../helper/timeUtils";
import { openAuthModal } from "../Store/Slices/uiSlice";

function VideoCardHorizontal({ video }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.auth);
  
  const {
    _id,
    thumbnail,
    title,
    duration,
    views,
    createdAt,
    ownerDetails,
    description,
  } = video;

  // Get thumbnail URL (handle both string and object formats)
  const thumbnailUrl = typeof thumbnail === "string" ? thumbnail : thumbnail?.url;
  
  // Get owner info from ownerDetails
  const owner = ownerDetails || video.owner;
  const avatarUrl = typeof owner?.avatar === "string" 
    ? owner?.avatar 
    : owner?.avatar?.url;

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

  // Handle video click - check auth before navigating
  const handleVideoClick = (e) => {
    if (!userData) {
      e.preventDefault();
      dispatch(openAuthModal("Please sign in to watch videos"));
    }
  };

  return (
    <Link to={`/watch/${_id}`} className="block group" onClick={handleVideoClick}>
      <div className="flex gap-3 w-full">
        {/* Thumbnail Container */}
        <div className="relative flex-shrink-0 w-40 sm:w-44 aspect-video rounded-lg overflow-hidden bg-gray-200">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-gray-500 text-xs">No Thumbnail</span>
            </div>
          )}
          {/* Duration Badge */}
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs font-medium px-1 py-0.5 rounded">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Video Info */}
        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-5 group-hover:text-blue-600 transition">
            {title}
          </h3>
          <div className="mt-1">
            <Link
              to={`/channel/${owner?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-gray-600 hover:text-gray-900"
            >
              {owner?.fullName || owner?.username}
            </Link>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            <span>{formatViews(views)}</span>
            <span className="mx-1">•</span>
            <span>{formatDistanceToNow(createdAt)}</span>
          </div>
          {/* Description preview - only on larger screens */}
          {description && (
            <p className="hidden sm:block text-xs text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default VideoCardHorizontal;
