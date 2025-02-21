import asyncio
import logging
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

from fetch_reddit import fetch_reddit_posts
from fetch_tweets import fetch_tweets

# Load environment variables
load_dotenv()

# 🚀 Improved Logging Configuration
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

# Load Pre-trained NLP Model for Disaster Classification
try:
    disaster_classifier = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion")
    logging.info("✅ Disaster Classification model loaded successfully!")
except Exception as e:
    logging.error(f"❌ Error loading NLP model: {e}")
    raise RuntimeError("Failed to load NLP model.")

# Define request model for text classification
class TextRequest(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "ADR-Hub API is running!"}

@app.post("/classify/")
async def classify_text(request: TextRequest):
    """
    Classifies text as disaster-related or not.
    """
    try:
        logging.info(f"🔍 Classifying text: {request.text}")
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text field is required.")

        result = disaster_classifier(request.text)
        if not result or len(result) == 0:
            raise HTTPException(status_code=500, detail="Failed to classify text.")

        classification = result[0]
        logging.info(f"✅ Classification result: {classification}")

        return {
            "label": classification.get("label", "unknown"),
            "score": round(classification.get("score", 0.0), 4),
            "input_text": request.text
        }
    except Exception as e:
        logging.error(f"❌ Error classifying text: {e}")
        raise HTTPException(status_code=500, detail="Error processing text classification.")

@app.get("/fetch_tweets/")
async def get_tweets(query: str = "earthquake OR flood OR wildfire OR hurricane", max_results: int = 5):
    """
    Fetches real-time tweets related to disasters.
    """
    logging.info(f"🔍 Fetching tweets for query: {query}")
    try:
        tweets = fetch_tweets(query, max_results)
        if not tweets:
            return {"message": "No tweets found for the given query."}
        logging.info(f"✅ Fetched {len(tweets)} tweets")
        return tweets
    except Exception as e:
        logging.error(f"❌ Error fetching tweets: {e}")
        raise HTTPException(status_code=500, detail="Error fetching tweets.")

@app.get("/fetch_reddit/")
async def get_reddit_posts(query: str = "earthquake OR flood OR wildfire OR hurricane", limit: int = 5):
    """
    Fetches real-time Reddit posts related to disasters.
    """
    logging.info(f"🔍 Fetching Reddit posts for query: {query}")
    try:
        posts = fetch_reddit_posts(query, limit)
        if not posts:
            return {"message": "No Reddit posts found for the given query."}
        logging.info(f"✅ Fetched {len(posts)} Reddit posts")
        return posts
    except Exception as e:
        logging.error(f"❌ Error fetching Reddit posts: {e}")
        raise HTTPException(status_code=500, detail="Error fetching Reddit posts.")

# 🌍 Disaster Alerts API (NASA, NOAA, USGS Integration)
NASA_API_URL = "https://eonet.gsfc.nasa.gov/api/v3/events"
NOAA_API_URL = "https://api.weather.gov/alerts/active"
USGS_API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=5"

@app.get("/disaster-alerts/")
async def get_disaster_alerts():
    """
    Fetches real-time disaster alerts from NASA, NOAA, and USGS.
    """
    try:
        logging.info("🔍 Fetching disaster alerts...")
        nasa_response = requests.get(NASA_API_URL)
        noaa_response = requests.get(NOAA_API_URL)
        usgs_response = requests.get(USGS_API_URL)

        if nasa_response.status_code != 200:
            logging.warning("⚠️ NASA API did not return a successful response.")

        if noaa_response.status_code != 200:
            logging.warning("⚠️ NOAA API did not return a successful response.")

        if usgs_response.status_code != 200:
            logging.warning("⚠️ USGS API did not return a successful response.")

        nasa_data = nasa_response.json() if nasa_response.status_code == 200 else {}
        noaa_data = noaa_response.json() if noaa_response.status_code == 200 else {}
        usgs_data = usgs_response.json() if usgs_response.status_code == 200 else {}

        return {
            "NASA_Alerts": nasa_data.get("events", []),
            "NOAA_Alerts": noaa_data.get("features", []),
            "USGS_Alerts": usgs_data.get("features", [])
        }
    except Exception as e:
        logging.error(f"❌ Error fetching disaster alerts: {e}")
        return {"error": str(e)}

# 🌐 WebSocket for Real-Time Disaster Alerts
clients = []
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time disaster alerts.
    """
    await websocket.accept()
    clients.append(websocket)
    logging.info("✅ WebSocket connection established for disaster alerts.")

    try:
        while True:
            logging.info("🔄 Fetching new disaster alerts for WebSocket clients...")
            try:
                nasa_data = requests.get(NASA_API_URL, timeout=5).json()
                noaa_data = requests.get(NOAA_API_URL, timeout=5).json()
                usgs_data = requests.get(USGS_API_URL, timeout=5).json()
            except requests.exceptions.RequestException as e:
                logging.error(f"❌ API Request Failed: {e}")
                await asyncio.sleep(30)  # Wait and retry
                continue

            alert_data = {
                "NASA_Alerts": nasa_data.get("events", []),
                "NOAA_Alerts": noaa_data.get("features", []),
                "USGS_Alerts": usgs_data.get("features", []),
            }

            disconnected_clients = []
            for client in clients:
                try:
                    await client.send_json(alert_data)
                except Exception:
                    logging.warning("⚠️ A client disconnected.")
                    disconnected_clients.append(client)

            # ✅ Remove disconnected clients
            for client in disconnected_clients:
                clients.remove(client)

            await asyncio.sleep(30)  # Update every 30 seconds

    except Exception as e:
        logging.error(f"❌ WebSocket Error: {e}")

    finally:
        logging.info("🔴 WebSocket connection closed.")
        clients.remove(websocket)
