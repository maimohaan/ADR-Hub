import asyncio
import websockets

async def receive_alerts():
    uri = "ws://127.0.0.1:8000/ws"

    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected to WebSocket server.")
            while True:
                message = await websocket.recv()
                print("🔴 Real-Time Disaster Alert Received:")
                print(message)

    except asyncio.TimeoutError:
        print("❌ Connection timed out! Check if FastAPI is running and WebSocket route is correct.")
    except Exception as e:
        print(f"❌ Error: {e}")

# Run the WebSocket client
asyncio.run(receive_alerts())
