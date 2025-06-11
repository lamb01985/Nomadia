from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List, Any
from pydantic import BaseModel


class LoginCredentials(BaseModel):
    email: str
    password: str


class SignupCredentials(BaseModel):
    email: str
    password: str
    name: str


class SuccessResponse(BaseModel):
    success: bool


class SecretResponse(BaseModel):
    secret: str


class UserPublicDetails(BaseModel):
    id: int
    name: str
    email: str


class TripCreate(BaseModel):
    title: str
    destination: str
    start_date: date
    end_date: date
    vibe: str | None
    cover_photo: Optional[str] = None


class TripOut(TripCreate):
    id: int
    account_id: int


class DayCreate(BaseModel):
    day: date
    image_url: Optional[str] = None
    plan: Optional[str] = None
    highlight: Optional[bool] = False
    tags: Optional[List[str]] = []


class DayOut(DayCreate):
    id: int
    trip_id: int
    plan: Optional[str] = None

    class Config:
        orm_mode = True


class PlaceCreate(BaseModel):
    name: str
    type: str
    lat: float
    lng: float


class PlaceUpdate(BaseModel):
    name: str


class PlaceOut(PlaceCreate):
    id: int
    day_id: int


class JournalCreate(BaseModel):
    image_url: str | None
    note: str
    time: datetime
    highlight: Optional[bool] = False
    tags: Optional[List[str]] = []


class JournalOut(JournalCreate):
    id: int
    day_id: int
    image_url: Optional[str]
    time: datetime

    class Config:
        orm_mode = True


class JournalUpdate(BaseModel):
    note: Optional[str] = None
    highlight: Optional[bool] = None
    tags: Optional[List[str]] = []


class ItineraryRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    vibe: str
    notes: Optional[str] = None


class Activity(BaseModel):
    title: str
    description: str
    time: Optional[str] = None


class Day(BaseModel):
    day: int
    plan: List[Activity]


class ItineraryResponse(BaseModel):
    days: List[Day]


class SaveItineraryRequest(BaseModel):
    trip: TripCreate
    itinerary: list[dict[str, Any]]


class PhotoOut(BaseModel):
    id: int
    day_id: int
    image_url: str

    class Config:
        orm_mode = True
