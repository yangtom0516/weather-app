from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.database import Base


class WeatherHistory(Base):
    __tablename__ = "weather_history"

    hid = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    title = Column(String, nullable=False)
    query = Column(String, nullable=False)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    current_weather = Column(JSON, nullable=False)
    forecast = Column(JSON, nullable=False)
