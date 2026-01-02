import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { updateAVideo, updateUploadState } from "../Store/Slices/videoSlice";
import { MdClose, MdImage } from "react-icons/md";

function EditVideoModal({ video, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { uploading, uploaded } = useSelector((state) => state.video);

  // Get current thumbnail URL
  const currentThumbnail = typeof video.thumbnail === "string"
    ? video.thumbnail
    : video.thumbnail?.url;

  const [thumbnailPreview, setThumbnailPreview] = useState(currentThumbnail);
  const [newThumbnailFile, setNewThumbnailFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: video.title,
      description: video.description,
    },
  });

  const onSubmit = async (data) => {
    // Only add thumbnail if a new one is selected
    if (newThumbnailFile) {
      data.thumbnail = [newThumbnailFile];
    } else {
      data.thumbnail = null;
    }
    
    await dispatch(updateAVideo({ videoId: video._id, data }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveNewThumbnail = () => {
    setNewThumbnailFile(null);
    setThumbnailPreview(currentThumbnail);
  };

  const handleClose = () => {
    dispatch(updateUploadState());
    onClose();
  };

  if (uploaded) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Changes Saved!</h2>
          <p className="text-gray-600 mb-6">Your video has been updated successfully.</p>
          <button
            onClick={() => {
              handleClose();
              onSuccess();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Edit Video</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Current Video Preview */}
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Current Video</p>
            <div className="flex items-center gap-4">
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  className="w-32 aspect-video rounded-lg object-cover"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{video.title}</p>
                <p className="text-sm text-gray-500">{video.views || 0} views</p>
              </div>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail {newThumbnailFile && <span className="text-green-600 text-xs">(New selected)</span>}
            </label>
            <div className="flex items-center gap-4">
              {thumbnailPreview && (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className={`w-32 aspect-video rounded-lg object-cover ${newThumbnailFile ? 'ring-2 ring-green-500' : 'ring-1 ring-gray-200'}`}
                  />
                  {newThumbnailFile && (
                    <button
                      type="button"
                      onClick={handleRemoveNewThumbnail}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition"
                      title="Remove new thumbnail"
                    >
                      <MdClose className="text-white text-sm" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="flex flex-col items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition">
                  <MdImage className="text-xl text-gray-400 mb-1" />
                  <p className="text-xs text-gray-600">
                    {newThumbnailFile ? 'Change thumbnail' : 'Upload new'}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {newThumbnailFile 
                ? "New thumbnail will be uploaded. Click ✕ to keep the current one."
                : "Leave unchanged to keep the current thumbnail."
              }
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter video title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Tell viewers about your video"
              {...register("description")}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-full font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVideoModal;
