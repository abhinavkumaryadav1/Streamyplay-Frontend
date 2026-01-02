import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteComment, updateComment } from "../Store/Slices/commentSlice";
import { toggleCommentLike } from "../Store/Slices/likeSlice";
import { formatDistanceToNow } from "../helper/timeUtils";
import { Link } from "react-router-dom";
import { BiLike, BiDislike } from "react-icons/bi";
import { HiDotsVertical } from "react-icons/hi";
import { MdEdit, MdDelete } from "react-icons/md";

function Comment({ comment }) {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);

  const owner = comment.owner || comment.ownerDetails;
  const avatarUrl = typeof owner?.avatar === "string" 
    ? owner?.avatar 
    : owner?.avatar?.url;

  const isOwner = userData?._id === owner?._id;

  const handleLike = async () => {
    if (!userData) return;
    await dispatch(toggleCommentLike(comment._id));
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this comment?")) {
      await dispatch(deleteComment(comment._id));
    }
    setShowMenu(false);
  };

  const handleEdit = async () => {
    if (!editedContent.trim()) return;
    await dispatch(updateComment({ commentId: comment._id, content: editedContent }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <Link to={`/channel/${owner?.username}`} className="flex-shrink-0">
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

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            to={`/channel/${owner?.username}`}
            className="text-sm font-semibold text-gray-900 hover:text-gray-700"
          >
            @{owner?.username}
          </Link>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(comment.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-2">
            <input
              type="text"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full border-b border-gray-900 outline-none py-1 text-sm bg-transparent"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={!editedContent.trim()}
                className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-800 mt-1 break-words">{comment.content}</p>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm hover:bg-gray-100 p-1 rounded-full transition ${
                isLiked ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <BiLike className="text-lg" />
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>
            <button className="text-gray-600 hover:bg-gray-100 p-1 rounded-full transition">
              <BiDislike className="text-lg" />
            </button>
            <button className="text-sm font-medium text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-full">
              Reply
            </button>
          </div>
        )}
      </div>

      {/* Menu for owner */}
      {isOwner && !isEditing && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <HiDotsVertical className="text-gray-600" />
          </button>
          
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 z-20 min-w-[120px]">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <MdEdit /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <MdDelete /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Comment;
