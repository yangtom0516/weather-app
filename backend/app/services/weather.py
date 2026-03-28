import re
from collections import defaultdict
from datetime import datetime, timezone, timedelta

import httpx
from fastapi import HTTPException

from app.config import API_KEY, OWM_BASE_URL


def build_owm_params(q: str) -> dict:
    params = {"appid": API_KEY, "units": "imperial"}
    gps_match = re.match(r"^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$", q.strip())
    if gps_match:
        params["lat"] = gps_match.group(1)
        params["lon"] = gps_match.group(2)
    else:
        params["q"] = q
    return params


async def owm_get(path: str, params: dict) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{OWM_BASE_URL}/{path}", params=params, timeout=10)
    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Location not found")
    if resp.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid API key")
    if not resp.is_success:
        raise HTTPException(status_code=resp.status_code, detail="Weather service error")
    return resp.json()


async def get_current_weather(q: str) -> dict:
    data = await owm_get("weather", build_owm_params(q))
    return {
        "location": f"{data['name']}, {data['sys']['country']}",
        "temperature": data["main"]["temp"],
        "feels_like": data["main"]["feels_like"],
        "humidity": data["main"]["humidity"],
        "pressure": data["main"]["pressure"],
        "wind_speed": data["wind"]["speed"],
        "wind_deg": data["wind"].get("deg"),
        "visibility": data.get("visibility"),
        "description": data["weather"][0]["description"],
        "condition_code": data["weather"][0]["id"],
        "sunrise": data["sys"].get("sunrise"),
        "sunset": data["sys"].get("sunset"),
        "timezone_offset": data.get("timezone", 0),
    }


async def get_forecast(q: str) -> dict:
    data = await owm_get("forecast", build_owm_params(q))

    tz_offset = timedelta(seconds=data["city"]["timezone"])
    local_tz = timezone(tz_offset)
    today_local = datetime.now(tz=local_tz).date()

    days = defaultdict(list)
    for entry in data["list"]:
        local_dt = datetime.fromtimestamp(entry["dt"], tz=local_tz)
        if local_dt.date() >= today_local:
            date = local_dt.strftime("%Y-%m-%d")
            days[date].append(entry)

    forecast_list = []
    for date, entries in sorted(days.items()):
        temps = [e["main"]["temp"] for e in entries]

        def midday_score(e):
            hour = int(e["dt_txt"].split(" ")[1].split(":")[0])
            return abs(hour - 12)

        midday = min(entries, key=midday_score)
        forecast_list.append({
            "date": date,
            "temp_max": max(temps),
            "temp_min": min(temps),
            "description": midday["weather"][0]["description"],
            "condition_code": midday["weather"][0]["id"],
            "humidity": midday["main"]["humidity"],
        })

    return {"forecast": forecast_list[:5]}
