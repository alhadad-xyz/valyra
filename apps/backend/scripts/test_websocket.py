
import asyncio
import websockets

async def test_websocket():
    uri = "ws://localhost:8000/ws/listings"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")
            await websocket.send("Ping")
            print("Sent Ping")
            # Wait for potential response or just close
            await asyncio.sleep(1)
            print("Closing connection")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
