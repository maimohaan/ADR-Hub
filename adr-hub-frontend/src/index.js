import React from "react";
import ReactDOM from "react-dom/client";
import "leaflet/dist/leaflet.css"; // Ensure Leaflet styles are loaded
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; // Import global styles (if any)

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
