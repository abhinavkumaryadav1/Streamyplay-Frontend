import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getVideoComments, addComment, clearComments } from "../Store/Slices/commentSlice";
import { openAuthModal } from "../Store/Slices/uiSlice";
import Comment from "./Comment";
import { formatDistanceToNow } from "../helper/timeUtils";

function CommentSection({ videoId }) {
  const dispatch = useDispatch();
  const { comments, totalComments, loading } = useSelector((state) => state.comment);
  const userData = useSelector((state) => state.auth.userData);
  const [newComment, setNewComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    dispatch(clearComments());
    if (videoId) {
      dispatch(getVideoComments({ videoId, page: 1, limit: 20 }));
    }
    return () => {
      dispatch(clearComments());
    };
  }, [dispatch, videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!userData) {
      dispatch(openAuthModal("Sign in to add a comment"));
      return;
    }
    
    await dispatch(addComment({ videoId, content: newComment, userData }));
    setNewComment("");
    setIsFocused(false);
  };

  const handleFocus = () => {
    if (!userData) {
      dispatch(openAuthModal("Sign in to add a comment"));
      return;
    }
    setIsFocused(true);
  };

  const handleCancel = () => {
    setNewComment("");
    setIsFocused(false);
  };

  return (
    <div className="mt-6">
      {/* Comments Header */}
      <div className="flex items-center gap-6 mb-6">
        <h3 className="text-lg font-bold">{totalComments} Comments</h3>
      </div>

      {/* Add Comment */}
      <div className="flex gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {userData?.avatar ? (
            <img
              src={typeof userData.avatar === "string" ? userData.avatar : userData.avatar?.url}
              alt={userData.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-semibold">
              {userData?.username?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={handleFocus}
            placeholder="Add a comment..."
            className="w-full border-b border-gray-300 focus:border-gray-900 outline-none py-2 text-sm bg-transparent transition"
          />
          {isFocused && userData && (
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                  newComment.trim()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Comment
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CommentSkeleton key={i} />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment key={comment._id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

// Comment Skeleton
function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export default CommentSection;
