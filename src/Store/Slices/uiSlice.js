import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showAuthModal: false,
  authModalMessage: "",
  showFilters: false,
  sortBy: "createdAt",
  sortType: "desc",
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
  },
});

export const { openAuthModal, closeAuthModal, toggleFilters, setFilters, resetFilters } = uiSlice.actions;
export default uiSlice.reducer;
