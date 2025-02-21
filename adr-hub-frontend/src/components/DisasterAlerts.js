import React, { useEffect, useState } from "react";

const API_URLS = {
    nasa: "https://eonet.gsfc.nasa.gov/api/v3/events",
    noaa: "https://www.ncdc.noaa.gov/cdo-web/api/v2/data",
    usgs: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
};

const NOAA_TOKEN = "vvsnbhxVTPqVingECgdhiBslKHbRAhNV"; // Replace with your API key

const DisasterAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAllAlerts() {
            setLoading(true);
            setError(null);
            let allAlerts = [];

            try {
                // Fetch NASA Disaster Data
                const nasaRes = await fetch(API_URLS.nasa);
                const nasaData = await nasaRes.json();
                const nasaAlerts = nasaData.events.map(event => ({
                    id: event.id,
                    title: event.title,
                    type: "NASA - " + (event.categories[0]?.title || "Unknown"),
                    date: event.geometries[0]?.date || "N/A",
                    link: event.link,
                }));

                // Fetch NOAA Disaster Data
                const noaaRes = await fetch(API_URLS.noaa, {
                    headers: { "token": NOAA_TOKEN }
                });
                const noaaData = await noaaRes.json();
                const noaaAlerts = noaaData.results?.map(event => ({
                    id: event.id,
                    title: event.name,
                    type: "NOAA - Climate Event",
                    date: event.date || "N/A",
                    link: "https://www.ncdc.noaa.gov/",
                })) || [];

                // Fetch USGS Earthquake Data
                const usgsRes = await fetch(API_URLS.usgs);
                const usgsData = await usgsRes.json();
                const usgsAlerts = usgsData.features.map(event => ({
                    id: event.id,
                    title: event.properties.title,
                    type: "USGS - Earthquake",
                    date: new Date(event.properties.time).toLocaleString(),
                    link: event.properties.url,
                }));

                // Combine all alerts
                allAlerts = [...nasaAlerts, ...noaaAlerts, ...usgsAlerts];

            } catch (err) {
                console.error("❌ Fetch Error:", err.message);
                setError("Failed to load disaster alerts. Please try again.");
            } finally {
                setAlerts(allAlerts);
                setLoading(false);
            }
        }

        fetchAllAlerts();
    }, []);

    return (
        <div className="alerts-container">
            <h2>🌍 Real-Time Disaster Alerts</h2>

            {loading && <p>⏳ Loading alerts...</p>}
            {error && <div className="error-message">❌ {error}</div>}

            {!loading && !error && alerts.length === 0 && <p>No disaster alerts available.</p>}

            {!loading && !error && alerts.map(alert => (
                <div className="alert-card" key={alert.id}>
                    <h3>{alert.title}</h3>
                    <p><strong>Type:</strong> {alert.type}</p>
                    <p><strong>Date:</strong> {alert.date}</p>
                    <a href={alert.link} target="_blank" rel="noopener noreferrer">
                        🔗 View Details
                    </a>
                </div>
            ))}
        </div>
    );
};

export default DisasterAlerts;
