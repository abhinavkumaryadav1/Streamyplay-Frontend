
import Layout from "./Layout";
import Login from "./components/Login";
import SignUp from "./components/Signup";
import Home from "./pages/Home";
import WatchPage from "./pages/WatchPage";
import ChannelPage from "./pages/ChannelPage";
import LikedVideos from "./pages/LikedVideos";
import Subscriptions from "./pages/Subscriptions";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import SearchResults from "./pages/SearchResults";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./Store/Slices/authSlice";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    const status = localStorage.getItem("status");
    if (userData && status === "true") {
      dispatch(setUser({ userData: JSON.parse(userData), status: true }));
    }
  }, [dispatch]);
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="watch/:videoId" element={<WatchPage />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="channel/:username" element={<ChannelPage />} />
          <Route path="liked-videos" element={<LikedVideos />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="history" element={<History />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </>
  );
}

export default App;
