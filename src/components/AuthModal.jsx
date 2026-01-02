import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { FaPlay, FaUserCircle } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";
import { userLogin } from "../Store/Slices/authSlice";
import { closeAuthModal } from "../Store/Slices/uiSlice";

function AuthModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showAuthModal, authModalMessage } = useSelector((state) => state.ui);
  const { loading } = useSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  if (!showAuthModal) return null;

  const handleClose = () => {
    dispatch(closeAuthModal());
    setFormData({ email: "", password: "" });
    setError("");
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const result = await dispatch(userLogin(formData)).unwrap();
      if (result) {
        handleClose();
        // Reload the page to refresh the current content
        window.location.reload();
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const handleGoToSignup = () => {
    handleClose();
    navigate("/signup");
  };

  const handleGoToLogin = () => {
    handleClose();
    navigate("/login");
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition"
          >
            <IoClose className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full">
              <FaPlay className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">StreamyPlay</h2>
              <p className="text-sm text-white/80">Sign in to continue</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          {authModalMessage && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 text-center">
                {authModalMessage}
              </p>
            </div>
          )}

          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          ) : (
            /* Sign Up Prompt */
            <div className="text-center py-4">
              <FaUserCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Create an account to enjoy all features
              </p>
              <button
                onClick={handleGoToSignup}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Create Account
              </button>
            </div>
          )}

          {/* Toggle */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            {isLogin ? (
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-red-600 font-medium hover:underline"
                >
                  Sign Up
                </button>
                {" "}or{" "}
                <button
                  onClick={handleGoToSignup}
                  className="text-red-600 font-medium hover:underline"
                >
                  Create full account
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-red-600 font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handleClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm transition"
          >
            Continue browsing without signing in
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
