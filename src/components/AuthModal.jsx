import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { FaVideo } from "react-icons/fa";
import { closeAuthModal } from "../Store/Slices/uiSlice";

function AuthModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showAuthModal } = useSelector((state) => state.ui);

  if (!showAuthModal) return null;

  const handleClose = () => {
    dispatch(closeAuthModal());
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleLogin = () => {
    handleClose();
    navigate("/login");
  };

  const handleSignup = () => {
    handleClose();
    navigate("/signup");
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#0f0f0f] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white transition"
        >
          <IoClose className="text-xl" />
        </button>

        {/* Content */}
        <div className="p-8 flex flex-col items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <FaVideo className="text-2xl text-purple-500" />
            <span className="text-xl font-bold text-white tracking-wide">
              STREAMYPLAY
            </span>
          </div>

          {/* Message */}
          <h2 className="text-xl font-semibold text-white mb-8 text-center">
            Login or Signup to continue
          </h2>

          {/* Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition"
            >
              Signup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
