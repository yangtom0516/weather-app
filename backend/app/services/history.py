from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.history import WeatherHistory


def create_record(
    db: Session,
    query: str,
    title: str,
    current_weather: dict,
    forecast: list,
    timezone_offset: int = 0,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
) -> WeatherHistory:
    local_time = datetime.now(timezone.utc) + timedelta(seconds=timezone_offset)
    record = WeatherHistory(
        query=query,
        title=title,
        current_weather=current_weather,
        forecast=forecast,
        timestamp=local_time.replace(tzinfo=None),
        start_date=start_date,
        end_date=end_date,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_all(db: Session) -> list[WeatherHistory]:
    return db.query(WeatherHistory).order_by(WeatherHistory.timestamp.desc()).all()


def get_by_id(db: Session, hid: int) -> WeatherHistory | None:
    return db.query(WeatherHistory).filter(WeatherHistory.hid == hid).first()


def update_title(db: Session, hid: int, title: str) -> WeatherHistory | None:
    record = get_by_id(db, hid)
    if not record:
        return None
    record.title = title
    db.commit()
    db.refresh(record)
    return record


def delete_record(db: Session, hid: int) -> bool:
    record = get_by_id(db, hid)
    if not record:
        return False
    db.delete(record)
    db.commit()
    return True
