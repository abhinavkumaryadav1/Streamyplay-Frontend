import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getLikedVideos, resetLikedVideos } from "../Store/Slices/likeSlice";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../skeleton/VideoCardSkeleton";
import { BiLike } from "react-icons/bi";
import InfiniteScroll from "react-infinite-scroll-component";

function LikedVideos() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { likedVideos, loading, hasNextPage, page } = useSelector((state) => state.like);
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    }
    dispatch(resetLikedVideos());
    dispatch(getLikedVideos({ page: 1, limit: 20 }));
  }, [dispatch, userData, navigate]);

  const fetchMoreVideos = useCallback(() => {
    if (hasNextPage && !loading) {
      dispatch(getLikedVideos({ page: page + 1, limit: 20 }));
    }
  }, [dispatch, hasNextPage, loading, page]);

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
              <BiLike className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Liked Videos</h1>
              <p className="text-sm text-gray-600">
                {likedVideos?.length || 0} videos
              </p>
            </div>
          </div>

          {/* Videos Grid */}
          {loading && likedVideos.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, index) => (
                <VideoCardSkeleton key={index} />
              ))}
            </div>
          ) : likedVideos?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <BiLike className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No liked videos yet</h3>
              <p className="text-sm">Videos you like will appear here</p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={likedVideos.length}
              next={fetchMoreVideos}
              hasMore={hasNextPage}
              loader={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-4">
                  {[...Array(4)].map((_, index) => (
                    <VideoCardSkeleton key={index} />
                  ))}
                </div>
              }
              scrollThreshold={0.9}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {likedVideos.map((item, index) => {
                  // Handle different possible response structures
                  const video = item.video || item.likedVideo || item;
                  if (!video?._id) return null;
                  return (
                    <VideoCard key={video._id || index} video={video} />
                  );
                })}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
}

export default LikedVideos;
