import { useState, useEffect } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import NewsFeed from "./components/NewsFeed/NewsFeed";
import MapComponent from "./components/MapComponent";
import DisasterClassifier from "./components/DisasterClassifier";
import WebSocketComponent from "./components/WebSocketComponent";
import DisasterMap from "./components/DisasterMap"; // Import DisasterMap
import DisasterAlerts from "./components/DisasterAlerts"; // ✅ Proper Import


import "./App.css";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://127.0.0.1:8000/disaster_alerts"; // API Endpoint

function Home() {
  return (
    <div className="hero">
      <h1>AI-Powered Disaster Response</h1>
      <p>
        Stay informed with real-time disaster alerts, AI-driven news, and crisis management insights.
      </p>
      <NavLink to="/news" className="cta-button">
        Explore Disaster News
      </NavLink>
    </div>
  );
}

function About() {
  return (
    <div className="about-container">
      <h2>About ADR-Hub</h2>
      <p>
        ADR-Hub is an AI-powered disaster response platform that provides real-time insights
        and updates for crisis management.
      </p>
      <NavLink to="/" className="App-link">
        Go Back Home
      </NavLink>
    </div>
  );
}

function NotFound() {
  return (
    <div className="about-container">
      <h2>Page Not Found</h2>
      <p>Oops! The page you are looking for does not exist.</p>
      <NavLink to="/" className="App-link">
        Go Back Home
      </NavLink>
    </div>
  );
}

function AlertsPage({ alerts }) {
  return (
    <div>
      <h2>Live Disaster Alerts</h2>
      <DisasterAlerts alerts={alerts} /> {/* Pass alerts to DisasterAlerts */}
      <DisasterMap alerts={alerts} /> {/* Pass alerts to DisasterMap */}
    </div>
  );
}

function App() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch disaster alerts");
        }
        const data = await response.json();
        console.log("🚀 Fetched Alerts:", data);
        setAlerts(data.alerts || []);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="container">
      {/* 🔹 Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      {/* 🔹 Navbar */}
      <nav className="navbar">
        <div className="logo">🌍 ADR-Hub</div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
          <NavLink to="/news" className={({ isActive }) => (isActive ? "active" : "")}>
            News
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => (isActive ? "active" : "")}>
            Alerts
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            About
          </NavLink>
          <NavLink to="/classify" className={({ isActive }) => (isActive ? "active" : "")}>
            Disaster Classifier
          </NavLink>
        </div>
      </nav>

      {/* 🔹 Map Component */}
      <MapComponent />

      {/* 🔹 Statistics Section */}
      <div className="stats-container">
        <div className="stats-item">
          <span>2,258</span> <br /> TOTAL COLLECTIONS
        </div>
        <div className="stats-item">
          <span>0</span> <br /> RUNNING COLLECTIONS
        </div>
        <div className="stats-item">
          <span>11,911,908,084</span> <br /> TOTAL FEEDS
        </div>
      </div>

      {/* 🔹 Routes */}
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsFeed />} />
          <Route path="/alerts" element={<AlertsPage alerts={alerts} />} />
          <Route path="/about" element={<About />} />
          <Route path="/classify" element={<DisasterClassifier />} />
          <Route path="/websocket" element={<WebSocketComponent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* 🔹 Footer */}
      <footer className="App-footer">© 2025 ADR-Hub | Powered by AI & Data</footer>
    </div>
  );
}

export default App;
