from fastapi import APIRouter, Query
from app.services.youtube import get_videos

router = APIRouter()


@router.get("/videos")
async def videos(q: str = Query(..., description="Location name")):
    return await get_videos(q)
