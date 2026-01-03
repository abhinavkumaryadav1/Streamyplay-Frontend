import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Store reference will be set after store is created
let storeRef = null;
let isRefreshing = false;
let failedQueue = [];

export const setStore = (store) => {
  storeRef = store;
};

// Process queued requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Clear auth state and show login modal
const handleAuthFailure = (message = "Session expired. Please login again.") => {
  if (storeRef) {
    // Clear localStorage
    localStorage.removeItem("userData");
    localStorage.removeItem("status");
    
    // Dispatch to clear auth state
    import("../Store/Slices/authSlice").then(({ setUser }) => {
      storeRef.dispatch(setUser({ userData: null, status: false }));
    });
    
    // Show auth modal
    import("../Store/Slices/uiSlice").then(({ openAuthModal }) => {
      storeRef.dispatch(openAuthModal(message));
    });
  }
};

// Response interceptor to handle 401 unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && storeRef) {
      const state = storeRef.getState();
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "";
      
      // Public endpoints that don't require authentication - don't show auth modal for these
      const publicEndpoints = ["/video", "/user/c/", "/user/channel"];
      const isPublicEndpoint = publicEndpoints.some(url => originalRequest.url?.includes(url));
      
      // If user is not logged in and it's not a public endpoint, show auth modal
      if (!state.auth.userData && !isPublicEndpoint) {
        import("../Store/Slices/uiSlice").then(({ openAuthModal }) => {
          storeRef.dispatch(openAuthModal("Please sign in to access this content"));
        });
        return Promise.reject(error);
      }
      
      // If it's a public endpoint and user is not logged in, just reject without showing modal
      if (!state.auth.userData && isPublicEndpoint) {
        return Promise.reject(error);
      }
      
      // Skip refresh for login/register/refresh-token endpoints
      const skipRefreshUrls = ["/user/login", "/user/register", "/user/refresh-token"];
      if (skipRefreshUrls.some(url => originalRequest.url?.includes(url))) {
        return Promise.reject(error);
      }
      
      // If already retried, don't retry again
      if (originalRequest._retry) {
        handleAuthFailure(errorMessage || "Session expired. Please login again.");
        return Promise.reject(error);
      }
      
      // If token refresh is in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Attempt to refresh the token
        await axiosInstance.post("/user/refresh-token");
        
        processQueue(null);
        isRefreshing = false;
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        
        // Determine appropriate message based on error
        let message = "Session expired. Please login again.";
        if (errorMessage.toLowerCase().includes("expired")) {
          message = "Your session has expired. Please login again.";
        } else if (errorMessage.toLowerCase().includes("invalid")) {
          message = "Invalid session. You may have logged in from another account.";
        }
        
        handleAuthFailure(message);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Listen for storage events to sync auth state across tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "userData" || event.key === "status") {
      if (storeRef) {
        const userData = localStorage.getItem("userData");
        const status = localStorage.getItem("status");
        
        import("../Store/Slices/authSlice").then(({ setUser }) => {
          storeRef.dispatch(
            setUser({
              userData: userData ? JSON.parse(userData) : null,
              status: status === "true",
            })
          );
        });
      }
    }
  });
}

export default axiosInstance;
