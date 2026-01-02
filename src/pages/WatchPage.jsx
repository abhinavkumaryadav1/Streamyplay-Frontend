import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getVideoById, updateVideoOwnerSubscription } from "../Store/Slices/videoSlice";
import { toggleVideoLike } from "../Store/Slices/likeSlice";
import { toggleSubscription, getSubscribedChannels } from "../Store/Slices/subscriptionSlice";
import { openAuthModal } from "../Store/Slices/uiSlice";
import { formatDistanceToNow } from "../helper/timeUtils";
import CommentSection from "../components/CommentSection";
import VideoCardHorizontal from "../components/VideoCardHorizontal";
import { BiLike, BiDislike, BiShare } from "react-icons/bi";
import { RiPlayListAddLine } from "react-icons/ri";
import { HiDotsHorizontal } from "react-icons/hi";

function WatchPage() {
  const { videoId } = useParams();
  const dispatch = useDispatch();
  const { video, loading } = useSelector((state) => state.video);
  const { videos } = useSelector((state) => state.video);
  const { subscribedChannels } = useSelector((state) => state.subscription);
  const userData = useSelector((state) => state.auth.userData);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (videoId) {
      dispatch(getVideoById({ videoId }));
    }
  }, [dispatch, videoId]);

  // Fetch user's subscribed channels to verify subscription status
  useEffect(() => {
    if (userData?._id) {
      dispatch(getSubscribedChannels(userData._id));
    }
  }, [dispatch, userData?._id]);

  useEffect(() => {
    if (video) {
      setIsLiked(video.isLiked || false);
      setLikesCount(video.likesCount || 0);
      
      // Check subscription status
      let subscribed = video.owner?.isSubscribed || false;
      
      // Fallback: verify against subscribedChannels list if user is logged in
      if (userData && subscribedChannels?.length > 0 && video.owner?._id) {
        const isInSubscribedList = subscribedChannels.some((item) => {
          const channel = item.channel || item;
          return channel?._id === video.owner._id;
        });
        subscribed = isInSubscribedList;
      }
      
      setIsSubscribed(subscribed);
    }
  }, [video, subscribedChannels, userData]);

  const handleLike = async () => {
    if (!userData) {
      dispatch(openAuthModal("Sign in to like this video"));
      return;
    }
    await dispatch(toggleVideoLike(videoId));
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleSubscribe = async () => {
    if (!userData) {
      dispatch(openAuthModal("Sign in to subscribe to this channel"));
      return;
    }
    if (!video?.owner?._id) return;
    const result = await dispatch(toggleSubscription(video.owner._id));
    if (result.meta.requestStatus === "fulfilled") {
      const newIsSubscribed = !isSubscribed;
      const currentCount = video.owner?.subscribersCount || 0;
      const newSubscribersCount = newIsSubscribed ? currentCount + 1 : currentCount - 1;
      setIsSubscribed(newIsSubscribed);
      // Update the video owner data in Redux store to persist across refreshes
      dispatch(updateVideoOwnerSubscription({
        isSubscribed: newIsSubscribed,
        subscribersCount: newSubscribersCount,
      }));
      // Refetch subscribed channels to keep the list in sync
      dispatch(getSubscribedChannels(userData._id));
    }
  };

  const formatViews = (count) => {
    if (!count) return "0 views";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  };

  // Get video URL
  const videoUrl = typeof video?.videoFile === "string" 
    ? video?.videoFile 
    : video?.videoFile?.url;

  // Get thumbnail URL
  const thumbnailUrl = typeof video?.thumbnail === "string"
    ? video?.thumbnail
    : video?.thumbnail?.url;

  // Get owner info
  const owner = video?.owner || video?.ownerDetails;
  const avatarUrl = typeof owner?.avatar === "string" 
    ? owner?.avatar 
    : owner?.avatar?.url;

  if (loading && !video) {
    return <WatchPageSkeleton />;
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500 text-lg">Video not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8">
          {/* Main Video Section */}
          <div className="flex-1 max-w-full lg:max-w-[calc(100%-400px)]">
            {/* Video Player */}
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
              <video
                src={videoUrl}
                poster={thumbnailUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Video Info */}
            <div className="mt-4">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">
                {video.title}
              </h1>

              {/* Views and Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <span>{formatViews(video.views)}</span>
                <span>•</span>
                <span>{formatDistanceToNow(video.createdAt)}</span>
              </div>

              {/* Channel Info and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pb-4 border-b border-gray-200">
                {/* Channel */}
                <div className="flex items-center gap-3">
                  <Link to={`/channel/${owner?.username}`}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={owner?.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {owner?.username?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div>
                    <Link
                      to={`/channel/${owner?.username}`}
                      className="font-semibold text-gray-900 hover:text-gray-700"
                    >
                      {owner?.fullName || owner?.username}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {owner?.subscribersCount || 0} subscribers
                    </p>
                  </div>
                  {userData && userData._id !== owner?._id && (
                    <button
                      onClick={handleSubscribe}
                      className={`ml-4 px-4 py-2 rounded-full text-sm font-semibold transition ${
                        isSubscribed
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {isSubscribed ? "Subscribed" : "Subscribe"}
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Like/Dislike */}
                  <div className="flex items-center bg-gray-100 rounded-full">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-4 py-2 rounded-l-full hover:bg-gray-200 transition ${
                        isLiked ? "text-blue-600" : ""
                      }`}
                    >
                      <BiLike className={`text-xl ${isLiked ? "fill-current" : ""}`} />
                      <span className="text-sm font-medium">{likesCount}</span>
                    </button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <button className="px-4 py-2 rounded-r-full hover:bg-gray-200 transition">
                      <BiDislike className="text-xl" />
                    </button>
                  </div>

                  {/* Share */}
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                    <BiShare className="text-xl" />
                    <span className="text-sm font-medium">Share</span>
                  </button>

                  {/* Save */}
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                    <RiPlayListAddLine className="text-xl" />
                    <span className="text-sm font-medium hidden sm:inline">Save</span>
                  </button>

                  {/* More */}
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                    <HiDotsHorizontal className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 p-3 bg-gray-100 rounded-xl">
                <div
                  className={`text-sm text-gray-700 whitespace-pre-wrap ${
                    !showFullDescription ? "line-clamp-3" : ""
                  }`}
                >
                  {video.description}
                </div>
                {video.description?.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-sm font-semibold text-gray-900 mt-2 hover:underline"
                  >
                    {showFullDescription ? "Show less" : "...more"}
                  </button>
                )}
              </div>

              {/* Comments Section */}
              <CommentSection videoId={videoId} />
            </div>
          </div>

          {/* Sidebar - Recommended Videos */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <h3 className="text-lg font-semibold mb-4">Related Videos</h3>
            <div className="flex flex-col gap-3">
              {videos.docs
                .filter((v) => v._id !== videoId)
                .slice(0, 10)
                .map((video) => (
                  <VideoCardHorizontal key={video._id} video={video} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loading Component
function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
      <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="flex-1">
          <div className="w-full aspect-video bg-gray-300 rounded-xl"></div>
          <div className="mt-4 space-y-3">
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-[400px]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 mb-3">
              <div className="w-40 aspect-video bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WatchPage;
