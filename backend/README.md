# Backend

FastAPI REST API for Tom's Weather App.

## How to Run

```bash
# Create and activate conda environment
conda create -n weather_app python=3.11
conda activate weather_app

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the server
uvicorn main:app --reload
```

Runs at **http://localhost:8000**
Interactive docs at **http://localhost:8000/docs**

## Stack

- **FastAPI** — web framework
- **SQLAlchemy + SQLite** — ORM and local database (`weather_history.db`)
- **httpx** — async HTTP client
- **Pydantic** — request/response validation
- **python-dotenv** — environment variable loading

## External APIs

| API | Usage |
|---|---|
| OpenWeatherMap v2.5 | Current weather + 5-day forecast |
| YouTube Data API v3 | Top 3 location videos |

## Project Structure

```
backend/
  main.py                    # App entry, registers routers, creates DB tables
  requirements.txt
  .env                       # API keys (gitignored)
  .env.example               # Template for required env vars
  app/
    config.py                # Loads env vars
    database.py              # SQLAlchemy engine + session
    models/
      history.py             # WeatherHistory DB table
    schemas/
      weather.py             # Pydantic models for weather responses
      history.py             # Pydantic models for history records
    services/
      weather.py             # OWM API calls + data transformation
      history.py             # DB CRUD operations
      youtube.py             # YouTube API calls
    routes/
      weather.py             # /weather endpoints
      history.py             # /history endpoints + export
      youtube.py             # /youtube endpoints
```

## API Endpoints

### `GET /weather/search?q=&start_date=&end_date=`
Fetches current weather + forecast, saves to history. Date range is optional (today → today+4).

### `GET /youtube/videos?q=`
Returns top 3 YouTube videos for the location.

### `GET /history/`
All past searches, sorted newest first.

### `PATCH /history/{hid}`
Rename a history record. Body: `{ "title": "string" }`

### `DELETE /history/{hid}`
Delete a record. Returns `204 No Content`.

### `GET /history/export?format=`
Export all history. Formats: `json`, `csv`, `xml`, `markdown`.
