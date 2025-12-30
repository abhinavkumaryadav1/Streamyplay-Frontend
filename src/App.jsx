
import Layout from "./Layout";
import Login from "./components/Login";
import SignUp from "./components/Signup";
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
        <Route path="/" element={<Layout />} />
        <Route path="/login" element={<Login />} />
        <Route
                    path="/signup"
                    element={
                        
                            <SignUp />
                        
                    }
                />
      </Routes>
    </>
  );
}

export default App;
