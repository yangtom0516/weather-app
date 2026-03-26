from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import history  # ensures table is registered
from app.database import Base
from app.routes import weather, history as history_routes, youtube as youtube_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weather API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "PATCH", "DELETE"],
    allow_headers=["*"],
)

app.include_router(weather.router, prefix="/weather")
app.include_router(history_routes.router, prefix="/history")
app.include_router(youtube_routes.router, prefix="/youtube")
