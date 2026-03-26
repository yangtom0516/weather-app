import csv
import io
import json
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom.minidom import parseString

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.history import HistoryRecord, HistoryTitleUpdate
from app.services import history as crud

router = APIRouter()


@router.get("/", response_model=list[HistoryRecord])
def get_history(db: Session = Depends(get_db)):
    return crud.get_all(db)


@router.patch("/{hid}", response_model=HistoryRecord)
def update_title(hid: int, body: HistoryTitleUpdate, db: Session = Depends(get_db)):
    record = crud.update_title(db, hid, body.title)
    if not record:
        raise HTTPException(status_code=404, detail="History record not found")
    return record


@router.delete("/{hid}", status_code=204)
def delete_record(hid: int, db: Session = Depends(get_db)):
    if not crud.delete_record(db, hid):
        raise HTTPException(status_code=404, detail="History record not found")


@router.get("/export")
def export_history(format: str = Query("json"), db: Session = Depends(get_db)):
    records = crud.get_all(db)

    if format == "json":
        data = [
            {
                "hid": r.hid,
                "timestamp": str(r.timestamp),
                "title": r.title,
                "query": r.query,
                "start_date": r.start_date,
                "end_date": r.end_date,
                "current_weather": r.current_weather,
                "forecast": r.forecast,
            }
            for r in records
        ]
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=weather_history.json"},
        )

    elif format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["hid", "timestamp", "title", "query", "start_date", "end_date",
                         "temperature_f", "description", "humidity", "wind_speed"])
        for r in records:
            cw = r.current_weather
            writer.writerow([
                r.hid, r.timestamp, r.title, r.query, r.start_date, r.end_date,
                cw.get("temperature"), cw.get("description"),
                cw.get("humidity"), cw.get("wind_speed"),
            ])
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=weather_history.csv"},
        )

    elif format == "xml":
        root = Element("WeatherHistory")
        for r in records:
            entry = SubElement(root, "Record")
            SubElement(entry, "hid").text = str(r.hid)
            SubElement(entry, "timestamp").text = str(r.timestamp)
            SubElement(entry, "title").text = r.title
            SubElement(entry, "query").text = r.query
            SubElement(entry, "start_date").text = r.start_date or ""
            SubElement(entry, "end_date").text = r.end_date or ""
            cw = SubElement(entry, "CurrentWeather")
            SubElement(cw, "temperature").text = str(r.current_weather.get("temperature"))
            SubElement(cw, "description").text = str(r.current_weather.get("description"))
            SubElement(cw, "humidity").text = str(r.current_weather.get("humidity"))
            SubElement(cw, "wind_speed").text = str(r.current_weather.get("wind_speed"))
        pretty = parseString(tostring(root)).toprettyxml(indent="  ")
        return Response(
            content=pretty,
            media_type="application/xml",
            headers={"Content-Disposition": "attachment; filename=weather_history.xml"},
        )

    elif format == "markdown":
        lines = ["# Weather History\n",
                 "| # | Timestamp | Title | Query | Date Range | Temp (°F) | Description |",
                 "|---|-----------|-------|-------|------------|-----------|-------------|"]
        for r in records:
            date_range = f"{r.start_date} → {r.end_date}" if r.start_date else "—"
            lines.append(
                f"| {r.hid} | {r.timestamp} | {r.title} | {r.query} | {date_range} "
                f"| {r.current_weather.get('temperature', '')} | {r.current_weather.get('description', '')} |"
            )
        return Response(
            content="\n".join(lines),
            media_type="text/markdown",
            headers={"Content-Disposition": "attachment; filename=weather_history.md"},
        )

    raise HTTPException(status_code=400, detail="Invalid format. Use: json, csv, xml, markdown")
