import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { FaVideo } from "react-icons/fa";
import { closeAuthModal } from "../Store/Slices/uiSlice";

function AuthModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAuthModal } = useSelector((state) => state.ui);

  if (!showAuthModal) return null;

  const handleClose = () => {
    dispatch(closeAuthModal());
    // Navigate to home if user is on a protected route
    if (location.pathname !== "/") {
      navigate("/");
    }
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
        >
          <IoClose className="text-xl" />
        </button>

        {/* Content */}
        <div className="p-8 flex flex-col items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" rx="20" fill="url(#grad1)"/>
              <path d="M35 25L75 50L35 75V25Z" fill="white"/>
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dc2626"/>
                  <stop offset="100%" stopColor="#b91c1c"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
              STREAMYPLAY
            </span>
          </div>

          {/* Message */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            Login or Signup to continue
          </h2>

          {/* Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
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
