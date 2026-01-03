import { createSlice } from "@reduxjs/toolkit";

// Get initial theme from localStorage or default to system
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) return savedTheme;
  // Default to system theme for new users
  return "system";
};

const initialState = {
  showAuthModal: false,
  authModalMessage: "",
  showFilters: false,
  sortBy: "createdAt",
  sortType: "desc",
  theme: getInitialTheme(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openAuthModal: (state, action) => {
      state.showAuthModal = true;
      state.authModalMessage = action.payload || "Please sign in to continue";
    },
    closeAuthModal: (state) => {
      state.showAuthModal = false;
      state.authModalMessage = "";
    },
    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    setFilters: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortType = action.payload.sortType;
    },
    resetFilters: (state) => {
      state.sortBy = "createdAt";
      state.sortType = "desc";
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
      // Apply theme to document
      if (action.payload === "dark") {
        document.documentElement.classList.add("dark");
      } else if (action.payload === "light") {
        document.documentElement.classList.remove("dark");
      } else if (action.payload === "system") {
        // Use system preference
        const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (systemDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      state.theme = newTheme;
      localStorage.setItem("theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
  },
});

export const { openAuthModal, closeAuthModal, toggleFilters, setFilters, resetFilters, setTheme, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
