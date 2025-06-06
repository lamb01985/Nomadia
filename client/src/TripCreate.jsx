import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TripCreate.css';
import PlaceAutocomplete from './components/PlaceAutocomplete';

function TripCreate() {
  const [form, setForm] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    vibe: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "cover_photo") {
      setForm({ ...form, cover_photo: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCreatePersonalizedItinerary = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!form.destination || !form.start_date || !form.end_date || !form.vibe) {
        throw new Error("Please fill in all the requested fields")
      }
      localStorage.setItem('pendingTripData', JSON.stringify(form))

      navigate('/generate', {
  state: {
    pendingTrip: form
  }
})
    } catch (error) {
      console.error("Error:", error)
      setError(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }

  }

  return (
    <div className="trip-create-container">
      <header className="app-header">

      <div className="tripcreate-background">
      <div className="tripcreate-overlay">
        <h1 className="tripcreate-page-title">Create A New Trip</h1>
        <form onSubmit={handleCreatePersonalizedItinerary} className="tripcreate-form">
          {/* form contents */}
        </form>
      </div>
    </div>

 </header>
      <div className="trip-form-content">
        <form onSubmit={handleCreatePersonalizedItinerary}>

          <div className="form-group">
            <label htmlFor="destination">Destinations</label>

<PlaceAutocomplete
  onSelect={(place) => {
    setForm((prev) => ({
      ...prev,
      destination: place.name || place.address || "",
    }));
  }}
/>

          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="start_date">Start Date</label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group half">
              <label htmlFor="end_date">End Date</label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="vibe">Trip Vibe</label>
            <input
              id="vibe"
              name="vibe"
              placeholder="Trip Vibe (e.g., relaxing, adventurous, foodie)"
              value={form.vibe}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="create-personalized-itinerary-button"
              disabled={loading}
            >
              {loading ? "Generating..." : "Create Personalized Itinerary"}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default TripCreate;
