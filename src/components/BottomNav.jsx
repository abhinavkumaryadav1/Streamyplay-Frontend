import { NavLink } from "react-router-dom";
import { MdHome, MdSubscriptions, MdHistory, MdSettings } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { RxDashboard } from "react-icons/rx";
import { useSelector, useDispatch } from "react-redux";
import { openAuthModal } from "../Store/Slices/uiSlice";

const navItems = [
  { to: "/", icon: <MdHome />, label: "Home", requiresAuth: false },
  { to: "/liked-videos", icon: <BiLike />, label: "Liked", requiresAuth: true },
  { to: "/subscriptions", icon: <MdSubscriptions />, label: "Subs", requiresAuth: true },
  { to: "/dashboard", icon: <RxDashboard />, label: "Dashboard", requiresAuth: true },
  { to: "/settings", icon: <MdSettings />, label: "Settings", requiresAuth: false },
];

export default function BottomNav() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);

  const handleNavClick = (e, item) => {
    if (item.requiresAuth && !userData) {
      e.preventDefault();
      dispatch(openAuthModal("Login or Signup to continue"));
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-between items-center px-2 py-1 z-40 sm:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={(e) => handleNavClick(e, item)}
          className={({ isActive }) =>
            `flex flex-col items-center flex-1 text-[11px] py-1 px-1 transition-colors ${
              isActive ? "text-red-600" : "text-gray-500"
            }`
          }
        >
          <span className="text-2xl mb-0.5">{item.icon}</span>
          <span className="leading-tight text-center break-words max-w-[70px]">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
