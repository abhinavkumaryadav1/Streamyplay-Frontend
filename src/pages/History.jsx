import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getWatchHistory } from "../Store/Slices/userSlice";
import VideoCardHorizontal from "../components/VideoCardHorizontal";
import VideoCardHorizontalSkeleton from "../skeleton/VideoCardHorizontalSkeleton";
import { MdHistory } from "react-icons/md";

function History() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { history, loading } = useSelector((state) => state.user);
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    }
    dispatch(getWatchHistory());
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
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <MdHistory className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Watch History</h1>
              <p className="text-sm text-gray-600">
                {history?.length || 0} videos
              </p>
            </div>
          </div>

          {/* History List */}
          {loading ? (
            <div className="space-y-4 max-w-4xl">
              {[...Array(8)].map((_, index) => (
                <VideoCardHorizontalSkeleton key={index} />
              ))}
            </div>
          ) : history?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <MdHistory className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No watch history</h3>
              <p className="text-sm">Videos you watch will appear here</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {history.map((video) => (
                <VideoCardHorizontal key={video._id} video={video} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default History;
