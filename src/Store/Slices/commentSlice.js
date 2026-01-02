import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    loading: false,
    comments: [],
    totalComments: 0,
    hasNextPage: false,
};

export const getVideoComments = createAsyncThunk(
    "getVideoComments",
    async ({ videoId, page = 1, limit = 10 }) => {
        try {
            const response = await axiosInstance.get(
                `/comment/${videoId}?page=${page}&limit=${limit}`
            );
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const addComment = createAsyncThunk(
    "addComment",
    async ({ videoId, content }) => {
        try {
            const response = await axiosInstance.post(`/comment/${videoId}`, {
                content,
            });
            toast.success("Comment added!");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const updateComment = createAsyncThunk(
    "updateComment",
    async ({ commentId, content }) => {
        try {
            const response = await axiosInstance.patch(`/comment/c/${commentId}`, {
                content,
            });
            toast.success("Comment updated!");
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const deleteComment = createAsyncThunk(
    "deleteComment",
    async (commentId) => {
        try {
            const response = await axiosInstance.delete(`/comment/c/${commentId}`);
            toast.success("Comment deleted!");
            return commentId;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

const commentSlice = createSlice({
    name: "comment",
    initialState,
    reducers: {
        clearComments: (state) => {
            state.comments = [];
            state.totalComments = 0;
            state.hasNextPage = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getVideoComments.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getVideoComments.fulfilled, (state, action) => {
            state.loading = false;
            state.comments = action.payload.docs || action.payload;
            state.totalComments = action.payload.totalDocs || action.payload.length;
            state.hasNextPage = action.payload.hasNextPage || false;
        });
        builder.addCase(addComment.fulfilled, (state, action) => {
            state.comments.unshift(action.payload);
            state.totalComments += 1;
        });
        builder.addCase(deleteComment.fulfilled, (state, action) => {
            state.comments = state.comments.filter(
                (comment) => comment._id !== action.payload
            );
            state.totalComments -= 1;
        });
        builder.addCase(updateComment.fulfilled, (state, action) => {
            const index = state.comments.findIndex(
                (comment) => comment._id === action.payload._id
            );
            if (index !== -1) {
                state.comments[index] = action.payload;
            }
        });
    },
});

export const { clearComments } = commentSlice.actions;
export default commentSlice.reducer;
