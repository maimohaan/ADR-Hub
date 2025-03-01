import asyncio
import logging
import requests
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

from fetch_reddit import fetch_reddit_posts
from fetch_tweets import fetch_tweets

# Load environment variables
load_dotenv()

# API Keys - Ensure they are available
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

if not NEWS_API_KEY or not REDDIT_CLIENT_ID or not REDDIT_CLIENT_SECRET:
    logging.warning("⚠️  Missing one or more API keys! Some features may not work.")

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy Loading NLP Model
disaster_classifier = None


def load_model():
    global disaster_classifier
    if disaster_classifier is None:
        try:
            disaster_classifier = pipeline("text-classification",
                                           model="bhadresh-savani/distilbert-base-uncased-emotion")
            logging.info("✅ Disaster Classification model loaded successfully!")
        except Exception as e:
            logging.error(f"❌ Error loading NLP model: {e}")
            raise RuntimeError("Failed to load NLP model.")


# Request Model
class TextRequest(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "ADR-Hub API is running!"}


@app.post("/classify/")
async def classify_text(request: TextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text field is required.")

    load_model()  # Load NLP model only when needed
    try:
        result = disaster_classifier(request.text)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to classify text.")

        classification = result[0]
        return {
            "label": classification.get("label", "unknown"),
            "score": round(classification.get("score", 0.4), 4),
            "input_text": request.text
        }
    except Exception as e:
        logging.error(f"❌ Error classifying text: {e}")
        raise HTTPException(status_code=500, detail="Error processing text classification.")


# Fetch Tweets
@app.get("/fetch_tweets/")
async def get_tweets(query: str = "earthquake OR flood OR wildfire OR hurricane", max_results: int = 5):
    try:
        tweets = fetch_tweets(query, max_results)
        return {"tweets": tweets} if tweets else {"message": "No tweets found."}
    except Exception as e:
        logging.error(f"❌ Error fetching tweets: {e}")
        raise HTTPException(status_code=500, detail="Error fetching tweets.")


# Fetch Reddit Posts
@app.get("/fetch_reddit/")
async def get_reddit_posts(query: str = "earthquake OR flood OR wildfire OR hurricane", limit: int = 5):
    try:
        posts = fetch_reddit_posts(query, limit)
        return {"reddit_posts": posts} if posts else {"message": "No Reddit posts found."}
    except Exception as e:
        logging.error(f"❌ Error fetching Reddit posts: {e}")
        raise HTTPException(status_code=500, detail="Error fetching Reddit posts.")


# Fetch Disaster News
@app.get("/news")
def get_news():
    try:
        response = requests.get(f"https://newsapi.org/v2/everything?q=disaster&apiKey={NEWS_API_KEY}", timeout=45)
        data = response.json()
        return {"news": data.get("articles", [])}
    except Exception as e:
        logging.error(f"❌ Error fetching news: {e}")
        return {"error": "Failed to fetch news articles", "details": str(e)}


# NASA, NOAA, USGS Disaster Alerts
NASA_API_URL = "https://eonet.gsfc.nasa.gov/api/v3/events"
NOAA_API_URL = "https://api.weather.gov/alerts/active"
USGS_API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=5"


@app.get("/disaster_alerts")
async def get_disaster_alerts():
    try:
        nasa_data = requests.get(NASA_API_URL, timeout=45).json()
        noaa_data = requests.get(NOAA_API_URL, timeout=45).json()
        usgs_data = requests.get(USGS_API_URL, timeout=45).json()
        return {
            "NASA_Alerts": nasa_data.get("events", []),
            "NOAA_Alerts": noaa_data.get("features", []),
            "USGS_Alerts": usgs_data.get("features", [])
        }
    except requests.exceptions.RequestException as e:
        logging.error(f"❌ Error fetching disaster alerts: {e}")
        return {"error": f"API request failed: {e}"}


# WebSocket for Real-Time Updates
clients = []


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            nasa_data = requests.get(NASA_API_URL, timeout=40).json()
            noaa_data = requests.get(NOAA_API_URL, timeout=40).json()
            usgs_data = requests.get(USGS_API_URL, timeout=40).json()
            alert_data = {
                "NASA_Alerts": nasa_data.get("events", []),
                "NOAA_Alerts": noaa_data.get("features", []),
                "USGS_Alerts": usgs_data.get("features", [])
            }
            for client in clients[:]:  # Iterate over a copy to safely remove disconnected clients
                try:
                    await client.send_json(alert_data)
                except WebSocketDisconnect:
                    clients.remove(client)
            await asyncio.sleep(30)
    except Exception as e:
        logging.error(f"❌ WebSocket Error: {e}")
    finally:
        clients.remove(websocket)
        logging.info("🔴 WebSocket connection closed.")
