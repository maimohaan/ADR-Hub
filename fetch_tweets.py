import requests
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# 🔹 Store Bearer Token in .env file or config.py
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")

# 🔹 Twitter API URL
TWITTER_API_URL = "https://api.twitter.com/2/tweets/search/recent"


def fetch_tweets(query="earthquake OR flood OR wildfire", max_results=5, retries=3, delay=15):
    """
    Fetches recent tweets matching the given query.
    - Ensures no retweets are fetched.
    - Handles API rate limits and errors.
    """
    if not TWITTER_BEARER_TOKEN:
        raise ValueError("❌ Twitter Bearer Token is missing! Update .env file or config.py.")

    headers = {
        "Authorization": f"Bearer {TWITTER_BEARER_TOKEN}",
        "Content-Type": "application/json"
    }

    params = {
        "query": f"({query}) -is:retweet",  # Remove retweets
        "tweet.fields": "created_at,author_id,text",
        "max_results": max_results
    }

    for attempt in range(retries):
        response = requests.get(TWITTER_API_URL, headers=headers, params=params)

        print(f"Attempt {attempt + 1} - Status Code: {response.status_code}")  # Debugging

        if response.status_code == 200:
            tweets = response.json().get("data", [])
            print(f"✅ Fetched {len(tweets)} tweets.")  # Debugging
            return tweets
        elif response.status_code == 401:
            print("🔴 Unauthorized! Check your Bearer Token.")
            return {"error": "Unauthorized - Check Bearer Token"}
        elif response.status_code == 429:
            print(f"⚠️ Rate limit exceeded. Waiting {delay} seconds before retrying...")
            time.sleep(delay)  # Exponential backoff can be added
            delay *= 2  # Increase delay each retry
        else:
            print(f"⚠️ Error: {response.text}")
            return {"error": response.text}

    return {"error": "❌ Failed after multiple retries"}


# 🔹 Test the function
if __name__ == "__main__":
    print(fetch_tweets())
