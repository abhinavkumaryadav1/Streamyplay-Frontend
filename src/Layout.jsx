
import React from "react";
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import MobileSearchBar from "./components/MobileSearchBar";

function Layout() {
    return (
        <>
            <Navbar />
            <MobileSearchBar />
            <div className="sm:flex flex-none">
                <Sidebar />
                <div className="sm:flex-1">
                    <Outlet />
                </div>
            </div>
            <BottomNav />
        </>
    );
}

export default Layout;
