import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { userLogin } from "../Store/Slices/authSlice.js";
import { useDispatch, useSelector } from "react-redux";
import LoginSkeleton from "../skeleton/loginSkeleton.jsx";

// Simple Logo component
function Logo() {
  return (
    <span className="text-2xl font-bold text-purple-600 drop-shadow-lg">
      StreamyPlay
    </span>
  );
}

// Simple Input component
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

// Simple Button component
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
      const response = await dispatch(userLogin(loginData)).unwrap();
      // Optionally, fetch user info here if needed
      navigate("/");
      
        
      
    } catch (err) {
      
      setErrorMsg(err || "Invalid credentials or user not found.");
        navigate("/login");
    }
  };

  if (loading) {
    return <LoginSkeleton />;
  }

  return (
    <div
      className="w-full min-h-screen flex justify-center items-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%)",
      }}
    >
      {/* Blurred floating gradient shapes */}
      <div
        className="absolute top-0 left-0 w-96 h-96 bg-purple-400 opacity-30 rounded-full blur-3xl animate-pulse"
        style={{ zIndex: 0 }}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-400 opacity-30 rounded-full blur-2xl animate-pulse"
        style={{ zIndex: 0 }}
      ></div>
      <div
        className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-8 flex flex-col items-center z-10"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Logo />
        </div>
        <form onSubmit={handleSubmit(submit)} className="space-y-5 w-full">
          <Input
            label="Username / email : "
            type="text"
            placeholder="example@gmail.com"
            {...register("username", {
              required: "username is required",
            })}
          />
          {errors.username && (
            <span className="text-red-500 text-sm">
              {errors.username.message}
            </span>
          )}
          <Input
            label="Password: "
            type="password"
            placeholder="Your password"
            {...register("password", {
              required: "password is required",
            })}
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
          {errorMsg && <div className="text-red-400 text-sm">{errorMsg}</div>}
          <Button
            type="submit"
            className="w-full text-lg"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
          <p className="text-center text-sm text-gray-700">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-purple-600 cursor-pointer hover:underline"
            >
              SignUp
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
