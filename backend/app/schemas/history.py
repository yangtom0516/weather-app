from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class HistoryRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hid: int
    timestamp: datetime
    title: str
    query: str
    start_date: Optional[str]
    end_date: Optional[str]
    current_weather: dict
    forecast: list[dict]


class HistoryTitleUpdate(BaseModel):
    title: str
