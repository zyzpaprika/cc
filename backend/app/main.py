from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import stats
from app.services.scraper import create_db_and_tables

app = FastAPI()

# --- CORS MIDDLEWARE (Security Clearance) ---
# This allows your React app to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, you might change this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database on Startup
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Include the stats router
app.include_router(stats.router)

@app.get("/")
def read_root():
    return {"message": "Portfolio API is running!"}