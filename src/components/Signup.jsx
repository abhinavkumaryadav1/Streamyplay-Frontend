import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createAccount, userLogin } from "../Store/Slices/authSlice.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import LoginSkeleton from "../skeleton/loginSkeleton.jsx";
import GetImagePreview from "./GetImagePreview.jsx";
import { FaCheckCircle, FaVideo, FaExclamationTriangle } from "react-icons/fa";
import { MdWarning } from "react-icons/md";


const Input = React.forwardRef(({ label, ...props }, ref) => (
  <div className="mb-4">
    <label className="block mb-1 font-medium text-gray-700">{label}</label>
    <input
      ref={ref}
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-900 bg-white/80 backdrop-blur-md transition-all duration-200 shadow-sm"
    />
  </div>
));

function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`bg-linear-to-r from-purple-500 to-indigo-500 text-white rounded-lg ${className} transition hover:scale-105 hover:shadow-xl font-semibold shadow-md py-3`}
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

    const submit = async (data) => {
        const response = await dispatch(createAccount(data));
        if (response?.payload?.success) {
            const username = data?.username;
            const password = data?.password;
            const loginResult = await dispatch(
                userLogin({ username, password })
            );

            if (loginResult?.type === "login/fulfilled") {
                // Show terms modal instead of navigating directly
                setShowTermsModal(true);
            } else {
                navigate("/login");
            }
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
                  <FaVideo className="text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Terms and Conditions</h3>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg mt-0.5">
                      <FaExclamationTriangle className="text-purple-400 text-sm" />
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
                    <div className="w-6 h-6 border-2 border-gray-500 rounded-md peer-checked:border-purple-500 peer-checked:bg-purple-500 transition-all flex items-center justify-center">
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
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
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

        <div className="w-full min-h-screen text-white p-2 sm:p-3 flex justify-center items-start sm:mt-8 bg-gradient-to-br from-purple-400/30 to-indigo-300/30">
            <div className="flex flex-col space-y-2 justify-center items-center border border-slate-600 p-2 sm:p-3 w-full max-w-xs sm:max-w-md rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md shadow-lg">
                <form
                    onSubmit={handleSubmit(submit)}
                    className="space-y-3 sm:space-y-4 p-1 sm:p-2 text-xs sm:text-sm w-full"
                >
                    <div className="w-full relative h-24 sm:h-28 bg-[#222222] rounded-lg overflow-hidden">
  <GetImagePreview
    name="coverImage"
    control={control}
    className="w-full h-full object-cover"
    cameraIcon
  />

  <div className="text-xs sm:text-sm absolute right-2 bottom-2 text-white/80">
    Cover Image
  </div>

  <div className="absolute left-2 bottom-2 rounded-full border-2 border-white bg-black">
    <GetImagePreview
      name="avatar"
      control={control}
      className="object-cover rounded-full h-12 w-12 sm:h-20 sm:w-20"
      cameraIcon
      cameraSize={20}
    />
  </div>
</div>

                    {errors.avatar && (
                        <div className="text-red-500">
                            {errors.avatar.message}
                        </div>
                    )}
                    <Input
                        label="Username: "
                        type="text"
                        placeholder="Enter username"
                        {...register("username", {
                            required: "username is required",
                        })}
                        className="h-7 sm:h-8"
                    />
                    {errors.username && (
                        <span className="text-red-500">
                            {errors.username.message}
                        </span>
                    )}
                    <Input
                        label="Email: "
                        type="email"
                        placeholder="Enter email"
                        {...register("email", {
                            required: "email is required",
                        })}
                        className="h-7 sm:h-8"
                    />
                    {errors.email && (
                        <span className="text-red-500">
                            {errors.email.message}
                        </span>
                    )}
                    <Input
                        label="Fullname: "
                        type="text"
                        placeholder="Enter fullname"
                        {...register("fullName", {
                            required: "fullName is required",
                        })}
                        className="h-7 sm:h-8"
                    />
                    {errors.fullName && (
                        <span className="text-red-500">
                            {errors.fullName.message}
                        </span>
                    )}
                    <Input
                        label="Password: "
                        type="password"
                        placeholder="Enter password"
                        {...register("password", {
                            required: "password is required",
                        })}
                        className="h-7 sm:h-8"
                    />
                    {errors.password && (
                        <span className="text-red-500">
                            {errors.password.message}
                        </span>
                    )}
                    <Button
                        type="submit"
                        bgcolor="bg-purple-500"
                        className="w-full py-2 sm:py-3 hover:bg-purple-700 text-base sm:text-lg"
                    >
                        Signup
                    </Button>
                    <p className="text-center text-xs sm:text-sm text-neutral-950">
                        Already have an account?{" "}
                        <Link
                            to={"/login"}
                            className="text-purple-600 cursor-pointer hover:opacity-70"
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
        </>
    );
}

export default SignUp;


