import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './TripDiary.css';
import BASE_URL from "./config.js"

const fallbackImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=400&h=300";

const TripDiary = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const [days, setDays] = useState([]);
  const [journals, setJournals] = useState([]);
  const [trip, setTrip] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [daysRes, journalsRes, tripRes] = await Promise.all([
          fetch(`${BASE_URL}/api/${tripId}/days`, {
            credentials: 'include'
          }),
          fetch(`${BASE_URL}/api/trips/${tripId}/journals`, {
            credentials: 'include'
          }),
          fetch(`${BASE_URL}/api/trips/${tripId}`, {
            credentials: 'include'
          })
        ]);

        if (!daysRes.ok || !journalsRes.ok || !tripRes.ok) {
          throw new Error("Failed to fetch one or more pieces of trip data");
        }

        const [daysData, journalsData, tripData] = await Promise.all([
          daysRes.json(),
          journalsRes.json(),
          tripRes.json()
        ]);

        setDays(daysData);
        setJournals(journalsData);
        setTrip(tripData);
      } catch (err) {
        console.error("Failed to fetch trip data:", err);
      }
    };

    fetchData();
  }, [tripId]);

  const handleCardClick = (dayId) => {
    navigate(`/day/${dayId}/recap`);
  };

  const handleSelectChange = (e) => {
    const dayId = e.target.value;
    setSelectedDay(dayId);
    if (dayId) {
      navigate(`/day/${dayId}`);
    }
  };

  const getJournalForDay = (dayId) => {
    return journals.find(j => j.day_id === dayId);
  };

  const emptyDays = days.filter(day => !getJournalForDay(day.id));

  if (!trip) {
    return <div className="loading">Loading trip info...</div>;
  }

  return (
    <div className="trip-highlights-container">
      <button className="back-button" onClick={() => navigate(`/trip/${tripId}`)}>
        Back
      </button>

      {/* Dynamic trip title */}
      <h1>{trip.destination} Trip Journal</h1>
      <p className="trip-journal-subheading">View Your Memories 📸</p>

      <div className="highlight-page">
        {emptyDays.length > 0 && (
          <div className="add-entry-container">
            <label htmlFor="add-entry-select" className="add-entry-label">
              Add Journal Entry for:
            </label>
            <select
              id="add-entry-select"
              className="add-journal-dropdown"
              value={selectedDay}
              onChange={handleSelectChange}
              aria-label="Select a day to add a journal entry"
            >
              <option value="" disabled>Select a day</option>
              {emptyDays
                .sort((a, b) => new Date(a.day) - new Date(b.day))
                .map(day => (
                  <option key={day.id} value={day.id}>
                    {new Date(day.day).toLocaleDateString(undefined, {
                      weekday: 'long', month: 'long', day: 'numeric'
                    })}
                  </option>
                ))}
            </select>
          </div>
        )}

        {days.filter(day => getJournalForDay(day.id)).length === 0 ? (
          <p style={{ fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
            Looks like your journal is waiting for its first entry.
          </p>
        ) : (
          <>
            <p className="trip-journal-hint">
              Click a day below to view or edit your journal entry.
            </p>

            <div className="highlight-grid">
              {days
                .filter(day => getJournalForDay(day.id))
                .sort((a, b) => new Date(a.day) - new Date(b.day))
                .map(day => {
                  const journal = getJournalForDay(day.id);
                  const photoUrls = day.photos?.length > 0
                    ? day.photos.map(p => p.url)
                    : journal?.image_url
                      ? [journal.image_url]
                      : [fallbackImage];

                  const imageUrl = photoUrls[0];

                  return (
                    <div
                      key={`highlight-${day.id}`}
                      className="highlight-card"
                      onClick={() => handleCardClick(day.id)}
                    >
                      <div
                        className="highlight-image"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                      >
                        <div className="journal-status has-entry">Journaled</div>
                        <div className="highlight-overlay">
                          <h3>{new Date(day.day).toLocaleDateString(undefined, {
                            weekday: 'long', month: 'long', day: 'numeric'
                          })}</h3>
                          <p><strong>Tags:</strong> {Array.isArray(journal?.tags) ? journal.tags.join(", ") : journal?.tags || "None"}</p>
                          <div style={{ marginBottom: '2rem' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TripDiary;
