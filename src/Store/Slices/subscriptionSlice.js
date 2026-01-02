import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    loading: false,
    subscribed: null,
    channelSubscribers: [],
    subscribedChannels: [],
};

export const toggleSubscription = createAsyncThunk(
    "toggleSubscription",
    async (channelId) => {
        try {
            const response = await axiosInstance.post(
                `/subscriptions/c/${channelId}`
            );
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const getUserChannelSubscribers = createAsyncThunk(
    "getUserChannelSubscribers",
    async (channelId) => {
        try {
            const response = await axiosInstance.get(
                `/subscriptions/u/${channelId}`
            );
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const getSubscribedChannels = createAsyncThunk(
    "getSubscribedChannels",
    async (subscriberId) => {
        try {
            const response = await axiosInstance.get(
                `/subscriptions/c/${subscriberId}`
            );
            return response.data.data;
        } catch (error) {
            // Return empty array if no subscriptions found (404)
            if (error?.response?.status === 404) {
                return [];
            }
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

const subscriptionSlice = createSlice({
    name: "subscription",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(toggleSubscription.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(toggleSubscription.fulfilled, (state, action) => {
            state.loading = false;
            state.subscribed = action.payload.subscribed;
        });
        builder.addCase(getUserChannelSubscribers.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getUserChannelSubscribers.fulfilled, (state, action) => {
            state.loading = false;
            state.channelSubscribers = action.payload;
        });
        builder.addCase(getSubscribedChannels.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getSubscribedChannels.fulfilled, (state, action) => {
            state.loading = false;
            state.subscribedChannels = action.payload;
        });
    },
});

export default subscriptionSlice.reducer;
