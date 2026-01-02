import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showAuthModal: false,
  authModalMessage: "",
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
  },
});

export const { openAuthModal, closeAuthModal } = uiSlice.actions;
export default uiSlice.reducer;
