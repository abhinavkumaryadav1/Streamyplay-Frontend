import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { getSubscribedChannels } from "../Store/Slices/subscriptionSlice";
import { MdSubscriptions } from "react-icons/md";

function Subscriptions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subscribedChannels, loading } = useSelector((state) => state.subscription);
  const userData = useSelector((state) => state.auth.userData);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-16 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
              <MdSubscriptions className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
              <p className="text-sm text-gray-600">
                {subscribedChannels?.length || 0} channels
              </p>
            </div>
          </div>

          {/* Channels Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[...Array(12)].map((_, index) => (
                <ChannelCardSkeleton key={index} />
              ))}
            </div>
          ) : subscribedChannels?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <MdSubscriptions className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No subscriptions yet</h3>
              <p className="text-sm">Channels you subscribe to will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {subscribedChannels.map((item) => {
                const channel = item.channel || item;
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
                        className="w-24 h-24 rounded-full object-cover mb-3 group-hover:ring-4 ring-gray-200 transition"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-3 group-hover:ring-4 ring-gray-200 transition">
                        <span className="text-3xl text-gray-600 font-bold">
                          {channel.username?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
                      {channel.fullName || channel.username}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
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

// Channel Card Skeleton
function ChannelCardSkeleton() {
  return (
    <div className="flex flex-col items-center animate-pulse">
      <div className="w-24 h-24 rounded-full bg-gray-300 mb-3"></div>
      <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-16"></div>
    </div>
  );
}

export default Subscriptions;
