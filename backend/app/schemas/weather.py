from pydantic import BaseModel
from typing import Optional


class CurrentWeatherResponse(BaseModel):
    location: str
    temperature: float
    feels_like: float
    humidity: int
    pressure: int
    wind_speed: float
    wind_deg: Optional[int]
    visibility: Optional[int]
    description: str
    condition_code: int
    sunrise: Optional[int]
    sunset: Optional[int]
    timezone_offset: int = 0


class ForecastDay(BaseModel):
    date: str
    temp_max: float
    temp_min: float
    description: str
    condition_code: int
    humidity: int


class ForecastResponse(BaseModel):
    forecast: list[ForecastDay]


class SearchResponse(BaseModel):
    current: CurrentWeatherResponse
    forecast: list[ForecastDay]
