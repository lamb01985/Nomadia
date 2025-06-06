from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Float,
    ForeignKey,
    Text,
    DateTime,
    Boolean,
)
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import ARRAY, TEXT
from datetime import datetime

Base = declarative_base()


class DBAccount(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    session_token: Mapped[str] = mapped_column(nullable=True)
    session_expires_at: Mapped[datetime] = mapped_column(nullable=True)


class DBTrip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    title = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    vibe = Column(String, nullable=True)
    cover_photo = Column(String, nullable=True)


class DBDay(Base):
    __tablename__ = "days"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    day = Column(Date, nullable=False)
    image_url = Column(String, nullable=True)
    plan = Column(Text)
    highlight = Column(Boolean, default=False)
    tags = Column(ARRAY(Text), default=[])

    journals = relationship(
        "DBJournal", back_populates="day", cascade="all, delete-orphan"
    )
    photos = relationship("DBPhoto", back_populates="day", cascade="all, delete-orphan")


class DBPlace(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("days.id"))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)


class DBJournal(Base):
    __tablename__ = "journals"

    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("days.id"))
    image_url = Column(String, nullable=True)
    note = Column(Text, nullable=True)
    time = Column(DateTime, nullable=True)
    highlight = Column(Boolean, default=False)
    tags = Column(ARRAY(String), nullable=False, default=list)

    day = relationship("DBDay", back_populates="journals")


class DBPhoto(Base):
    __tablename__ = "photos"
    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("days.id"))
    image_url = Column(String)

    day = relationship("DBDay", back_populates="photos")
