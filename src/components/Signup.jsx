import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createAccount, userLogin } from "../Store/Slices/authSlice.js";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import LoginSkeleton from "../skeleton/loginSkeleton.jsx";
import GetImagePreview from "./GetImagePreview.jsx";


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

    const submit = async (data) => {
        const response = await dispatch(createAccount(data));
        if (response?.payload?.success) {
            const username = data?.username;
            const password = data?.password;
            const loginResult = await dispatch(
                userLogin({ username, password })
            );

            if (loginResult?.type === "login/fulfilled") {
                navigate("/");
            } else {
                navigate("/login");
            }
        }
    };

    if (loading) {
        return <LoginSkeleton />;
    }

    return (
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
    );
}

export default SignUp;


