import os
import httpx
import asyncio
from datetime import datetime, date
from sqlmodel import SQLModel, Session, create_engine, select
from app.models import DailyStat

# --- DATABASE SETUP ---

# 1. Try to get the Cloud URL from Environment Variables
DATABASE_URL = os.environ.get("DATABASE_URL")

# 2. Configuration for the engine
connect_args = {}

if DATABASE_URL:
    # If we are in the cloud (Neon), we need to fix the URL slightly for SQLAlchemy
    # Neon gives "postgres://", but SQLAlchemy wants "postgresql://"
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    # If no Cloud URL, fall back to local SQLite
    DATABASE_URL = "sqlite:///database.db"
    connect_args = {"check_same_thread": False}

# 3. Create the engine
engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# --- SCRAPER LOGIC ---

# Replace these with your actual handles
LEETCODE_USERNAME = "zyzpaprika" 
CODEFORCES_USERNAME = "paprikazyz"
GITHUB_USERNAME = "zyzpaprika"

async def fetch_leetcode_stats():
    url = "https://leetcode.com/graphql"
    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
    """
    variables = {"username": LEETCODE_USERNAME}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json={"query": query, "variables": variables})
            data = response.json()
            stats = data['data']['matchedUser']['submitStats']['acSubmissionNum']
            return next(item['count'] for item in stats if item['difficulty'] == 'All')
        except Exception as e:
            print(f"LC Error: {e}")
            return 0

async def fetch_codeforces_stats():
    url = f"https://codeforces.com/api/user.info?handles={CODEFORCES_USERNAME}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            data = response.json()
            if data['status'] == 'OK':
                return data['result'][0].get('rating', 0)
            return 0
        except Exception as e:
            print(f"CF Error: {e}")
            return 0

async def fetch_github_stats():
    url = f"https://api.github.com/users/{GITHUB_USERNAME}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            data = response.json()
            return data.get('public_repos', 0)
        except Exception as e:
            print(f"GH Error: {e}")
            return 0

async def get_all_stats():
    # 1. Fetch live data
    lc, cf, gh = await asyncio.gather(
        fetch_leetcode_stats(),
        fetch_codeforces_stats(),
        fetch_github_stats()
    )
    
    # 2. Save OR Update Database
    with Session(engine) as session:
        # Check if we already have an entry for TODAY
        today_start = datetime.now().date()
        
        # SQL logic: Select * from DailyStat where date >= today's midnight
        statement = select(DailyStat).where(DailyStat.date >= today_start)
        existing_stat = session.exec(statement).first()

        if existing_stat:
            # UPDATE existing entry
            print(f"Updating stats for {today_start}")
            existing_stat.leetcode_count = lc
            existing_stat.codeforces_rating = cf
            existing_stat.github_repos = gh
            session.add(existing_stat)
        else:
            # CREATE new entry
            print(f"Creating new stats for {today_start}")
            stat_entry = DailyStat(
                leetcode_count=lc,
                codeforces_rating=cf,
                github_repos=gh
            )
            session.add(stat_entry)
            
        session.commit()

    return {
        "leetcode": lc,
        "codeforces": cf,
        "github": gh
    }