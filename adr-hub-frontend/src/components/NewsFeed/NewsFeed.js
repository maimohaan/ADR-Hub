import React, { useState, useEffect } from "react";
import axios from "axios";
import "./NewsFeed.css";

const API_KEY = "d83137e493b04321ab2dff2a92d44a4f"; // Replace with your API Key
const NEWS_API_URL = `https://newsapi.org/v2/everything?q=earthquake OR flood OR wildfire OR hurricane OR tsunami&language=en&apiKey=${API_KEY}`;

const disasterKeywords = [
  "earthquake", "tsunami", "hurricane", "wildfire", "flood", "cyclone",
  "disaster", "storm", "landslide", "drought", "tornado", "eruption", "volcano"
];

function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5); // Initial articles to show

  useEffect(() => {
    fetchNews();
    const savedMode = localStorage.getItem("darkMode");
    setDarkMode(savedMode === "true");
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(NEWS_API_URL);
      const filteredNews = filterRelevantNews(response.data.articles);
      setArticles(filteredNews);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const filterRelevantNews = (articles) => {
    return articles
      .filter(article => {
        const title = article.title.toLowerCase();
        const description = article.description ? article.description.toLowerCase() : "";
        return disasterKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
      })
      .slice(0, 20); // Limit to 20 articles
  };

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode);
      return newMode;
    });
  };

  const sentimentAnalysis = (title) => {
    if (!title) return "Neutral";
    const positiveWords = ["help", "rescue", "recover", "support", "aid", "hope"];
    const negativeWords = ["death", "destroy", "crisis", "damage", "fatal", "collapse"];

    const lowerTitle = title.toLowerCase();
    if (negativeWords.some(word => lowerTitle.includes(word))) return "Negative";
    if (positiveWords.some(word => lowerTitle.includes(word))) return "Positive";
    return "Neutral";
  };

  const filteredArticles = articles
    .filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, visibleCount); // Limit visible articles

  return (
    <div className={`news-container ${darkMode ? "dark-mode" : ""}`}>
      <h2>🌍 Real-Time Disaster News</h2>

      {/* 🌙 Dark Mode Toggle */}
      <button onClick={toggleDarkMode} className="toggle-dark-mode">
        {darkMode ? "☀" : "🌙"}
      </button>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search disaster news..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      {/* 📰 News List */}
      <div className="news-list">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article, index) => (
            <div key={index} className="news-article">
              {article.urlToImage ? (
                <img src={article.urlToImage} alt="News" className="news-image" />
              ) : (
                <div className="no-image">No Image Available</div>
              )}
              <div className="news-content">
                <h3>{article.title}</h3>
                <p>{article.description || "No description available."}</p>
                <span className={`sentiment-tag ${sentimentAnalysis(article.title)}`}>
                  {sentimentAnalysis(article.title)}
                </span>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more">
                  Read More
                </a>
              </div>
            </div>
          ))
        ) : (
          <p>No relevant news found...</p>
        )}
      </div>

      {/* 📌 Load More Button */}
      {visibleCount < articles.length && (
        <button onClick={() => setVisibleCount(prev => prev + 5)} className="load-more">
          Load More
        </button>
      )}
    </div>
  );
}

export default NewsFeed;
