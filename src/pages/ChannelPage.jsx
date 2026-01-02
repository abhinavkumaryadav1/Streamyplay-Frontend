import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userChannelProfile, updateProfileSubscription } from "../Store/Slices/userSlice";
import { getAllVideos, makeVideosNull } from "../Store/Slices/videoSlice";
import { toggleSubscription, getSubscribedChannels } from "../Store/Slices/subscriptionSlice";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../skeleton/VideoCardSkeleton";

function ChannelPage() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profileData, loading: profileLoading } = useSelector((state) => state.user);
  const { videos, loading: videosLoading } = useSelector((state) => state.video);
  const { subscribedChannels } = useSelector((state) => state.subscription);
  const userData = useSelector((state) => state.auth.userData);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [activeTab, setActiveTab] = useState("videos");

  // Refetch profile when username or userData changes (to get correct subscription status)
  useEffect(() => {
    if (username) {
      dispatch(userChannelProfile(username));
      dispatch(makeVideosNull());
    }
  }, [dispatch, username, userData?._id]);

  // Fetch user's subscribed channels to verify subscription status
  useEffect(() => {
    if (userData?._id) {
      dispatch(getSubscribedChannels(userData._id));
    }
  }, [dispatch, userData?._id]);

  // Fetch videos when profileData._id changes
  useEffect(() => {
    if (profileData?._id) {
      dispatch(
        getAllVideos({
          userId: profileData._id,
          page: 1,
          limit: 12,
          sortBy: "createdAt",
          sortType: "desc",
        })
      );
    }
  }, [dispatch, profileData?._id]);

  // Update subscription state whenever profileData or subscribedChannels changes
  useEffect(() => {
    if (profileData) {
      // First check if backend returned isSubscribed
      let subscribed = profileData.isSubscribed ?? false;
      
      // Fallback: verify against subscribedChannels list if user is logged in
      if (userData && subscribedChannels?.length > 0 && profileData._id) {
        const isInSubscribedList = subscribedChannels.some((item) => {
          const channel = item.channel || item;
          return channel?._id === profileData._id;
        });
        subscribed = isInSubscribedList;
      }
      
      setIsSubscribed(subscribed);
      setSubscribersCount(profileData.subscribersCount ?? 0);
    }
  }, [profileData, subscribedChannels, userData]);

  const handleSubscribe = async () => {
    if (!userData) {
      navigate("/login");
      return;
    }
    const result = await dispatch(toggleSubscription(profileData._id));
    if (result.meta.requestStatus === "fulfilled") {
      const newIsSubscribed = !isSubscribed;
      const newSubscribersCount = newIsSubscribed ? subscribersCount + 1 : subscribersCount - 1;
      setIsSubscribed(newIsSubscribed);
      setSubscribersCount(newSubscribersCount);
      // Update the profile data in Redux store to persist across refreshes
      dispatch(updateProfileSubscription({
        isSubscribed: newIsSubscribed,
        subscribersCount: newSubscribersCount,
      }));
      // Refetch subscribed channels to keep the list in sync
      dispatch(getSubscribedChannels(userData._id));
    }
  };

  const formatCount = (count) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Get cover and avatar URLs
  const coverUrl = typeof profileData?.coverImage === "string"
    ? profileData?.coverImage
    : profileData?.coverImage?.url;
  const avatarUrl = typeof profileData?.avatar === "string"
    ? profileData?.avatar
    : profileData?.avatar?.url;

  if (profileLoading && !profileData) {
    return <ChannelPageSkeleton />;
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500 text-lg">Channel not found</p>
        </div>
      </div>
    );
  }

  const isOwner = userData?._id === profileData?._id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        {/* Cover Image */}
        <div className="w-full h-32 sm:h-48 lg:h-56 bg-gradient-to-r from-gray-300 to-gray-400 overflow-hidden">
          {coverUrl && (
            <img
              src={coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Channel Info */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-8 sm:-mt-12">
            {/* Avatar */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profileData.username}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-300 border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-4xl text-gray-600 font-bold">
                    {profileData.username?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Channel Details */}
            <div className="flex-1 pb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {profileData.fullName || profileData.username}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
                <span>@{profileData.username}</span>
                <span>•</span>
                <span>{formatCount(subscribersCount)} subscribers</span>
                <span>•</span>
                <span>{videos.docs?.length || 0} videos</span>
              </div>
              {profileData.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {profileData.description}
                </p>
              )}
            </div>

            {/* Subscribe/Edit Button */}
            <div className="sm:pb-2">
              {isOwner ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition"
                >
                  Manage Channel
                </Link>
              ) : (
                <button
                  onClick={handleSubscribe}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition ${
                    isSubscribed
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6 border-b border-gray-200">
            {["videos", "playlists", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold capitalize transition ${
                  activeTab === tab
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "videos" && (
              <>
                {videosLoading && videos.docs.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(8)].map((_, index) => (
                      <VideoCardSkeleton key={index} />
                    ))}
                  </div>
                ) : videos.docs.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
                    <p className="text-lg font-medium">No videos yet</p>
                    <p className="text-sm mt-1">This channel hasn't uploaded any videos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {videos.docs.map((video) => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "playlists" && (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg font-medium">No playlists</p>
                <p className="text-sm mt-1">This channel has no public playlists.</p>
              </div>
            )}

            {activeTab === "about" && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {profileData.description || "No description provided."}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-3">Stats</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>Joined {new Date(profileData.createdAt).toLocaleDateString()}</p>
                    <p>{formatCount(subscribersCount)} subscribers</p>
                    <p>{videos.docs?.length || 0} videos</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loading
function ChannelPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64 animate-pulse">
      <div className="w-full h-32 sm:h-48 lg:h-56 bg-gray-300"></div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-end gap-4 -mt-12">
          <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white"></div>
          <div className="flex-1 pb-2 space-y-2">
            <div className="h-8 bg-gray-300 rounded w-48"></div>
            <div className="h-4 bg-gray-300 rounded w-64"></div>
          </div>
        </div>
        <div className="flex gap-6 mt-6 border-b border-gray-200 pb-3">
          <div className="h-4 bg-gray-300 rounded w-16"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

export default ChannelPage;
