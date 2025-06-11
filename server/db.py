from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from secrets import token_urlsafe
import bcrypt
from datetime import datetime, timedelta
from db_models import DBTrip, DBDay, DBJournal, DBPlace, DBAccount, Base, DBPhoto
from config import DATABASE_URL
from schemas import (
    TripCreate,
    TripOut,
    DayCreate,
    DayOut,
    JournalCreate,
    JournalOut,
    JournalUpdate,
    PlaceCreate,
    PlaceOut,
    UserPublicDetails,
    PhotoOut,
)

SESSION_LIFE_MINUTES = 60

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base.metadata.create_all(engine)


# Dependency that provides a database session for each request.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# LOGIN FUNCTIONS
def validate_email_password(email: str, password: str) -> tuple[str, int] | None:
    with SessionLocal() as db:
        account = db.query(DBAccount).filter(DBAccount.email == email).first()
        if not account:
            return None

        valid_credentials = bcrypt.checkpw(
            password.encode(), account.hashed_password.encode()
        )
        if not valid_credentials:
            return None

        session_token = token_urlsafe()
        account.session_token = session_token
        expires = datetime.now() + timedelta(minutes=SESSION_LIFE_MINUTES)

        account.session_expires_at = expires
        db.commit()
        return session_token, account.id


def validate_session(email: str, session_token: str) -> bool:
    db = SessionLocal()
    account = (
        db.query(DBAccount)
        .filter(
            DBAccount.session_token == session_token,
            DBAccount.email == email,
        )
        .first()
    )
    if not account:
        return False

    # validate that it is not expired
    if datetime.now() >= account.session_expires_at:
        return False

    # update the expiration date and save to the database
    expires = datetime.now() + timedelta(minutes=SESSION_LIFE_MINUTES)
    # assign as datetime, not isoformat
    account.session_expires_at = expires
    db.commit()
    db.close()
    return True


def invalidate_session(email: str, session_token: str) -> None:
    db = SessionLocal()
    account = (
        db.query(DBAccount)
        .filter(DBAccount.session_token == session_token and DBAccount.email == email)
        .first()
    )
    if not account:
        return
    account.session_token = f"expired-{token_urlsafe()}"
    db.commit()
    db.close()
    return


def create_user_account(email: str, password: str, name: str) -> bool:
    db = SessionLocal()
    if db.query(DBAccount).filter(DBAccount.email == email).first():
        return False
    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    account = DBAccount(
        email=email,
        name=name,
        hashed_password=hashed_password,
        session_token=None,
        session_expires_at=None,
    )
    db.add(account)
    db.commit()
    db.close()
    return True


def get_user_public_details(email: str):
    with SessionLocal() as db:
        account = db.query(DBAccount).filter(DBAccount.email == email).first()
        if not account:
            return None
        return {
            "id": account.id,
            "email": account.email,
            "name": account.name,
        }


# APP FUNCTIONS
def get_trips(account_id: int) -> list[TripOut]:
    db = SessionLocal()
    db_trips = db.query(DBTrip).filter(DBTrip.account_id == account_id).all()
    trips = []
    for trip in db_trips:
        trips.append(
            TripOut(
                id=trip.id,
                account_id=trip.account_id,
                title=trip.title,
                destination=trip.destination,
                start_date=trip.start_date,
                end_date=trip.end_date,
                vibe=trip.vibe,
                cover_photo=trip.cover_photo,
            )
        )
    db.close()
    return trips


def get_trip(trip_id: int) -> TripOut | None:
    db = SessionLocal()
    trip = db.query(DBTrip).filter(DBTrip.id == trip_id).first()
    db.close()
    if trip:
        return TripOut(
            id=trip.id,
            account_id=trip.account_id,
            title=trip.title,
            destination=trip.destination,
            start_date=trip.start_date,
            end_date=trip.end_date,
            vibe=trip.vibe,
            cover_photo=trip.cover_photo,
        )
    return None


def create_trip(account_id: int, trip: TripCreate) -> TripOut:
    db = SessionLocal()
    db_trip = DBTrip(account_id=account_id, **trip.model_dump())
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return TripOut(
        id=db_trip.id,
        account_id=db_trip.account_id,
        title=db_trip.title,
        destination=db_trip.destination,
        start_date=db_trip.start_date,
        end_date=db_trip.end_date,
        vibe=db_trip.vibe,
        cover_photo=db_trip.cover_photo,
    )


def update_trip(trip_id: int, trip: TripCreate) -> TripOut | None:
    db = SessionLocal()
    db_trip = db.query(DBTrip).filter(DBTrip.id == trip_id).first()
    if not db_trip:
        return None
    for key, value in trip.model_dump().items():
        setattr(db_trip, key, value)
    db.commit()
    return TripOut(
        id=db_trip.id,
        account_id=db_trip.account_id,
        title=db_trip.title,
        destination=db_trip.destination,
        start_date=db_trip.start_date,
        end_date=db_trip.end_date,
        vibe=db_trip.vibe,
        cover_photo=db_trip.cover_photo,
    )


def delete_trip(trip_id: int) -> bool:
    db = SessionLocal()
    try:
        # First, get all related days
        days = db.query(DBDay).filter(DBDay.trip_id == trip_id).all()

        # For each day, delete related places and journals
        for day in days:
            db.query(DBPlace).filter(DBPlace.day_id == day.id).delete()
            db.query(DBJournal).filter(DBJournal.day_id == day.id).delete()
            db.delete(day)  # delete the day after its children

        # Now delete the trip itself
        db_trip = db.query(DBTrip).filter(DBTrip.id == trip_id).first()
        if not db_trip:
            return False
        db.delete(db_trip)
        db.commit()
        return True
    except Exception as e:
        print(f"Error in delete_trip: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def get_days(trip_id: int) -> list[DayOut]:
    """
    Get all days for a user.
    """
    db = SessionLocal()
    db_days = db.query(DBDay).filter(DBDay.trip_id == trip_id).all()
    days: list[DayOut] = []
    for db_day in db_days:
        days.append(
            DayOut(
                id=db_day.id,
                trip_id=db_day.trip_id,
                day=db_day.day,
                image_url=db_day.image_url,
                plan=db_day.plan,
                highlight=db_day.highlight,
                tags=db_day.tags or [],
            )
        )
    db.close()
    return days


def add_day(trip_id: int, day: DayCreate) -> DayOut:
    """
    Add a day for a user.
    """
    db = SessionLocal()
    try:
        db_day = DBDay(
            trip_id=trip_id,
            day=day.day,
            image_url=day.image_url,
            plan=day.plan,
            highlight=day.highlight,
            tags=day.tags,
        )
        db.add(db_day)
        db.commit()
        db.refresh(db_day)
        result = DayOut(
            id=db_day.id,
            trip_id=db_day.trip_id,
            day=db_day.day,
            image_url=db_day.image_url,
            plan=db_day.plan,
            highlight=db_day.highlight,
            tags=db_day.tags or [],
        )
        return result
    finally:
        db.close()


def update_day(day_id: int, day: DayCreate) -> DayOut | None:
    db = SessionLocal()
    try:
        db_day = db.query(DBDay).filter(DBDay.id == day_id).first()
        if not db_day:
            return None
        for key, value in day.model_dump().items():
            setattr(db_day, key, value)
        db.commit()
        result = DayOut(
            id=db_day.id,
            trip_id=db_day.trip_id,
            day=db_day.day,
            image_url=db_day.image_url,
            plan=db_day.plan,
            highlight=db_day.highlight,
            tags=db_day.tags or [],
        )
        return result
    finally:
        db.close()


def delete_day(day_id: int):
    db = SessionLocal()
    try:
        db_day = db.query(DBDay).filter(DBDay.id == day_id).first()
        if db_day:
            db.delete(db_day)
            db.commit()
            return True
        else:
            return None
    finally:
        db.close()


def get_day(day_id: int) -> DayOut | None:
    db = SessionLocal()
    try:
        db_day = db.query(DBDay).filter(DBDay.id == day_id).first()
        if db_day:
            return DayOut(
                id=db_day.id,
                trip_id=db_day.trip_id,
                day=db_day.day,
                image_url=db_day.image_url,
                plan=db_day.plan,
                highlight=db_day.highlight,
                tags=db_day.tags or [],
            )
        return None
    finally:
        db.close()


def get_trip_id_by_day(day_id: int) -> int:
    with SessionLocal() as db:
        day = db.query(DBDay).filter(DBDay.id == day_id).first()
        if not day:
            raise ValueError("Day not found")
        return day.trip_id


def get_places(day_id: int) -> list[PlaceOut]:
    db = SessionLocal()
    db_places = db.query(DBPlace).filter(DBPlace.day_id == day_id).all()
    places: list[PlaceOut] = []
    for place in db_places:
        places.append(
            PlaceOut(
                id=place.id,
                day_id=place.day_id,
                name=place.name,
                type=place.type,
                lat=place.lat,
                lng=place.lng,
            )  # type: ignore
        )
    db.close()
    return places


def add_place(day_id, place: PlaceCreate) -> PlaceOut:
    db = SessionLocal()
    try:
        db_place = DBPlace(
            day_id=day_id,
            name=place.name,
            type=place.type,
            lat=place.lat,
            lng=place.lng,
        )
        db.add(db_place)
        db.commit()
        db.refresh(db_place)
        result = PlaceOut(
            id=db_place.id,
            day_id=db_place.day_id,
            name=db_place.name,
            type=db_place.type,
            lat=db_place.lat,
            lng=db_place.lng,
        )
        return result
    finally:
        db.close()


def update_place(place_id, name) -> PlaceOut | None:
    db = SessionLocal()
    try:
        place = db.query(DBPlace).filter(DBPlace.id == place_id).first()
        if not place:
            return None
        place.name = name
        db.commit()
        db.refresh(place)
        return PlaceOut(
            id=place.id,
            day_id=place.day_id,
            type=place.type,
            lat=place.lat,
            lng=place.lng,
            name=place.name,
        )
    finally:
        db.close()


def delete_place(place_id: int):
    db = SessionLocal()
    try:
        db_place = db.query(DBPlace).filter(DBPlace.id == place_id).first()
        if db_place:
            db.delete(db_place)
            db.commit()
            return True
        else:
            return None
    finally:
        db.close()


def save_full_trip(account_id: int, trip_data: TripCreate, itinerary: list[dict]):
    # step 1: create trip
    print("arrived at save_full_trip")
    trip = create_trip(account_id, trip_data)
    print("created and saved trip skelly")

    # step 2: add each day
    start_date = trip.start_date
    for i, day in enumerate(itinerary):
        print("looping through days")
        day_date = start_date + timedelta(days=i)
        day_obj = DayCreate(
            day=day_date, image_url=None, plan=str(day.get("plan") or "")
        )
        saved_day = add_day(trip.id, day_obj)

        # step 3: add places to this day
        for place in day.get("places", []):
            print("looping through places")
            place_obj = PlaceCreate(
                name=place["name"],
                type=place["type"],
                lat=place["lat"],
                lng=place["lng"],
            )
            add_place(saved_day.id, place_obj)
    print("made it through save_full_trip")
    return trip


def save_journal_entry(
    day_id: int,
    note: str,
    image_url: str | None,
    time: datetime,
    highlight: bool,
    tags: str,
) -> JournalOut:
    db = SessionLocal()
    try:
        db_entry = DBJournal(
            day_id=day_id,
            note=note,
            image_url=image_url,
            time=time,
            highlight=highlight,
            tags=list(tags),
        )
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        return JournalOut(
            id=db_entry.id,
            day_id=db_entry.day_id,
            note=db_entry.note,
            image_url=db_entry.image_url,
            time=db_entry.time,
            highlight=db_entry.highlight,
            tags=db_entry.tags,
        )
    finally:
        db.close()


def get_journals_by_trip(trip_id: int) -> list[JournalOut]:
    db = SessionLocal()
    try:
        journals = (
            db.query(DBJournal)
            .join(DBDay, DBDay.id == DBJournal.day_id)
            .filter(DBDay.trip_id == trip_id)
            .order_by(DBJournal.time)
            .all()
        )
        return [
            JournalOut(
                id=j.id,
                day_id=j.day_id,
                note=j.note,
                image_url=j.image_url,
                time=j.time,
                highlight=j.highlight,
                tags=j.tags,
            )
            for j in journals
        ]
    finally:
        db.close()


def get_journal_by_day(day_id: int) -> JournalOut | None:
    db = SessionLocal()
    try:
        journal = db.query(DBJournal).filter(DBJournal.day_id == day_id).first()
        if not journal:
            return None
        return JournalOut(
            id=journal.id,
            day_id=journal.day_id,
            note=journal.note,
            image_url=journal.image_url,
            time=journal.time,
            highlight=journal.highlight,
            tags=journal.tags,
        )
    finally:
        db.close()


def add_photo_to_day(day_id: int, image_url: str) -> PhotoOut:
    db = SessionLocal()
    db_photo = DBPhoto(day_id=day_id, image_url=image_url)
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return PhotoOut(
        id=db_photo.id, day_id=db_photo.day_id, image_url=db_photo.image_url
    )


def get_photos_by_day(day_id: int) -> list[PhotoOut]:
    db = SessionLocal()
    db_photos = db.query(DBPhoto).filter(DBPhoto.day_id == day_id).all()
    return [
        PhotoOut(id=p.id, day_id=p.day_id, image_url=p.image_url) for p in db_photos
    ]


def delete_photo(photo_id: int) -> bool:
    db = SessionLocal()
    try:
        photo = db.query(DBPhoto).filter(DBPhoto.id == photo_id).first()
        if not photo:
            return False
        db.delete(photo)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"Error deleting photo: {e}")
        return False
    finally:
        db.close()


def update_journal_entry(
    day_id: int, note: str, highlight: bool, tags: list[str]
) -> JournalOut | None:
    db = SessionLocal()
    try:
        journal = db.query(DBJournal).filter(DBJournal.day_id == day_id).first()
        if not journal:
            return None
        journal.note = note
        journal.highlight = highlight
        journal.tags = tags
        db.commit()
        db.refresh(journal)
        return JournalOut(
            id=journal.id,
            day_id=journal.day_id,
            note=journal.note,
            image_url=journal.image_url,
            time=journal.time,
            highlight=journal.highlight,
            tags=journal.tags,
        )
    finally:
        db.close()


# def delete_places_by_day(day_id: int) -> None:
#     """
#     Delete all places associated with a given day_id.
#     """
#     db = SessionLocal()
#     try:
#         db.query(DBPlace).filter(DBPlace.day_id == day_id).delete(
#             synchronize_session=False
#         )
#         db.commit()
#     finally:
#         db.close()
