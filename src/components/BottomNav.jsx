import { NavLink } from "react-router-dom";
import { MdHome, MdSubscriptions, MdHistory } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { RxDashboard } from "react-icons/rx";

const navItems = [
  { to: "/", icon: <MdHome />, label: "Home" },
  { to: "/liked-videos", icon: <BiLike />, label: "Liked Videos" },
  { to: "/subscriptions", icon: <MdSubscriptions />, label: "Subscriptions" },
  { to: "/dashboard", icon: <RxDashboard />, label: "My Dashboard" },
  { to: "/history", icon: <MdHistory />, label: "History" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-between items-center px-2 py-1 z-40 sm:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
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
