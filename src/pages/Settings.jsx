import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  updateAvatar,
  updateCoverImg,
  updateUserDetails,
  changePassword,
} from "../Store/Slices/authSlice";
import {
  MdSettings,
  MdPerson,
  MdLock,
  MdImage,
  MdEdit,
  MdCameraAlt,
  MdCheck,
  MdClose,
} from "react-icons/md";
import { BiArrowBack } from "react-icons/bi";

function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData, loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not logged in
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="flex flex-col items-center justify-center h-96">
          <MdSettings className="text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-4">Please sign in to access settings</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: MdPerson },
    { id: "images", label: "Avatar & Cover", icon: MdImage },
    { id: "password", label: "Password", icon: MdLock },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-28 sm:pt-20 pb-20 sm:pb-8 sm:ml-64">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-full transition"
            >
              <BiArrowBack className="text-xl" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg">
                <MdSettings className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-600">Manage your account</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <tab.icon className="text-lg" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeTab === "profile" && <ProfileSection userData={userData} loading={loading} dispatch={dispatch} />}
            {activeTab === "images" && <ImagesSection userData={userData} loading={loading} dispatch={dispatch} />}
            {activeTab === "password" && <PasswordSection loading={loading} dispatch={dispatch} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Section - Update Name & Email
function ProfileSection({ userData, loading, dispatch }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      fullName: userData.fullName || "",
      email: userData.email || "",
    },
  });

  const onSubmit = async (data) => {
    await dispatch(updateUserDetails(data));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MdPerson className="text-xl" />
        Profile Information
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Update your personal information
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Username (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={`@${userData.username}`}
            disabled
            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Enter your full name"
            {...register("fullName", { required: "Full name is required" })}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email format",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !isDirty}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <MdCheck className="text-lg" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Images Section - Update Avatar & Cover Image
function ImagesSection({ userData, loading, dispatch }) {
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const currentAvatar = typeof userData.avatar === "string" ? userData.avatar : userData.avatar?.url;
  const currentCover = typeof userData.coverImage === "string" ? userData.coverImage : userData.coverImage?.url;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    
    try {
      await dispatch(updateAvatar(formData));
      setAvatarFile(null);
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async () => {
    if (!coverFile) return;
    
    setUploadingCover(true);
    const formData = new FormData();
    formData.append("coverImage", coverFile);
    
    try {
      await dispatch(updateCoverImg(formData));
      setCoverFile(null);
      setCoverPreview(null);
    } finally {
      setUploadingCover(false);
    }
  };

  const cancelAvatarChange = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const cancelCoverChange = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MdImage className="text-xl" />
        Profile Images
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Update your avatar and cover image
      </p>

      {/* Avatar Section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Avatar
        </label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={avatarPreview || currentAvatar}
              alt="Avatar"
              className={`w-24 h-24 rounded-full object-cover ${avatarPreview ? 'ring-4 ring-blue-500' : 'ring-2 ring-gray-200'}`}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition"
            >
              <MdCameraAlt className="text-sm" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          
          {avatarFile && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">New avatar selected</p>
              <div className="flex gap-2">
                <button
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <MdCheck /> Save
                    </>
                  )}
                </button>
                <button
                  onClick={cancelAvatarChange}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                  <MdClose /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cover Image Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Cover Image
        </label>
        <div className="space-y-4">
          <div className="relative">
            <div className={`w-full h-32 sm:h-40 rounded-xl overflow-hidden ${coverPreview ? 'ring-4 ring-blue-500' : ''}`}>
              {(coverPreview || currentCover) ? (
                <img
                  src={coverPreview || currentCover}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center">
                  <p className="text-gray-600">No cover image</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 bg-gray-900/80 text-white text-sm rounded-lg hover:bg-gray-900 transition"
            >
              <MdCameraAlt /> Change Cover
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>
          
          {coverFile && (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600">New cover image selected</p>
              <div className="flex gap-2">
                <button
                  onClick={handleCoverUpload}
                  disabled={uploadingCover}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {uploadingCover ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <MdCheck /> Save
                    </>
                  )}
                </button>
                <button
                  onClick={cancelCoverChange}
                  disabled={uploadingCover}
                  className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                  <MdClose /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Password Section - Change Password
function PasswordSection({ loading, dispatch }) {
  const [showPasswords, setShowPasswords] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    const result = await dispatch(changePassword({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    }));
    
    if (result.meta.requestStatus === "fulfilled") {
      reset();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MdLock className="text-xl" />
        Change Password
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Update your password to keep your account secure
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Enter current password"
            {...register("oldPassword", { required: "Current password is required" })}
          />
          {errors.oldPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.oldPassword.message}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Enter new password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Confirm new password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Show Password Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPasswords}
            onChange={() => setShowPasswords(!showPasswords)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="showPassword" className="text-sm text-gray-600 cursor-pointer">
            Show passwords
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </>
            ) : (
              <>
                <MdLock className="text-lg" />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
