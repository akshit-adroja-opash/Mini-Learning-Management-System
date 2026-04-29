import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AppProviders } from "./providers/AppProviders.jsx";
import "./styles/global.css";
import { Toaster } from "react-hot-toast";


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <App />
      <Toaster />
    </AppProviders>
  </React.StrictMode>
);
