import React, { useState } from "react";

function DisasterClassifier() {
    const [inputText, setInputText] = useState("");
    const [classification, setClassification] = useState(null);
    const [tweets, setTweets] = useState([]);
    const [redditPosts, setRedditPosts] = useState([]);
    const [loading, setLoading] = useState(false); // Added loading state

    async function classifyText() {
        if (!inputText.trim()) {
            alert("Please enter text to classify.");
            return;
        }

        setLoading(true); // Show loading state
        try {
            const response = await fetch("http://127.0.0.1:8000/classify/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: inputText }),
            });

            if (!response.ok) throw new Error("Failed to fetch classification.");

            const data = await response.json();
            console.log("Classification Result:", data);
            setClassification(data); // Save classification data
        } catch (error) {
            console.error("Error:", error);
            alert("Error fetching classification. Please try again.");
        } finally {
            setLoading(false); // Hide loading state
        }
    }

    return (
        <div className="classifier-container">
            <h1>Disaster Classifier</h1>

            {/* Text Input for Classification */}
            <input
                type="text"
                placeholder="Enter disaster-related text..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
            />
            <button onClick={classifyText} disabled={loading}>
                {loading ? "Classifying..." : "Classify"}
            </button>

            {/* Classification Result Display */}
            {classification && (
                <div className="classification-result">
                    <h3>Classification Result</h3>
                    <p>
                        <strong>Label:</strong> {classification?.label || "Unknown"} <br />
                        <strong>Confidence Score:</strong> {classification?.score ? classification.score.toFixed(2) : "N/A"}
                    </p>
                </div>
            )}
        </div>
    );
}

export default DisasterClassifier;
