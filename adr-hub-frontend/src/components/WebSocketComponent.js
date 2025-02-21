import React, { useEffect, useState } from "react";
import "./WebSocketComponent.css";
import DisasterMap from "./DisasterMap"; // Import the map component

const WebSocketComponent = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        let socket;

        const connectWebSocket = () => {
            socket = new WebSocket("ws://127.0.0.1:8000/ws");

            socket.onopen = () => console.log("✅ Connected to WebSocket!");

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("📩 Received WebSocket data:", data);
                if (data.NASA_Alerts) {
                    setAlerts(data.NASA_Alerts);
                }
            };

            socket.onclose = () => {
                console.log("❌ WebSocket closed! Reconnecting...");
                setTimeout(connectWebSocket, 5000);
            };

            socket.onerror = (error) => {
                console.error("⚠️ WebSocket Error:", error);
                socket.close();
            };
        };

        connectWebSocket();

        return () => socket?.close();
    }, []);

    return (
        <div className="alerts-container">
            <h2>🔥 Live Disaster Alerts</h2>
            <DisasterMap alerts={alerts} />
            <ul className="alerts-list">
                {alerts.map((alert) => (
                    <li key={alert.id} className="alert-item">
                        <h3>{alert.title}</h3>
                        <p><strong>Category:</strong> {alert.categories[0].title}</p>
                        <p><strong>Source:</strong> <a href={alert.sources[0].url} target="_blank" rel="noopener noreferrer">View Details</a></p>
                        <p><strong>Location:</strong> Lat {alert.geometry[0].coordinates[1]}, Lng {alert.geometry[0].coordinates[0]}</p>
                        <p><strong>Reported On:</strong> {new Date(alert.geometry[0].date).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WebSocketComponent;