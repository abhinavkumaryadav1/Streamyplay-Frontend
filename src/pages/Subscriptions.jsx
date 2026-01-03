import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { getSubscribedChannels } from "../Store/Slices/subscriptionSlice";
import { MdSubscriptions } from "react-icons/md";
import { formatDistanceToNow } from "../helper/timeUtils";
import VideoCardSkeleton from "../skeleton/VideoCardSkeleton";

function Subscriptions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subscribedChannels, loading } = useSelector((state) => state.subscription);
  const userData = useSelector((state) => state.auth.userData);
  const [viewMode, setViewMode] = useState("videos"); // "videos" or "channels"

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    }
    dispatch(getSubscribedChannels(userData._id));
  }, [dispatch, userData, navigate]);

  if (!userData) {
    return null;
  }

  // Extract videos from subscribed channels and sort by date
  const getSubscriptionVideos = () => {
    if (!subscribedChannels?.length) return [];
    
    const videos = [];
    subscribedChannels.forEach((item) => {
      const channel = item.subscribedChannel || item.channel || item;
      const latestVideo = channel?.latestVideo;
      
      if (latestVideo && latestVideo._id) {
        videos.push({
          ...latestVideo,
          channel: {
            _id: channel._id,
            username: channel.username,
            fullName: channel.fullName,
            avatar: channel.avatar,
          },
        });
      }
    });
    
    // Sort by createdAt (newest first)
    return videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const subscriptionVideos = getSubscriptionVideos();

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                <MdSubscriptions className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subscribedChannels?.length || 0} channels
                </p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("videos")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                  viewMode === "videos"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Latest Videos
              </button>
              <button
                onClick={() => setViewMode("channels")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                  viewMode === "channels"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Channels
              </button>
            </div>
          </div>

          {/* Subscribed Channels Bar (horizontal scroll) */}
          {subscribedChannels?.length > 0 && viewMode === "videos" && (
            <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 pb-2">
                {subscribedChannels.map((item) => {
                  const channel = item.subscribedChannel || item.channel || item;
                  const avatarUrl = typeof channel?.avatar === "string"
                    ? channel?.avatar
                    : channel?.avatar?.url;

                  return (
                    <Link
                      key={channel._id}
                      to={`/channel/${channel.username}`}
                      className="flex flex-col items-center flex-shrink-0 group"
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={channel.username}
                          className="w-16 h-16 rounded-full object-cover mb-1.5 group-hover:ring-2 ring-blue-500 transition"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mb-1.5 group-hover:ring-2 ring-blue-500 transition">
                          <span className="text-xl text-gray-600 dark:text-gray-300 font-bold">
                            {channel.username?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-gray-700 dark:text-gray-300 max-w-[70px] truncate text-center">
                        {channel.fullName || channel.username}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            viewMode === "videos" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, index) => (
                  <VideoCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[...Array(12)].map((_, index) => (
                  <ChannelCardSkeleton key={index} />
                ))}
              </div>
            )
          ) : subscribedChannels?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
              <MdSubscriptions className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">No subscriptions yet</h3>
              <p className="text-sm text-center max-w-md">
                Subscribe to channels to see their latest videos here
              </p>
              <Link
                to="/"
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition"
              >
                Explore Videos
              </Link>
            </div>
          ) : viewMode === "videos" ? (
            // Videos Grid
            subscriptionVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                <svg
                  className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
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
                <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">No videos yet</h3>
                <p className="text-sm text-center">
                  Your subscribed channels haven't uploaded any videos yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {subscriptionVideos.map((video) => (
                  <SubscriptionVideoCard
                    key={video._id}
                    video={video}
                    formatDuration={formatDuration}
                    formatViews={formatViews}
                  />
                ))}
              </div>
            )
          ) : (
            // Channels Grid
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {subscribedChannels.map((item) => {
                const channel = item.subscribedChannel || item.channel || item;
                const avatarUrl = typeof channel?.avatar === "string"
                  ? channel?.avatar
                  : channel?.avatar?.url;

                return (
                  <Link
                    key={channel._id}
                    to={`/channel/${channel.username}`}
                    className="flex flex-col items-center text-center group"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={channel.username}
                        className="w-24 h-24 rounded-full object-cover mb-3 group-hover:ring-4 ring-gray-200 dark:ring-gray-600 transition"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mb-3 group-hover:ring-4 ring-gray-200 dark:ring-gray-600 transition">
                        <span className="text-3xl text-gray-600 dark:text-gray-300 font-bold">
                          {channel.username?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                      {channel.fullName || channel.username}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      @{channel.username}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Video Card for Subscription Page
function SubscriptionVideoCard({ video, formatDuration, formatViews }) {
  const thumbnailUrl = typeof video.thumbnail === "string" 
    ? video.thumbnail 
    : video.thumbnail?.url;
  
  const avatarUrl = typeof video.channel?.avatar === "string"
    ? video.channel?.avatar
    : video.channel?.avatar?.url;

  return (
    <Link to={`/watch/${video._id}`} className="block group">
      <div className="flex flex-col w-full">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
              <span className="text-gray-500 dark:text-gray-400 text-sm">No Thumbnail</span>
            </div>
          )}
          {/* Duration Badge */}
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        </div>

        {/* Video Info */}
        <div className="flex gap-3 mt-3">
          {/* Channel Avatar */}
          <Link
            to={`/channel/${video.channel?.username}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={video.channel?.username}
                className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
                  {video.channel?.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
          </Link>

          {/* Title and Meta */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              {video.title}
            </h3>
            <Link
              to={`/channel/${video.channel?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mt-1 block"
            >
              {video.channel?.fullName || video.channel?.username}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {formatViews(video.views)} • {formatDistanceToNow(video.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Channel Card Skeleton
function ChannelCardSkeleton() {
  return (
    <div className="flex flex-col items-center animate-pulse">
      <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 mb-3"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-2"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
    </div>
  );
}

export default Subscriptions;
