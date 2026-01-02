import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    loading: false,
    likedVideos: [],
    hasNextPage: false,
    page: 1,
};

export const toggleVideoLike = createAsyncThunk(
    "toggleVideoLike",
    async (videoId) => {
        try {
            const response = await axiosInstance.post(`/likes/toggle/v/${videoId}`);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const toggleCommentLike = createAsyncThunk(
    "toggleCommentLike",
    async (commentId) => {
        try {
            const response = await axiosInstance.post(`/likes/toggle/c/${commentId}`);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const toggleTweetLike = createAsyncThunk(
    "toggleTweetLike",
    async (tweetId) => {
        try {
            const response = await axiosInstance.post(`/likes/toggle/t/${tweetId}`);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const getLikedVideos = createAsyncThunk(
    "getLikedVideos",
    async ({ page = 1, limit = 20 } = {}) => {
        try {
            const response = await axiosInstance.get(
                `/likes/videos?page=${page}&limit=${limit}`
            );
            return { data: response.data.data, page };
        } catch (error) {
            // Return empty array if no liked videos found
            if (error?.response?.status === 404) {
                return { data: [], page };
            }
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

const likeSlice = createSlice({
    name: "like",
    initialState,
    reducers: {
        resetLikedVideos: (state) => {
            state.likedVideos = [];
            state.page = 1;
            state.hasNextPage = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getLikedVideos.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getLikedVideos.fulfilled, (state, action) => {
            state.loading = false;
            const { data, page } = action.payload;
            // Handle both paginated and non-paginated responses
            const videos = data?.docs || data;
            if (page === 1) {
                state.likedVideos = videos || [];
            } else {
                state.likedVideos = [...state.likedVideos, ...(videos || [])];
            }
            state.hasNextPage = data?.hasNextPage || false;
            state.page = page;
        });
    },
});

export const { resetLikedVideos } = likeSlice.actions;

export default likeSlice.reducer;
