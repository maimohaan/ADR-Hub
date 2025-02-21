import praw
from dotenv import load_dotenv
import os
load_dotenv()

# 🔹 Fetch API credentials from environment variables
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "disaster-response-bot")

# 🔹 Authenticate with Reddit API
try:
    reddit = praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT
    )
    print("✅ Successfully authenticated with Reddit API.")
except Exception as e:
    print(f"❌ Error: Failed to authenticate with Reddit API: {e}")

def fetch_reddit_posts(query="earthquake OR flood OR wildfire", limit=10):
    """
    Fetches top posts from a subreddit based on a search query.
    """
    try:
        subreddit = reddit.subreddit("news")  # Change to your desired subreddit
        posts = []

        for submission in subreddit.search(query, limit=limit):
            posts.append({"title": submission.title, "url": submission.url})

        if not posts:
            print("⚠️ No Reddit posts found for the given query.")

        print(f"✅ Fetched {len(posts)} Reddit posts.")  # Debugging
        return posts
    except Exception as e:
        print(f"❌ Error fetching Reddit posts: {e}")
        return []

# 🔹 Test the function
if __name__ == "__main__":
    posts = fetch_reddit_posts()
    for post in posts:
        print(f"Reddit Post: {post['title']}\nURL: {post['url']}\n")
