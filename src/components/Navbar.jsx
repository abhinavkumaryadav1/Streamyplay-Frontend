import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { MdKeyboardVoice, MdLogout } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { userLogout } from "../Store/Slices/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);

  const handleLogout = () => {
    dispatch(userLogout());
  };

  return (
    <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 z-20">
      {/* Left section - Menu + Logo */}
      <div className="flex items-center gap-4">
        <FaBars className="text-2xl cursor-pointer hover:bg-gray-100 p-1 rounded-full" />
        <h1 className="text-xl font-bold text-red-600">StreamyPlay</h1>
      </div>
      {/* Middle - Search Bar */}
      <div className="flex items-center w-[50%] max-w-2xl">
        <input 
          type="text"
          placeholder="Search"
          className="flex-1 border border-gray-300 rounded-l-full px-4 py-2 focus:outline-none"
        />
        <button className="bg-gray-100 border border-gray-300 px-5 py-2 rounded-r-full hover:bg-gray-200">
          <IoSearch className="text-xl" />
        </button>
        <button className="ml-3 bg-gray-100 p-2 rounded-full hover:bg-gray-200">
          <MdKeyboardVoice className="text-xl" />
        </button>
      </div>
      {/* Right section - Auth Buttons */}
      <div className="flex items-center gap-4">
        {!userData && (
          <button
            className="text-sm font-medium px-4 py-2 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
        <button className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
          Sign Up
        </button>
        {userData && (
          <button
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 border border-red-600 text-red-600 rounded-full hover:bg-red-50"
            onClick={handleLogout}
          >
            <MdLogout className="text-lg" /> Logout
          </button>
        )}
        <FaUserCircle className="text-3xl text-gray-700 cursor-pointer hover:text-black" />
      </div>
    </div>
  );
}
