import { BiLike } from "react-icons/bi";
import { RxDashboard } from "react-icons/rx";
import {MdHome,MdSubscriptions,MdHistory,MdSettings, MdLogout} from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userLogout } from "../Store/Slices/authSlice";
import { openAuthModal } from "../Store/Slices/uiSlice";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);

  // Menu items - some require auth
  const mainMenu = [
    { icon: <MdHome />, text: "Home", url: "/", requiresAuth: false },
    { icon: <BiLike />, text: "Liked Videos", url: "/liked-videos", requiresAuth: true },
    { icon: <MdSubscriptions />, text: "Subscriptions", url: "/subscriptions", requiresAuth: true },
  ];
  const libraryMenu = [
    { icon: <RxDashboard />, text: "My Dashboard", url: "/dashboard", requiresAuth: true },
    { icon: <MdHistory />, text: "History", url: "/history", requiresAuth: true },
  ];

  const handleLogout = async () => {
    await dispatch(userLogout());
    navigate("/");
  };

  const handleMenuClick = (e, item) => {
    if (item.requiresAuth && !userData) {
      e.preventDefault();
      dispatch(openAuthModal("Login or Signup to continue"));
    }
  };

  return (
    <div className="hidden sm:flex w-64 h-screen bg-white border-r border-gray-300 fixed left-0 top-16 p-4 overflow-y-auto flex-col z-30">
      <div className="bg-gray-100 rounded-xl p-3 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col gap-3 px-1">
          {mainMenu.map((item, index) => (
            <NavLink 
              to={item.url} 
              key={index}
              onClick={(e) => handleMenuClick(e, item)}
            >
              {({ isActive }) => (
                <div className={`flex items-center gap-5 p-4 rounded-lg cursor-pointer shadow-sm transition ${isActive ? 'bg-red-50 border-l-4 border-red-600' : 'bg-white hover:bg-gray-200'}`}>
                  <span className={`text-2xl ${isActive ? 'text-red-600' : ''}`}>{item.icon}</span>
                  <span className={`text-base font-semibold ${isActive ? 'text-red-600' : ''}`}>{item.text}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
        <div className="border-t border-gray-300"></div>
        <div className="flex flex-col gap-3 px-1">
          {libraryMenu.map((item, index) => (
            <NavLink 
              to={item.url} 
              key={index}
              onClick={(e) => handleMenuClick(e, item)}
            >
              {({ isActive }) => (
                <div className={`flex items-center gap-5 p-4 rounded-lg cursor-pointer shadow-sm transition ${isActive ? 'bg-red-50 border-l-4 border-red-600' : 'bg-white hover:bg-gray-200'}`}>
                  <span className={`text-2xl ${isActive ? 'text-red-600' : ''}`}>{item.icon}</span>
                  <span className={`text-base font-semibold ${isActive ? 'text-red-600' : ''}`}>{item.text}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="mt-auto mb-10">
        <div className="bg-gray-100 rounded-xl p-3 shadow-sm flex flex-col gap-2">
          <NavLink to="/settings">
            {({ isActive }) => (
              <div className={`flex items-center gap-5 p-4 rounded-lg cursor-pointer shadow-sm transition ${isActive ? 'bg-red-50 border-l-4 border-red-600' : 'bg-white hover:bg-gray-200'}`}>
                <span className={`text-2xl ${isActive ? 'text-red-600' : ''}`}><MdSettings /></span>
                <span className={`text-base font-semibold ${isActive ? 'text-red-600' : ''}`}>Settings</span>
              </div>
            )}
          </NavLink>
          {userData && (
            <div
              className="flex items-center gap-5 p-4 rounded-lg cursor-pointer bg-white hover:bg-gray-200 transition shadow-sm mt-2"
              onClick={handleLogout}
            >
              <span className="text-2xl"><MdLogout /></span>
              <span className="text-base font-semibold">Logout</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;


