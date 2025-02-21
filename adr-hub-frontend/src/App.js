import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import NewsFeed from "./components/NewsFeed/NewsFeed";
import MapComponent from "./components/MapComponent";
import DisasterClassifier from "./components/DisasterClassifier";
import DisasterAlerts from "./components/DisasterAlerts";
import SocialMediaAlerts from "./components/SocialMediaAlerts"; // ✅ Import SocialMediaAlerts
import WebSocketComponent from "./components/WebSocketComponent"; // ✅ Import WebSocketComponent

import "./App.css";

function Home() {
  return (
    <div className="hero">
      <h1>AI-Powered Disaster Response</h1>
      <p>Stay informed with real-time disaster alerts, AI-driven news, and crisis management insights.</p>
      <NavLink to="/news" className="cta-button">Explore Disaster News</NavLink>
    </div>
  );
}

function About() {
  return (
    <div className="about-container">
      <h2>About ADR-Hub</h2>
      <p>ADR-Hub is an AI-powered disaster response platform that provides real-time insights and updates for crisis management.</p>
      <NavLink to="/" className="App-link">Go Back Home</NavLink>
    </div>
  );
}

function NotFound() {
  return (
    <div className="about-container">
      <h2>Page Not Found</h2>
      <p>Oops! The page you are looking for does not exist.</p>
      <NavLink to="/" className="App-link">Go Back Home</NavLink>
    </div>
  );
}

function App() {
  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">🌍 ADR-Hub</div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
          <NavLink to="/news" className={({ isActive }) => (isActive ? "active" : "")}>News</NavLink>
          <NavLink to="/alerts" className={({ isActive }) => (isActive ? "active" : "")}>Alerts</NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>About</NavLink>
            <NavLink to="/social-alerts" className={({ isActive }) => (isActive ? "active" : "")}>Social Alerts</NavLink>

          <NavLink to="/classify" className={({ isActive }) => (isActive ? "active" : "")}>Disaster Classifier</NavLink>
        </div>
      </nav>

      <MapComponent />
      <WebSocketComponent /> {/* ✅ Add WebSocketComponent here */}

      {/* Statistics Section */}
      <div className="stats-container">
        <div className="stats-item"><span>2,258</span> <br /> TOTAL COLLECTIONS</div>
        <div className="stats-item"><span>0</span> <br /> RUNNING COLLECTIONS</div>
        <div className="stats-item"><span>11,911,908,084</span> <br /> TOTAL FEEDS</div>
      </div>

      {/* Routes */}
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsFeed />} />
          <Route path="/alerts" element={
            <>
              <DisasterAlerts />
              <SocialMediaAlerts />  {/* ✅ Integrated Social Media Alerts Below Disaster Alerts */}
            </>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/classify" element={<DisasterClassifier />} />
            <Route path="/social-alerts" element={<SocialMediaAlerts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="App-footer">© 2025 ADR-Hub | Powered by AI & Data</footer>
    </div>
  );
}

export default App;
