import  React from "react";
import './index.css'
import App from './App.jsx'
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from "./Store/store.js";
import { setStore } from "./helper/axiosInstance.js";

// Set store reference for axios interceptor
setStore(store);

// Apply initial theme before render to prevent flash
const savedTheme = localStorage.getItem("theme");
const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
// Only apply dark mode if explicitly set to dark, or if set to system and system is dark
if (savedTheme === "dark" || (savedTheme === "system" && systemDark)) {
  document.documentElement.classList.add("dark");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  
      <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
       </Provider>

    
)
