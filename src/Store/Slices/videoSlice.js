import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../helper/axiosInstance";
import toast from "react-hot-toast";
import { BASE_URL } from "../../constants";

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
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("videoFile", data.videoFile[0]);
        formData.append("thumbnail", data.thumbnail[0]);

        try {
            // Use direct backend URL to bypass Vercel's 30s timeout for large uploads
            const DIRECT_BACKEND_URL = "https://streamyplay-backend.onrender.com/api/v1";
            const response = await axios.post(`${DIRECT_BACKEND_URL}/video`, formData, {
                withCredentials: true,
                timeout: 600000, // 10 minutes timeout for large video uploads
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    dispatch(setUploadProgress(progress));
                },
            });
            toast.success(response?.data?.message);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || "Upload failed. Try a smaller file or check your connection.");
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