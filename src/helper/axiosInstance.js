import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Store reference will be set after store is created
let storeRef = null;

export const setStore = (store) => {
  storeRef = store;
};

// Response interceptor to handle 401 unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && storeRef) {
      // Check if user is not logged in
      const state = storeRef.getState();
      if (!state.auth.userData) {
        // Dynamically import to avoid circular dependency
        import("../Store/Slices/uiSlice").then(({ openAuthModal }) => {
          storeRef.dispatch(openAuthModal("Please sign in to access this content"));
        });
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
