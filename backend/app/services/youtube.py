import httpx
from fastapi import HTTPException
from app.config import YOUTUBE_API_KEY, YOUTUBE_SEARCH_URL


async def get_videos(location: str) -> list[dict]:
    params = {
        "part": "snippet",
        "q": location,
        "type": "video",
        "maxResults": 3,
        "key": YOUTUBE_API_KEY,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(YOUTUBE_SEARCH_URL, params=params, timeout=10)

    if not resp.is_success:
        raise HTTPException(status_code=resp.status_code, detail="YouTube API error")

    items = resp.json().get("items", [])
    return [
        {
            "video_id": item["id"]["videoId"],
            "title": item["snippet"]["title"],
            "channel": item["snippet"]["channelTitle"],
            "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
        }
        for item in items
    ]
