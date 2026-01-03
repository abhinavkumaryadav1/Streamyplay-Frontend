import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { createAccount, userLogin } from "../Store/Slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import LoginSkeleton from "../skeleton/loginSkeleton.jsx";
import GetImagePreview from "./GetImagePreview.jsx";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { MdWarning, MdError, MdVideoLibrary } from "react-icons/md";

// SVG Logo component matching favicon
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-10 h-10">
        <defs>
          <linearGradient id="logoGradientSignup" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#dc2626',stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#b91c1c',stopOpacity:1}} />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#logoGradientSignup)" />
        <polygon points="26,18 26,46 50,32" fill="white" />
      </svg>
      <span className="text-xl font-bold text-gray-900 tracking-wide">
        STREAMYPLAY
      </span>
    </div>
  );
}

const Input = React.forwardRef(({ label, error, ...props }, ref) => (
  <div className="mb-3">
    <label className="block mb-1.5 text-sm font-medium text-gray-700">{label}</label>
    <input
      ref={ref}
      {...props}
      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white transition-all duration-200 text-sm ${
        error ? "border-red-400" : "border-gray-300"
      }`}
    />
  </div>
));

function Button({ children, className = "", disabled, ...props }) {
  return (
    <button
      className={`bg-red-600 hover:bg-red-700 text-white rounded-lg ${className} transition-all duration-200 font-semibold py-2.5 disabled:opacity-60 disabled:cursor-not-allowed`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

function SignUp() {
    const {
        handleSubmit,
        register,
        control,
        formState: { errors },
    } = useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.auth?.loading);
    
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const submit = async (data) => {
        setErrorMsg("");
        try {
            const response = await dispatch(createAccount(data)).unwrap();
            if (response?.success) {
                const username = data?.username;
                const password = data?.password;
                const loginResult = await dispatch(
                    userLogin({ username, password })
                );

                if (loginResult?.type === "login/fulfilled") {
                    setShowTermsModal(true);
                } else {
                    navigate("/login");
                }
            }
        } catch (err) {
            // err is the rejected value from rejectWithValue (a string)
            setErrorMsg(typeof err === 'string' ? err : "Registration failed. Please try again.");
        }
    };

    const handleContinue = () => {
        setShowTermsModal(false);
        navigate("/");
    };

    if (loading) {
        return <LoginSkeleton />;
    }

    return (
        <>
        {/* Terms and Conditions Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-white/20 rounded-full">
                    <FaCheckCircle className="text-3xl text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white">Welcome to StreamyPlay!</h2>
                <p className="text-white/80 text-sm mt-1">Account created successfully</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MdVideoLibrary className="text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Terms and Conditions</h3>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-red-500/20 rounded-lg mt-0.5">
                      <FaExclamationTriangle className="text-red-400 text-sm" />
                    </div>
                    <p className="text-gray-300 text-sm">This is my personal project.</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg mt-0.5">
                      <MdWarning className="text-blue-400 text-sm" />
                    </div>
                    <p className="text-gray-300 text-sm">This web app is still in development.</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-amber-500/20 rounded-lg mt-0.5">
                      <MdWarning className="text-amber-400 text-sm" />
                    </div>
                    <p className="text-gray-300 text-sm">
                      <span className="text-amber-400 font-medium">Do not upload videos greater than 100 MB</span> or else it will not upload on cloud.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-red-500/20 rounded-lg mt-0.5">
                      <FaExclamationTriangle className="text-red-400 text-sm" />
                    </div>
                    <p className="text-gray-300 text-sm">
                      <span className="text-red-400 font-medium">Upload no content that is illegal and A rated.</span>
                    </p>
                  </div>
                </div>

                {/* Checkbox */}
                <label className="flex items-center gap-3 mt-5 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-6 h-6 border-2 border-gray-500 rounded-md peer-checked:border-red-500 peer-checked:bg-red-500 transition-all flex items-center justify-center">
                      {termsAccepted && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300 text-sm group-hover:text-white transition">
                    I agree to the terms and conditions
                  </span>
                </label>

                {/* Continue Button */}
                <div className={`mt-6 transition-all duration-300 ${termsAccepted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                  <button
                    onClick={handleContinue}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2"
                  >
                    <span>Continue to StreamyPlay</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <Logo />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                        Create an account
                    </h1>
                    <p className="text-gray-600 text-center mb-6 text-sm">
                        Join StreamyPlay to share and watch videos
                    </p>

                    {/* Error Alert */}
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <MdError className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-800 font-medium text-sm">Registration failed</p>
                                <p className="text-red-600 text-sm mt-1">{errorMsg}</p>
                            </div>
                        </div>
                    )}

                <form
                    onSubmit={handleSubmit(submit)}
                    className="space-y-4"
                >
                    {/* Cover & Avatar Section */}
                    <div className="relative">
                        {/* Cover Image */}
                        <div className="w-full h-24 sm:h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <GetImagePreview
                                name="coverImage"
                                control={control}
                                className="w-full h-full object-cover"
                                cameraIcon
                                required={false}
                            />
                        </div>
                        
                        {/* Avatar - positioned over cover */}
                        <div className="absolute -bottom-6 left-4">
                            <div className="rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                                <GetImagePreview
                                    name="avatar"
                                    control={control}
                                    className="object-cover rounded-full h-16 w-16 sm:h-20 sm:w-20"
                                    cameraIcon
                                    cameraSize={16}
                                />
                            </div>
                        </div>
                        
                        {/* Optional label */}
                        <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white/90 px-2 py-0.5 rounded shadow-sm">
                            Cover (Optional)
                        </div>
                    </div>
                    
                    {/* Spacer for avatar overflow */}
                    <div className="pt-4">
                        <p className="text-xs text-gray-500">Avatar is required, cover image is optional</p>
                    </div>

                    {errors.avatar && (
                        <div className="text-red-500 text-sm">
                            {errors.avatar.message}
                        </div>
                    )}

                    <div>
                        <Input
                            label="Username"
                            type="text"
                            placeholder="Choose a username"
                            error={errors.username}
                            {...register("username", {
                                required: "Username is required",
                            })}
                        />
                        {errors.username && (
                            <span className="text-red-500 text-xs -mt-2 block">
                                {errors.username.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            error={errors.email}
                            {...register("email", {
                                required: "Email is required",
                            })}
                        />
                        {errors.email && (
                            <span className="text-red-500 text-xs -mt-2 block">
                                {errors.email.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="Enter your full name"
                            error={errors.fullName}
                            {...register("fullName", {
                                required: "Full name is required",
                            })}
                        />
                        {errors.fullName && (
                            <span className="text-red-500 text-xs -mt-2 block">
                                {errors.fullName.message}
                            </span>
                        )}
                    </div>

                    <div>
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Create a password"
                            error={errors.password}
                            {...register("password", {
                                required: "Password is required",
                            })}
                        />
                        {errors.password && (
                            <span className="text-red-500 text-xs -mt-2 block">
                                {errors.password.message}
                            </span>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-base mt-4"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Already have an account?</span>
                    </div>
                </div>

                {/* Login link */}
                <Link
                    to="/login"
                    className="w-full block text-center py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 text-sm"
                >
                    Sign in instead
                </Link>
                </div>
            </div>
        </div>
        </>
    );
}

export default SignUp;


