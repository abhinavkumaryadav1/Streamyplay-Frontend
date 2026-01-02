import axios from "axios";
import { store } from "../Store/store";
import { openAuthModal } from "../Store/Slices/uiSlice";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Response interceptor to handle 401 unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if user is not logged in
      const state = store.getState();
      if (!state.auth.userData) {
        // Dispatch action to show auth modal
        store.dispatch(openAuthModal("Please sign in to access this content"));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
