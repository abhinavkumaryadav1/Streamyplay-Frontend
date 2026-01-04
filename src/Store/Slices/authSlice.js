import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
import toast from "react-hot-toast";
import getErrorMessage from "../../helper/getErrorMessage";

 

const getInitialUser = () => {
    const userData = localStorage.getItem("userData");
    const status = localStorage.getItem("status");
    return {
        loading: false,
        status: status === "true",
        userData: userData ? JSON.parse(userData) : null
    };
};

const initialState = getInitialUser();


export const createAccount = createAsyncThunk("register", async (data, { rejectWithValue })=>{

    const formData = new FormData();
    formData.append("avatar", data.avatar[0]);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("fullName", data.fullName);
    if (data.coverImage && data.coverImage[0]) {
        formData.append("coverImage", data.coverImage[0]);
    }
    
    
    try {
        const response = await axiosInstance.post("/user/register", formData);
        console.log(response.data);
        toast.success("Registered successfully!!!");
        return response.data;
        
    } catch (error) {
        console.log("Registration error:", error?.response?.data);
        const errorMessage = getErrorMessage(error) || "Registration failed. Please try again.";
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
    }
})

export const userLogin = createAsyncThunk("login", async (data, { rejectWithValue })=>{
    try {

        const responce = await axiosInstance.post("/user/login",data);
        return responce.data.data.user;

        
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return rejectWithValue(errorMessage);
    }
})

export const userLogout = createAsyncThunk("logout", async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post("/user/logout", {}, { withCredentials: true });
        return response.data;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
    }
});

export const refreshAccessToken = createAsyncThunk("refreshAccessToken", async (data, { rejectWithValue })=>{
    try {
        const response = await axiosInstance.post(
                "/user/refresh-token",
                data
            );
            return response.data;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
    }
})

export const changePassword = createAsyncThunk("changePassword", async(data, { rejectWithValue })=>{
    try {
         const response = await axiosInstance.post(
                "/user/change-password",
                data
            );
            toast.success(response.data?.message);
            return response.data;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
    }
})

export const getCurrentUser = createAsyncThunk("getCurrentUser", async (_, { rejectWithValue })=>{
    try {
        const response = await axiosInstance.get("/user/current-user");
        return response.data.data;
    } catch (error) {
        // If unauthorized, clear local storage to sync state
        if (error.response?.status === 401) {
            localStorage.removeItem("userData");
            localStorage.removeItem("status");
        }
        const errorMessage = getErrorMessage(error);
        return rejectWithValue(errorMessage);
    }
})

export const updateAvatar = createAsyncThunk("updateAvatar", async (avatar, { rejectWithValue })=>{
    try {
        const response = await axiosInstance.patch(
            "/user/avatar",
            avatar
        );
        toast.success("Updated details successfully!!!");
        return response.data.data;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
    }
})

export const updateCoverImg = createAsyncThunk("updateCoverImg", async (coverImage, { rejectWithValue })=>{
    try {
        const response = await axiosInstance.patch(
                "/user/cover-image",
                coverImage
            );
            toast.success(response.data?.message);
            return response.data.data;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
    }
})

export const updateUserDetails = createAsyncThunk("updateUserDetails", async(data, { rejectWithValue })=>{
    try {
        const response = await axiosInstance.patch(
                "/user/update-account",
                data
            );
            toast.success("Updated details successfully!!!");
            return response.data;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
    }
})

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.userData = action.payload.userData;
            state.status = action.payload.status;
            // Sync to localStorage when setting user
            if (action.payload.userData) {
                localStorage.setItem("userData", JSON.stringify(action.payload.userData));
                localStorage.setItem("status", String(action.payload.status));
            } else {
                localStorage.removeItem("userData");
                localStorage.removeItem("status");
            }
        },
        forceLogout: (state) => {
            state.loading = false;
            state.status = false;
            state.userData = null;
            localStorage.removeItem("userData");
            localStorage.removeItem("status");
        },
    },
    extraReducers: (builder) => {
        builder.addCase(createAccount.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createAccount.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(createAccount.rejected, (state) => {
            state.loading = false;
        });
        builder.addCase(userLogin.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(userLogin.fulfilled, (state, action) => {
            state.loading = false;
            state.status = true;
            state.userData = action.payload;
            localStorage.setItem("userData", JSON.stringify(action.payload));
            localStorage.setItem("status", "true");
            toast.success("Login successful");
        });
        builder.addCase(userLogin.rejected, (state, action) => {
            state.loading = false;
            state.status = false;
            state.userData = null;
            localStorage.removeItem("userData");
            localStorage.removeItem("status");
            toast.error(action.payload);
        });
        builder.addCase(userLogout.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(userLogout.fulfilled, (state, action) => {
            state.loading = false;
            state.status = false;
            state.userData = null;
            localStorage.removeItem("userData");
            localStorage.removeItem("status");
            toast.success(action.payload?.message || "Logged out successfully");
        });
        builder.addCase(getCurrentUser.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getCurrentUser.fulfilled, (state, action) => {
            state.loading = false;
            state.status = true;
            state.userData = action.payload;
            // Sync fresh user data to localStorage
            localStorage.setItem("userData", JSON.stringify(action.payload));
            localStorage.setItem("status", "true");
        });
        builder.addCase(getCurrentUser.rejected, (state) => {
            state.loading = false;
            state.status = false;
            state.userData = null;
            localStorage.removeItem("userData");
            localStorage.removeItem("status");
        });
        builder.addCase(updateAvatar.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(updateAvatar.fulfilled, (state, action) => {
            state.loading = false;
            state.userData = action.payload;
            localStorage.setItem("userData", JSON.stringify(action.payload));
        });
        builder.addCase(updateAvatar.rejected, (state) => {
            state.loading = false;
        });
        builder.addCase(updateCoverImg.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(updateCoverImg.fulfilled, (state, action) => {
            state.loading = false;
            state.userData = action.payload;
            localStorage.setItem("userData", JSON.stringify(action.payload));
        });
        builder.addCase(updateCoverImg.rejected, (state) => {
            state.loading = false;
        });
        builder.addCase(updateUserDetails.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(updateUserDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.userData = action.payload.data || action.payload;
            localStorage.setItem("userData", JSON.stringify(state.userData));
        });
        builder.addCase(updateUserDetails.rejected, (state) => {
            state.loading = false;
        });
    }
});

export const { setUser, forceLogout } = authSlice.actions;
export default authSlice.reducer;