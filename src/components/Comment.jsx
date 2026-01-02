import React, { useState, useEffect, useRef } from "react";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef(null);

  const owner = comment.owner || comment.ownerDetails;
  const avatarUrl = typeof owner?.avatar === "string" 
    ? owner?.avatar 
    : owner?.avatar?.url;

  // Handle both cases: owner as object with _id, or owner as string ID
  const ownerId = typeof owner === "string" ? owner : owner?._id;
  const isOwner = userData?._id === ownerId;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleLike = async () => {
    if (!userData) return;
    await dispatch(toggleCommentLike(comment._id));
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this comment?")) {
      setIsDeleting(true);
      try {
        await dispatch(deleteComment(comment._id));
      } finally {
        setIsDeleting(false);
      }
    }
    setShowMenu(false);
  };

  const handleEdit = async () => {
    if (!editedContent.trim() || editedContent === comment.content) {
      setIsEditing(false);
      return;
    }
    setIsUpdating(true);
    try {
      await dispatch(updateComment({ commentId: comment._id, content: editedContent }));
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
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
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                }
                if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
              className="w-full border border-gray-300 rounded-lg outline-none p-2 text-sm bg-transparent resize-none focus:border-blue-500"
              rows={2}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={!editedContent.trim() || isUpdating}
                className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
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
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
          >
            <HiDotsVertical className="text-gray-600" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 z-20 min-w-[140px] border border-gray-100">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <MdEdit className="text-base" /> Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <MdDelete className="text-base" /> Delete
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Comment;
