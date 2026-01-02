import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./Slices/authSlice.js";
import videoSliceReducer from "./Slices/videoSlice.js";
import userSliceReducer from "./Slices/userSlice.js";
import dashboardSliceReducer from "./Slices/dashboardSlice.js";
import likeSliceReducer from "./Slices/likeSlice.js";
import commentSliceReducer from "./Slices/commentSlice.js";
import subscriptionSliceReducer from "./Slices/subscriptionSlice.js";
import uiSliceReducer from "./Slices/uiSlice.js";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        user: userSliceReducer,
        video: videoSliceReducer,
        dashboard: dashboardSliceReducer,
        like: likeSliceReducer,
        comment: commentSliceReducer,
        subscription: subscriptionSliceReducer,
        ui: uiSliceReducer,
    },
});

export default store;