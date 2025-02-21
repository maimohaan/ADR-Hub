import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DisasterMap = ({ alerts }) => {
    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: "400px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {alerts.map((alert) => (
                alert.geometry && alert.geometry.length > 0 ? (
                    <Marker
                        key={alert.id}
                        position={[alert.geometry[0].coordinates[1], alert.geometry[0].coordinates[0]]}
                    >
                        <Popup>
                            <h3>{alert.title}</h3>
                            <p><strong>Category:</strong> {alert.categories[0].title}</p>
                            <p><strong>Reported On:</strong> {new Date(alert.geometry[0].date).toLocaleString()}</p>
                            <a href={alert.link} target="_blank" rel="noopener noreferrer">More Details</a>
                        </Popup>
                    </Marker>
                ) : null
            ))}
        </MapContainer>
    );
};

export default DisasterMap;
