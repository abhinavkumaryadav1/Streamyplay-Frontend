import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    loading: false,
    profileData: null,
    history: [],
};

export const userChannelProfile = createAsyncThunk(
    "getUserChannelProfile",
    async (username) => {
        try {
            const response = await axiosInstance.get(`/user/c/${username}`);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const getWatchHistory = createAsyncThunk("getWatchHistory", async () => {
    try {
        const response = await axiosInstance.get("/user/history");
        return response.data.data;
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.error);
        throw error;
    }
});



const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateProfileSubscription: (state, action) => {
            if (state.profileData) {
                state.profileData.isSubscribed = action.payload.isSubscribed;
                state.profileData.subscribersCount = action.payload.subscribersCount;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(userChannelProfile.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(userChannelProfile.fulfilled, (state, action) => {
            state.loading = false;
            state.profileData = action.payload;
        });
        builder.addCase(getWatchHistory.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getWatchHistory.fulfilled, (state, action) => {
            state.loading = false;
            state.history = action.payload;
        });
    },
});

export const { updateProfileSubscription } = userSlice.actions;

export default userSlice.reducer;
