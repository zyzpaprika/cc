from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app import scraper, storage
import os
import asyncio

app = FastAPI()

# --- CORS SETTINGS (The Fix) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows ALL domains (simplest for debugging)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
# -------------------------------

@app.get("/")
def read_root():
    return {"message": "Portfolio API is running!"}

@app.get("/stats")
async def get_stats():
    try:
        # Run scraper (or fetch from DB if you prefer caching)
        data = await scraper.scrape_all()
        return data
    except Exception as e:
        print(f"Error in /stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history():
    try:
        # Fetch history from Neon DB
        data = storage.get_history()
        return data
    except Exception as e:
        print(f"Error in /history: {e}")
        raise HTTPException(status_code=500, detail=str(e))