import asyncio
from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.weather import CurrentWeatherResponse, ForecastResponse, SearchResponse
from app.services.weather import get_current_weather, get_forecast
from app.services import history as crud

router = APIRouter()


def validate_date_range(start_date: str, end_date: str):
    today = date.today()
    max_date = today + timedelta(days=4)
    try:
        start = date.fromisoformat(start_date)
        end = date.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    if start < today:
        raise HTTPException(status_code=400, detail="Start date cannot be in the past.")
    if end > max_date:
        raise HTTPException(status_code=400, detail="End date cannot be more than 5 days from today.")
    if start > end:
        raise HTTPException(status_code=400, detail="Start date must be before or equal to end date.")


@router.get("/current", response_model=CurrentWeatherResponse)
async def current_weather(q: str = Query(...)):
    return await get_current_weather(q)


@router.get("/forecast", response_model=ForecastResponse)
async def forecast(q: str = Query(...)):
    return await get_forecast(q)


@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(...),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    if start_date or end_date:
        if not start_date or not end_date:
            raise HTTPException(status_code=400, detail="Both start_date and end_date are required.")
        validate_date_range(start_date, end_date)

    current, forecast_data = await asyncio.gather(
        get_current_weather(q),
        get_forecast(q),
    )

    forecast_days = forecast_data["forecast"]
    if start_date and end_date:
        forecast_days = [d for d in forecast_days if start_date <= d["date"] <= end_date]

    crud.create_record(
        db,
        query=q,
        title=current["location"],
        current_weather=current,
        forecast=forecast_days,
        timezone_offset=current.get("timezone_offset", 0),
        start_date=start_date,
        end_date=end_date,
    )

    return {"current": current, "forecast": forecast_days}
