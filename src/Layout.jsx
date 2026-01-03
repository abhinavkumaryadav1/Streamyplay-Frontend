
import React from "react";
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import MobileSearchBar from "./components/MobileSearchBar";
import AuthModal from "./components/AuthModal";

function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Navbar />
            <MobileSearchBar />
            <div className="sm:flex flex-none">
                <Sidebar />
                <div className="sm:flex-1">
                    <Outlet />
                </div>
            </div>
            <BottomNav />
            <AuthModal />
        </div>
    );
}

export default Layout;
