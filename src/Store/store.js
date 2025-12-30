import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./Slices/authSlice.js"

export const store = configureStore({
    reducer:{
        auth: authSlice
    },
})

export default store;