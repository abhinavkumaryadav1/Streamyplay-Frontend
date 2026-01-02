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

ReactDOM.createRoot(document.getElementById("root")).render(
  
      <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
       </Provider>

    
)
