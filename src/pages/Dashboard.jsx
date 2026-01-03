import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getChannelStats, getChannelVideos } from "../Store/Slices/dashboardSlice";
import { deleteAVideo, togglePublishStatus } from "../Store/Slices/videoSlice";
import VideoUploadModal from "../components/VideoUploadModal";
import EditVideoModal from "../components/EditVideoModal";
import { MdUpload, MdEdit, MdDelete, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { BiLike, BiPlay } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import { formatDistanceToNow } from "../helper/timeUtils";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { channelStats, channelVideos, loading } = useSelector((state) => state.dashboard);
  const userData = useSelector((state) => state.auth.userData);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    }
    dispatch(getChannelStats());
    dispatch(getChannelVideos());
  }, [dispatch, userData, navigate]);

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      await dispatch(deleteAVideo(videoId));
      dispatch(getChannelVideos());
    }
  };

  const handleTogglePublish = async (videoId) => {
    await dispatch(togglePublishStatus(videoId));
    dispatch(getChannelVideos());
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Channel Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {userData.fullName || userData.username}!
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition"
            >
              <MdUpload className="text-xl" />
              Upload Video
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
            {["dashboard", "content", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold capitalize transition ${
                  activeTab === tab
                    ? "text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon={<BiPlay className="text-2xl text-blue-600" />}
                  label="Total Views"
                  value={formatNumber(channelStats?.totalViews)}
                  bgColor="bg-blue-50 dark:bg-blue-900/30"
                />
                <StatCard
                  icon={<FaUsers className="text-2xl text-green-600" />}
                  label="Subscribers"
                  value={formatNumber(channelStats?.totalSubscribers)}
                  bgColor="bg-green-50 dark:bg-green-900/30"
                />
                <StatCard
                  icon={<BiLike className="text-2xl text-purple-600" />}
                  label="Total Likes"
                  value={formatNumber(channelStats?.totalLikes)}
                  bgColor="bg-purple-50 dark:bg-purple-900/30"
                />
                <StatCard
                  icon={<MdVisibility className="text-2xl text-orange-600" />}
                  label="Total Videos"
                  value={formatNumber(channelStats?.totalVideos)}
                  bgColor="bg-orange-50 dark:bg-orange-900/30"
                />
              </div>

              {/* Recent Videos */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Videos</h2>
                <div className="space-y-4">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex gap-4">
                        <div className="w-32 aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : channelVideos?.slice(0, 5).map((video) => (
                    <VideoRow
                      key={video._id}
                      video={video}
                      onEdit={() => setEditingVideo(video)}
                      onDelete={() => handleDeleteVideo(video._id)}
                      onTogglePublish={() => handleTogglePublish(video._id)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <div className="col-span-5">Video</div>
                <div className="col-span-2">Visibility</div>
                <div className="col-span-2">Views</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Video List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse p-6">
                      <div className="flex gap-4">
                        <div className="w-32 aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : channelVideos?.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium">No videos yet</p>
                    <p className="text-sm mt-1">Upload your first video to get started</p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700"
                    >
                      Upload Video
                    </button>
                  </div>
                ) : (
                  channelVideos?.map((video) => (
                    <VideoRow
                      key={video._id}
                      video={video}
                      onEdit={() => setEditingVideo(video)}
                      onDelete={() => handleDeleteVideo(video._id)}
                      onTogglePublish={() => handleTogglePublish(video._id)}
                      detailed
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Channel Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Views</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(channelStats?.totalViews)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Subscribers</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(channelStats?.totalSubscribers)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Likes</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(channelStats?.totalLikes)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Videos</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(channelStats?.totalVideos)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Videos</h3>
                <div className="space-y-3">
                  {channelVideos
                    ?.slice()
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 5)
                    .map((video, index) => (
                      <div key={video._id} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400 dark:text-gray-500 w-6">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {video.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatNumber(video.views)} views
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <VideoUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            dispatch(getChannelVideos());
            dispatch(getChannelStats());
          }}
        />
      )}

      {/* Edit Modal */}
      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onSuccess={() => {
            setEditingVideo(null);
            dispatch(getChannelVideos());
          }}
        />
      )}
    </div>
  );
}

// Stats Card Component
function StatCard({ icon, label, value, bgColor }) {
  return (
    <div className={`${bgColor} rounded-xl p-6`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">{icon}</div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Video Row Component
function VideoRow({ video, onEdit, onDelete, onTogglePublish, detailed }) {
  const thumbnailUrl = typeof video.thumbnail === "string"
    ? video.thumbnail
    : video.thumbnail?.url;

  return (
    <div className={`flex flex-col sm:flex-row gap-4 p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${detailed ? "sm:grid sm:grid-cols-12" : ""}`}>
      {/* Thumbnail and Title */}
      <div className={`flex gap-3 ${detailed ? "sm:col-span-5" : "flex-1"}`}>
        <div className="w-28 sm:w-32 aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              No Thumbnail
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">
            {video.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
            {video.description}
          </p>
        </div>
      </div>

      {detailed && (
        <>
          {/* Visibility */}
          <div className="sm:col-span-2 flex items-center">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                video.isPublished
                  ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              {video.isPublished ? (
                <>
                  <MdVisibility /> Public
                </>
              ) : (
                <>
                  <MdVisibilityOff /> Private
                </>
              )}
            </span>
          </div>

          {/* Views */}
          <div className="sm:col-span-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
            {video.views || 0} views
          </div>

          {/* Date */}
          <div className="sm:col-span-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(video.createdAt)}
          </div>
        </>
      )}

      {/* Actions */}
      <div className={`flex items-center gap-2 ${detailed ? "sm:col-span-1" : ""}`}>
        <button
          onClick={onTogglePublish}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition"
          title={video.isPublished ? "Make Private" : "Make Public"}
        >
          {video.isPublished ? (
            <MdVisibilityOff className="text-gray-600 dark:text-gray-400" />
          ) : (
            <MdVisibility className="text-gray-600 dark:text-gray-400" />
          )}
        </button>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition"
          title="Edit"
        >
          <MdEdit className="text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition"
          title="Delete"
        >
          <MdDelete className="text-red-600" />
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
