from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app import scraper, storage
import os

app = FastAPI()
# direct conn
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # allowed methods
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Portfolio API is running!"}

@app.get("/stats")
async def get_stats():
    try:
        return await scraper.scrape_all()
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history():
    try:
        return storage.get_history()
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))