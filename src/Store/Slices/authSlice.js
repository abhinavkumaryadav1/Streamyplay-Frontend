import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
import toast from "react-hot-toast";


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


export const createAccount = createAsyncThunk("register", async (data)=>{

    const formData = new FormData();
    formData.append("avatar", data.avatar[0]);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("fullName", data.fullName);
    if (data.coverImage) {
        formData.append("coverImage", data.coverImage[0]);
    }
    
    
    try {
        const response = await axiosInstance.post("/user/register", formData);
        console.log(response.data);
        toast.success("Registered successfully!!!");
        return response.data;
        
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }
})

export const userLogin = createAsyncThunk("login", async (data, { rejectWithValue })=>{
    try {

        const responce = await axiosInstance.post("/user/login",data);
        return responce.data.data.user;

        
    } catch (error) {
        return rejectWithValue(
        error.response?.data?.error || "Login failed"
      );
        

    }
})

export const userLogout = createAsyncThunk("logout", async () => {
    try {
        const response = await axiosInstance.post("/user/logout", {}, { withCredentials: true });
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }
});

export const refreshAccessToken = createAsyncThunk("refreshAccessToken", async (data)=>{
    try {
        
    } catch (error) {
        
    }
})

export const changePassword = createAsyncThunk("changePassword", async(data)=>{
    try {
        
    } catch (error) {
        
    }
})

export const getCurrentUser = createAsyncThunk("getCurrentUser", async ()=>{
    
})

export const updateAvatar = createAsyncThunk("updateAvatar", async (avatar)=>{
    try {
        
    } catch (error) {
        
    }
})

export const updateCoverImg = createAsyncThunk("updateCoverImg", async (coverImage)=>{
    try {
        
    } catch (error) {
        
    }
})

export const updateUserDetails = createAsyncThunk("updateUserDetails", async(data)=>{
    try {
        
    } catch (error) {
        
    }
})

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.userData = action.payload.userData;
            state.status = action.payload.status;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(createAccount.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createAccount.fulfilled, (state) => {
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
    }
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;