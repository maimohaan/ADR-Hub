import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:8000";  // Adjust if deployed

export const fetchRedditPosts = async (query, limit = 5) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/fetch_reddit/`, {
            params: { query, limit },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching Reddit posts:", error);
        return [];
    }
};

export const fetchTweets = async (query, max_results = 5) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/fetch_tweets/`, {
            params: { query, max_results },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching Tweets:", error);
        return [];
    }
};
