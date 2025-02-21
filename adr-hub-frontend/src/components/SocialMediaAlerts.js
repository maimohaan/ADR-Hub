import React, { useEffect, useState } from "react";
import "./SocialMediaAlerts.css"; // Ensure correct CSS path

const SocialMediaAlerts = () => {
    const [redditPosts, setRedditPosts] = useState([]);
    const [newsPosts, setNewsPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);

        Promise.all([
            fetch("http://127.0.0.1:8000/reddit")
                .then((res) => res.json())
                .then((data) => setRedditPosts(data.posts || []))
                .catch((err) => setError("Failed to fetch Reddit Alerts")),

            fetch("http://127.0.0.1:8000/news")
                .then((res) => res.json())
                .then((data) => setNewsPosts(data.posts || []))
                .catch((err) => setError("Failed to fetch News Alerts")),
        ]).finally(() => setLoading(false));
    }, []);

    return (
        <div className="social-alerts-container">
            <h2 className="social-alerts-header">Social Media Alerts</h2>

            {loading ? (
                <p className="loading">Loading alerts...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <>
                    {/* Reddit Alerts */}
                    <h3 className="alert-category">Reddit Alerts</h3>
                    {redditPosts.length > 0 ? (
                        <ul className="alerts-list">
                            {redditPosts.map((post, index) => (
                                <li key={index} className="alert-item">
                                    <a href={post.data.url} target="_blank" rel="noopener noreferrer" className="alert-link">
                                        {post.data.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-alerts">No Reddit alerts available.</p>
                    )}

                    {/* News Alerts */}
                    <h3 className="alert-category">News Alerts</h3>
                    {newsPosts.length > 0 ? (
                        <ul className="alerts-list">
                            {newsPosts.map((news, index) => (
                                <li key={index} className="alert-item">
                                    <a href={news.url} target="_blank" rel="noopener noreferrer" className="alert-link">
                                        {news.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-alerts">No news alerts available.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default SocialMediaAlerts;
