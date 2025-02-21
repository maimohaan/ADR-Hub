import React, { useEffect, useState } from "react";
import DisasterMap from "./DisasterMap";
import "./WebSocketComponent.css";

const API_URL = "http://127.0.0.1:8000/disaster_alerts";
const WS_URL = "ws://127.0.0.1:8000/ws";  // WebSocket URL

const DisasterAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        console.log("🔄 Fetching alerts from API...");
        const response = await fetch(API_URL);
        console.log("📡 API Response Status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch disaster alerts: ${response.status}`);
        }

        const data = await response.json();
        console.log("📊 Initial Fetched Data:", data);
        setAlerts(data.alerts);
      } catch (error) {
        console.error("❌ Error fetching alerts:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // 🔹 WebSocket connection
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      console.log("🌐 New WebSocket Alert:", event.data);
      try {
        const newAlert = JSON.parse(event.data);
        setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="disaster-alerts">
      <h2></h2>

      {loading && <p>Loading alerts...</p>}
      {error && <p className="error">⚠️ {error}</p>}
      {!loading && !error && alerts.length === 0 && <p>No recent disaster alerts available.</p>}

      {!loading && !error && alerts.length > 0 && (
        <>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>
                <strong>{alert.type}</strong>: {alert.description} ({alert.location})
              </li>
            ))}
          </ul>
          <DisasterMap alerts={alerts} />
        </>
      )}
    </div>
  );
};

export default DisasterAlerts;
