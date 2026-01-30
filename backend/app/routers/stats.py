from fastapi import APIRouter
from sqlmodel import select, Session
from typing import List

from app.services.scraper import get_all_stats, engine
from app.models import DailyStat
from app.schemas.stats import StatsResponse, HistoryEntry

router = APIRouter()

@router.get("/stats", response_model=StatsResponse)
async def read_stats():
    data = await get_all_stats()
    return data

@router.get("/history", response_model=List[HistoryEntry])
def read_history():
    with Session(engine) as session:
        # Select all stats, ordered by date (oldest to newest)
        statement = select(DailyStat).order_by(DailyStat.date)
        results = session.exec(statement).all()
        return results