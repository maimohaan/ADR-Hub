import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// List of locations (latitude, longitude)
const locations = [
  [40.7128, -74.0060], // New York
  [48.8566, 2.3522], // Paris
  [34.0522, -118.2437], // Los Angeles
  [51.5074, -0.1278], // London
  [35.6895, 139.6917], // Tokyo
  [-33.8688, 151.2093], // Sydney
  [28.6139, 77.2090], // New Delhi, India
];

// Helper component to trigger map rendering properly
const MapRefresher = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize(); // Fixes map not rendering correctly
    }, 500);
  }, [map]);
  return null;
};

const MapComponent = () => {
  return (
    <div className="map-container">
      <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={false} style={{ height: "400px", width: "100%" }}>
        <MapRefresher /> {/* Fixes rendering issue */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {locations.map((coords, index) => (
          <CircleMarker
            key={index}
            center={coords}
            radius={8}
            options={{ color: "yellow", fillColor: "gold", fillOpacity: 0.8 }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;

