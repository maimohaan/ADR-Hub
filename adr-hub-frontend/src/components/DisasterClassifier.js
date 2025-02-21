import React, { useState } from "react";

function DisasterClassifier() {
    const [inputText, setInputText] = useState("");
    const [classification, setClassification] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function classifyText() {
        if (!inputText.trim()) {
            alert("Please enter text to classify.");
            return;
        }

        setLoading(true);
        setError(""); // Reset error before request

        try {
            const response = await fetch("http://127.0.0.1:8000/classify/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: inputText }),
            });

            if (!response.ok) {
                throw new Error("Failed to classify text.");
            }

            const data = await response.json();
            setClassification(data);
        } catch (error) {
            console.error("Error:", error);
            setError("Failed to classify text. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="classifier-container">
            <h1>Disaster Classifier</h1>
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} />
            <button onClick={classifyText} disabled={loading}>
                {loading ? "Classifying..." : "Classify"}
            </button>

            {error && <p className="error">{error}</p>}
            {classification && (
                <div className="classification-result">
                    <h3>Classification: {classification.label}</h3>
                    <p>Confidence: {classification.score.toFixed(2)}</p>
                </div>
            )}
        </div>
    );
}

export default DisasterClassifier;
