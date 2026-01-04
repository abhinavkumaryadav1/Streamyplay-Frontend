import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
import toast from "react-hot-toast";

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "deksgb6tt";
const CLOUDINARY_UPLOAD_PRESET = "Videos_unsigned";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}`;

// Helper function to upload file directly to Cloudinary
const uploadToCloudinary = async (file, resourceType, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`${CLOUDINARY_UPLOAD_URL}/${resourceType}/upload`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Cloudinary upload failed");
    }

    return response.json();
};

// Upload with XMLHttpRequest for progress tracking
const uploadToCloudinaryWithProgress = (file, resourceType, onProgress) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${CLOUDINARY_UPLOAD_URL}/${resourceType}/upload`);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = Math.round((event.loaded * 100) / event.total);
                onProgress(progress);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);
                    reject(new Error(error.error?.message || "Upload failed"));
                } catch {
                    reject(new Error("Upload failed"));
                }
            }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
    });
};

const initialState = {
    loading: false,
    uploading: false,
    uploaded: false,
    uploadProgress: 0,
    videos: {
        docs: [],
        hasNextPage: false,
    },
    video: null,
    publishToggled: false,
};

export const getAllVideos = createAsyncThunk(
    "getAllVideos",
    async ({ userId, sortBy, sortType, query, page, limit }) => {
        try {
            const params = {};

            if (userId) params.userId = userId;
            if (query) params.search = query;
            if (page) params.page = page;
            if (limit) params.limit = limit;
            if (sortBy && sortType) {
                params.sortBy = sortBy;
                params.sortType = sortType;
            }

            const response = await axiosInstance.get("/video", { params });


            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const getVideoById = createAsyncThunk(
    "getVideoById",
    async ({ videoId }) => {
        try {
            const response = await axiosInstance.get(`/video/${videoId}`);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);


export const publishAvideo = createAsyncThunk(
    "publishAvideo",
    async (data, { dispatch }) => {
        try {
            // Step 1: Upload video to Cloudinary directly (with progress)
            dispatch(setUploadProgress(0));
            toast.loading("Uploading video...", { id: "video-upload" });
            
            const videoFile = data.videoFile[0];
            const thumbnailFile = data.thumbnail[0];

            // Upload video with progress tracking
            const videoResult = await uploadToCloudinaryWithProgress(
                videoFile,
                "video",
                (progress) => {
                    // Video is 90% of total progress
                    dispatch(setUploadProgress(Math.round(progress * 0.9)));
                }
            );

            // Step 2: Upload thumbnail to Cloudinary
            toast.loading("Uploading thumbnail...", { id: "video-upload" });
            const thumbnailResult = await uploadToCloudinary(thumbnailFile, "image");
            dispatch(setUploadProgress(95));

            // Step 3: Send metadata + Cloudinary URLs to backend
            toast.loading("Saving video...", { id: "video-upload" });
            
            const response = await axiosInstance.post("/video", {
                title: data.title,
                description: data.description,
                videoUrl: videoResult.secure_url,
                videoPublicId: videoResult.public_id,
                thumbnailUrl: thumbnailResult.secure_url,
                thumbnailPublicId: thumbnailResult.public_id,
                duration: videoResult.duration || 0,
            });

            dispatch(setUploadProgress(100));
            toast.success(response?.data?.message || "Video published successfully!", { id: "video-upload" });
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message || "Upload failed. Please try again.", { id: "video-upload" });
            throw error;
        }
    }
);

export const updateAVideo = createAsyncThunk(
    "updateAVideo",
    async ({ videoId, data }) => {
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.description);
            
            // Backend requires thumbnail
            if (data.thumbnail && data.thumbnail[0]) {
                formData.append("thumbnail", data.thumbnail[0]);
            }
            
            const response = await axiosInstance.patch(
                `/video/${videoId}`,
                formData
            );
            
            toast.success(response?.data?.message || "Video updated successfully");
            return response.data.data;
        } catch (error) {
            console.error("Update video error:", error?.response?.data);
            const errorMessage = error?.response?.data?.error 
                || error?.response?.data?.message 
                || "Failed to update video";
            toast.error(errorMessage);
            throw error;
        }
    }
);

export const deleteAVideo = createAsyncThunk(
    "deleteAVideo",
    async (videoId) => {
        try {
            const response = await axiosInstance.delete(`/video/${videoId}`);
            toast.success(response?.data?.message);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const togglePublishStatus = createAsyncThunk(
    "togglePublishStatus",
    async (videoId) => {
        try {
            const response = await axiosInstance.patch(
                `/video/toggle/publish/${videoId}`
            );
            toast.success(response.data.message);
            return response.data.data.isPublished;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

const videoSlice = createSlice({
    name: "video",
    initialState,
    reducers: {
        updateUploadState: (state) => {
            state.uploading = false;
            state.uploaded = false;
            state.uploadProgress = 0;
        },
        makeVideosNull: (state) => {
            state.videos.docs = [];
        },
        setUploadProgress: (state, action) => {
            state.uploadProgress = action.payload;
        },
        updateVideoOwnerSubscription: (state, action) => {
            if (state.video?.owner) {
                state.video.owner.isSubscribed = action.payload.isSubscribed;
                state.video.owner.subscribersCount = action.payload.subscribersCount;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getAllVideos.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getAllVideos.fulfilled, (state, action) => {
            state.loading = false;
            state.videos.docs = [...state.videos.docs, ...action.payload.docs];
            state.videos.hasNextPage = action.payload.hasNextPage;
        });
         builder.addCase(getVideoById.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getVideoById.fulfilled, (state, action) => {
            state.loading = false;
            state.video = action.payload;
        });

        builder.addCase(publishAvideo.pending, (state) => {
            state.uploading = true;
        });
        builder.addCase(publishAvideo.fulfilled, (state) => {
            state.uploading = false;
            state.uploaded = true;
        });
        builder.addCase(publishAvideo.rejected, (state) => {
            state.uploading = false;
            state.uploaded = false;
            state.uploadProgress = 0;
        });
        builder.addCase(updateAVideo.pending, (state) => {
            state.uploading = true;
        });
        builder.addCase(updateAVideo.fulfilled, (state, action) => {
            state.uploading = false;
            state.uploaded = true;
            // Update the video in the videos list if it exists
            const index = state.videos.docs.findIndex(v => v._id === action.payload._id);
            if (index !== -1) {
                state.videos.docs[index] = { ...state.videos.docs[index], ...action.payload };
            }
            // Update current video if it's the same
            if (state.video?._id === action.payload._id) {
                state.video = { ...state.video, ...action.payload };
            }
        });
        builder.addCase(updateAVideo.rejected, (state) => {
            state.uploading = false;
        });
        builder.addCase(deleteAVideo.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(deleteAVideo.fulfilled, (state) => {
            state.loading = false;
        });

        builder.addCase(togglePublishStatus.fulfilled, (state) => {
            state.publishToggled = !state.publishToggled;
        });

    }
});



export const { updateUploadState, makeVideosNull, setUploadProgress, updateVideoOwnerSubscription } = videoSlice.actions;

export default videoSlice.reducer;