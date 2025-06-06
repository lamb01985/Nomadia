from fastapi import (
    FastAPI,
    HTTPException,
    Request,
    Depends,
    UploadFile,
    File,
    status,
    Form,
)
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles
from openai_routes import router as openai_router
from pathlib import Path
from mapapi_route import get_map
from datetime import datetime
import os
import json
from uuid import uuid4
from photos import upload_photo, get_url
from starlette.responses import JSONResponse
from schemas import (
    TripCreate,
    TripOut,
    DayCreate,
    DayOut,
    PlaceCreate,
    PlaceOut,
    JournalCreate,
    JournalOut,
    LoginCredentials,
    SuccessResponse,
    SecretResponse,
    UserPublicDetails,
    SignupCredentials,
    ItineraryRequest,
    SaveItineraryRequest,
    PhotoOut,
    PlaceUpdate,
)
import db
from db_models import DBDay
from db import get_db, update_journal_entry, validate_session
from sqlalchemy.orm import Session
from rich import print

app = FastAPI()

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key="some-random-string",
    session_cookie="session",
    max_age=60 * 60 * 2,
    same_site="none",
    https_only=True,
)

app.include_router(openai_router)

# Serve static uploaded photos
UPLOAD_DIR = "uploaded_photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploaded_photos", StaticFiles(directory=UPLOAD_DIR), name="uploaded_photos")


# SESSION + AUTH ROUTES
@app.post("/api/login", response_model=SuccessResponse)
async def session_login(
    credentials: LoginCredentials, request: Request
) -> SuccessResponse:
    email = credentials.email
    password = credentials.password
    result = db.validate_email_password(email, password)
    if not result:
        raise HTTPException(status_code=401)
    session_token, account_id = result
    request.session["email"] = email
    request.session["session_token"] = session_token
    request.session["account_id"] = account_id
    return SuccessResponse(success=True)


@app.get("/api/logout", response_model=SuccessResponse)
async def session_logout(request: Request) -> SuccessResponse:
    email = request.session.get("email")
    session_token = request.session.get("session_token")
    if not email or not session_token:
        return SuccessResponse(success=False)
    db.invalidate_session(email, session_token)
    request.session.clear()
    return SuccessResponse(success=True)


@app.post("/api/signup", response_model=SuccessResponse)
async def signup(credentials: SignupCredentials, request: Request) -> SuccessResponse:
    email = credentials.email
    password = credentials.password
    name = credentials.name
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    success = db.create_user_account(email, password, name)
    if not success:
        raise HTTPException(status_code=404, detail="Could not create account")
    session_token, account_id = db.validate_email_password(email, password)
    request.session["email"] = email
    request.session["session_token"] = session_token
    request.session["account_id"] = account_id
    return SuccessResponse(success=True)


def get_auth_user(request: Request):
    email = request.session.get("email")
    session_token = request.session.get("session_token")
    if not email or not session_token or not db.validate_session(email, session_token):
        raise HTTPException(status_code=401)
    return True


@app.get(
    "/api/me", response_model=UserPublicDetails, dependencies=[Depends(get_auth_user)]
)
async def get_me(request: Request) -> UserPublicDetails:
    email = request.session.get("email")
    if not isinstance(email, str):
        raise HTTPException(status_code=404, detail="User not found")
    user_details = db.get_user_public_details(email)
    if not user_details:
        raise HTTPException(status_code=404, detail="User not found")
    return user_details


# TRIPS + DAYS ROUTES
@app.get("/api/trips", response_model=list[TripOut])
async def get_trips(request: Request):
    account_id = request.session.get("account_id")
    if not account_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return db.get_trips(account_id)


@app.get(
    "/api/trips/{trip_id}",
    response_model=TripOut,
    dependencies=[Depends(get_auth_user)],
)
async def get_trip(trip_id: int):
    trip = db.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@app.post("/api/{account_id}/trips", response_model=TripOut)
async def create_trip(account_id: int, trip: TripCreate):
    return db.create_trip(account_id, trip)


@app.put("/api/trips/{trip_id}", response_model=TripOut)
async def update_trip(trip_id: int, trip: TripCreate):
    updated = db.update_trip(trip_id, trip)
    if not updated:
        raise HTTPException(status_code=404, detail="Trip not found")
    return updated


@app.delete("/api/trips/{trip_id}", dependencies=[Depends(get_auth_user)])
async def delete_trip(trip_id: int):
    if db.delete_trip(trip_id):
        return {"message": "Trip deleted successfully"}
    raise HTTPException(status_code=500, detail="Error deleting trip")


@app.get("/api/{trip_id}/days", response_model=list[DayOut])
async def get_days(trip_id: int):
    return db.get_days(trip_id)


@app.get("/api/days/{day_id}", response_model=DayOut)
def get_day_by_id(day_id: int, db: Session = Depends(get_db)):
    day = db.query(DBDay).filter(DBDay.id == day_id).first()
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")
    return day


@app.get("/api/days/{day_id}/recap")
async def get_day_recap(day_id: int):
    day = db.get_day(day_id)
    journal = db.get_journal_by_day(day_id)
    places = db.get_places(day_id)

    if not day:
        raise HTTPException(status_code=404, detail="Day not found")

    return {
        "day": day,
        "journal": journal,
        "places": places,
    }


@app.post(
    "/api/trips/{trip_id}/days",
    dependencies=[Depends(get_auth_user)],
    response_model=list[DayOut],
)
async def create_trip_days(trip_id: int, days: list[DayCreate]):
    return [db.add_day(trip_id, day) for day in days]


@app.put("/api/days/{day_id}")
async def update_day(day_id: int, day: DayCreate):
    if db.update_day(day_id, day):
        return {"message": "Day updated"}
    raise HTTPException(status_code=400, detail="Update failed")


@app.delete("/api/days/{day_id}")
async def delete_day(day_id: int):
    if db.delete_day(day_id):
        return {"message": "Day deleted"}
    raise HTTPException(status_code=400, detail="Delete failed")


# PLACES + MAP
@app.get("/api/days/{day_id}/map")
async def get_places_map(day_id: int):
    places = db.get_places(day_id)
    for p in places:
        print(p.name, p.lat, p.lng)
    if not places:
        return {"message": "No places found"}
    return places


@app.put("/api/places/{place_id}", response_model=PlaceOut)
async def update_place(place_id: int, payload: PlaceUpdate):
    print("Received place update:", payload)
    return db.update_place(place_id, payload.name)


@app.delete("/api/places/{place_id}")
async def delete_place(place_id: int):
    if db.delete_place(place_id):
        return {"message": "Place deleted"}
    raise HTTPException(status_code=400, detail="Delete failed")


# ITINERARY + AI
@app.post("/api/generate-itinerary", dependencies=[Depends(get_auth_user)])
async def generate_itinerary(request: Request, itinerary_request: ItineraryRequest):
    return {
        "days": [
            {
                "day": 1,
                "activities": [
                    {"title": "Morning", "description": "Sample AM", "time": "9:00 AM"},
                    {
                        "title": "Afternoon",
                        "description": "Sample PM",
                        "time": "2:00 PM",
                    },
                ],
            }
        ]
    }


@app.post("/api/save/itinerary")
async def save_itinerary(request: Request):
    email = request.session.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Not logged in")
    user = db.get_user_public_details(email)
    raw = await request.json()
    payload = SaveItineraryRequest(**raw)
    saved = db.save_full_trip(user["id"], payload.trip, payload.itinerary)
    return {"trip_id": saved.id}


# JOURNAL ENTRY WITH PHOTO UPLOAD
@app.post("/api/days/{day_id}/journal", response_model=JournalOut)
async def save_journal(
    day_id: int,
    journal_text: str = Form(...),
    highlight: bool = Form(False),
    tags: str = Form(""),
    photo: UploadFile = File(None),
):
    image_url = None

    if photo:
        photo_key = upload_photo(photo)
        if not photo_key:
            raise HTTPException(status_code=400, detail="Invalid photo format or size")
        image_url = get_url(photo_key)

    try:
        tags_list = (
            json.loads(tags)
            if tags.strip().startswith("[")
            else [t.strip() for t in tags.split(",") if t.strip()]
        )
    except json.JSONDecodeError:
        tags_list = [t.strip() for t in tags.split(",") if t.strip()]

    now = datetime.now()
    entry = db.save_journal_entry(
        day_id, journal_text, image_url, now, highlight, tags_list
    )

    day = db.get_day(day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")

    trip_id = db.get_trip_id_by_day(day_id)
    return JSONResponse(
        content={
            "id": entry.id,
            "day_id": entry.day_id,
            "note": entry.note,
            "image_url": entry.image_url,
            "time": entry.time.isoformat(),
            "trip_id": trip_id,
        }
    )


@app.get("/api/trips/{trip_id}/journals", response_model=list[JournalOut])
async def get_journals_for_trip(trip_id: int):
    return db.get_journals_by_trip(trip_id)


@app.get("/api/days/{day_id}/journal", response_model=JournalOut)
async def get_journal_for_day(day_id: int):
    journal = db.get_journal_by_day(day_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return journal


# @app.put("/api/days/{day_id}/places")
# async def update_places(day_id: int, payload: dict):
#     # Example: payload = {"places": ["Place 1", "Place 2"]}
#     # You may want to delete all old places and add new ones, or update in place
#     db.delete_places_by_day(day_id)  # You need to implement this helper
#     for name in payload.get("places", []):
#         db.add_place(day_id, PlaceCreate(name=name, type="", lat=None, lng=None))
#     return {"message": "Places updated"}


@app.put("/api/journal/{day_id}")
def update_journal(day_id: int, request: Request, payload: dict):
    session = request.session
    email = session.get("email")
    session_token = session.get("session_token")
    if not db.validate_session(email, session_token):
        raise HTTPException(status_code=401, detail="Invalid session")
    note = payload.get("note", "")
    highlight = payload.get("highlight", False)
    tags = payload.get("tags", [])
    updated = db.update_journal_entry(day_id, note, highlight, tags)
    if not updated:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return updated


@app.post("/api/days/{day_id}/photos", response_model=PhotoOut)
async def upload_day_photo(day_id: int, photo: UploadFile = File(...)):
    photo_key = upload_photo(photo)
    if not photo_key:
        raise HTTPException(status_code=400, detail="Invalid photo format or size")
    image_url = get_url(photo_key)
    return db.add_photo_to_day(day_id, image_url)


@app.get("/api/days/{day_id}/photos", response_model=list[PhotoOut])
async def get_day_photos(day_id: int):
    return db.get_photos_by_day(day_id)


@app.delete("/api/photos/{photo_id}")
async def delete_photo(photo_id: int):
    """
    Delete a photo by its photo_id.
    """
    success = db.delete_photo(photo_id)
    if success:
        return {"message": "Photo deleted"}
    raise HTTPException(status_code=404, detail="Photo not found")


# DEBUG + FALLBACK ROUTES
@app.get("/api/debug/trip/{trip_id}")
async def debug_trip(trip_id: int):
    trip = db.get_trip(trip_id)
    days = db.get_days(trip_id)
    return {"trip": trip, "days": days}


@app.get("/{file_path}", response_class=FileResponse)
def get_file(file_path: str):
    if Path("client/" + file_path).is_file():
        return "client/" + file_path
    raise HTTPException(status_code=404, detail="File not found")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
