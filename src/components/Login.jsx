import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { userLogin } from "../Store/Slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { closeAuthModal } from "../Store/Slices/uiSlice";
import LoginSkeleton from "../skeleton/loginSkeleton.jsx";
import { MdError } from "react-icons/md";

// SVG Logo component matching favicon
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-10 h-10">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#dc2626',stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#b91c1c',stopOpacity:1}} />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#logoGradient)" />
        <polygon points="26,18 26,46 50,32" fill="white" />
      </svg>
      <span className="text-xl font-bold text-gray-900 tracking-wide">
        STREAMYPLAY
      </span>
    </div>
  );
}

// Input component matching project style
const Input = React.forwardRef(({ label, error, ...props }, ref) => (
  <div className="mb-4">
    <label className="block mb-1.5 text-sm font-medium text-gray-700">{label}</label>
    <input
      ref={ref}
      {...props}
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white transition-all duration-200 ${
        error ? "border-red-400" : "border-gray-300"
      }`}
    />
  </div>
));

// Button component matching project style
function Button({ children, className = "", disabled, ...props }) {
  return (
    <button
      className={`bg-red-600 hover:bg-red-700 text-white rounded-lg ${className} transition-all duration-200 font-semibold py-3 disabled:opacity-60 disabled:cursor-not-allowed`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

function Login() {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth?.loading);
  const [errorMsg, setErrorMsg] = React.useState("");

  const submit = async (data) => {
    setErrorMsg("");
    const isEmail = data.username.includes("@");
    const loginData = isEmail
      ? { email: data.username, password: data.password }
      : data;
    try {
      await dispatch(userLogin(loginData)).unwrap();
      dispatch(closeAuthModal()); // Close any open auth modal
      navigate("/");
    } catch (err) {
      setErrorMsg(err || "Invalid credentials or user not found.");
    }
  };

  if (loading) {
    return <LoginSkeleton message="Signing you in..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Sign in to continue to StreamyPlay
          </p>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <MdError className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium text-sm">Login failed</p>
                <p className="text-red-600 text-sm mt-1">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <div>
              <Input
                label="Username or Email"
                type="text"
                placeholder="Enter your username or email"
                error={errors.username}
                {...register("username", {
                  required: "Username is required",
                })}
              />
              {errors.username && (
                <span className="text-red-500 text-sm -mt-2 block">
                  {errors.username.message}
                </span>
              )}
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                error={errors.password}
                {...register("password", {
                  required: "Password is required",
                })}
              />
              {errors.password && (
                <span className="text-red-500 text-sm -mt-2 block">
                  {errors.password.message}
                </span>
              )}
            </div>

            <Button
              type="submit"
              className="w-full text-base mt-6"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New to StreamyPlay?</span>
            </div>
          </div>

          {/* Sign up link */}
          <Link
            to="/signup"
            className="w-full block text-center py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
