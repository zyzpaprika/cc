from pydantic import BaseModel
from datetime import datetime

class StatsResponse(BaseModel):
    leetcode: int
    codeforces: int
    github: int

class HistoryEntry(BaseModel):
    date: datetime
    leetcode_count: int
    codeforces_rating: int
    github_repos: int