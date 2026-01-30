from sqlmodel import SQLModel, Field
from datetime import datetime

class DailyStat(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date: datetime = Field(default_factory=datetime.utcnow)
    
    leetcode_count: int
    codeforces_rating: int
    github_repos: int