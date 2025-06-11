import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./TripGenerate.css";
import WeatherForecast from "./components/WeatherForecast";
import Loading from "./components/Loading";

const TripGenerate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data passed from TripCreate if available
  const passedData = location.state || {};
  let { pendingTrip, generatedItinerary } = passedData;

  // Fallback: try to load from localStorage if state is missing
  if (!pendingTrip) {
    const stored = localStorage.getItem('pendingTripData');
    if (stored) {
      pendingTrip = JSON.parse(stored);
    }
  }

  // State for trip and itinerary data
  const [trip, setTrip] = useState(pendingTrip || null);
  const [itinerary, setItinerary] = useState(generatedItinerary || []);
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // State for editable form
  const [showEditForm, setShowEditForm] = useState(false);
  const [editableItinerary, setEditableItinerary] = useState([]);

  //Initialize with pending trip data
  useEffect(() => {
    if (trip && itinerary.length === 0 && !trip.cover_photo && !hasGenerated) {
      setImgLoading(true);
      console.log("Calling handleGenerate from useEffect");
      handleGenerate();

    }
  }, [trip, itinerary.length, hasGenerated]);

  // Generate itinerary with OpenAI
  const handleGenerate = async () => {
    if (!trip) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: trip.destination,
          start_date: trip.start_date,
          end_date: trip.end_date,
          vibe: trip.vibe,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to generate itinerary");
      }

      const result = await response.json();
      // Update the itinerary state with the new data
      if (result.days.length > 0 && Array.isArray(result.days)) {
        setItinerary(result.days);
        setEditableItinerary([...result.days]);
      } if (result.cover_photo) {
        setTrip((prev) => ({ ...prev, cover_photo: result.cover_photo }))
      } else {
        setError("Itinerary format is incorrect")
      }
      setHasGenerated(true);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      setError("Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }

    const fetchImage = async () => {
      try {
        const imageResponse = await fetch(`http://localhost:8000/api/cover-photo?destination=${trip.destination}&vibe=${trip.vibe}`)
        const imageData = await imageResponse.json()
        if (imageData.cover_photo) {
          setTrip(prev => ({ ...prev, cover_photo: imageData.cover_photo }))
        }
        setImgLoading(false);
      } catch (error) {
        console.log("Image fetch failed:", error)
      }
    };
    fetchImage();
  };



  // Handle "Sounds Good" button click - show editable form
  const handleSoundsGood = () => {
    setShowEditForm(true);
  };

  // Handle try again button
  const handleTryAgain = () => {
    setHasGenerated(false);
    handleGenerate()
  };

  // Handle itinerary text changes in the form
  const handleItineraryChange = (index, value) => {
    const updatedItinerary = [...editableItinerary];
    updatedItinerary[index] = value;
    setEditableItinerary(updatedItinerary);
  };



  // Handle "Choose My Own Adventure" button click
  const handleChooseMyOwnAdventure = async () => {
    setIsSavingTrip(true);
    const transformedItinerary = editableItinerary.map((day) => {
      const places = Array.isArray(day.places)
        ? day.places
          .filter(p => p.gps_coordinates?.latitude && p.gps_coordinates?.longitude)
          .map(p => ({
            name: p.name,
            type: p.type || "landmark",
            lat: p.gps_coordinates.latitude,
            lng: p.gps_coordinates.longitude
          }))
        : [];

      return {
        day: day.date,
        plan: day?.plan ? String(day.plan) : "",
        image_url: null,
        places: places
      };
    });


    try {
      const response = await fetch("http://localhost:8000/api/save/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          trip: {
            title: trip.destination,
            destination: trip.destination,
            start_date: trip.start_date,
            end_date: trip.end_date,
            vibe: trip.vibe,
            cover_photo: trip.cover_photo
          },
          itinerary: transformedItinerary
        })
      })
      const data = await response.json();
      if (data.trip_id) {
        navigate(`/trip/${data.trip_id}`)
      } else {
        setError("Trip was not saved correctly")
      }
    } catch (error) {
      console.error("error saving trip:", error);
      setError("something went wrong saving the trip.")
    } finally {
      setIsSavingTrip(false)
    }
  }

  // Render error state
  if (error && !itinerary.length) {
    return (
      <div className="trip-generate-container">

        <div className="error">{error}</div>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!pendingTrip) {
    return (
      <div className="trip-generate-container">

        <div className="error">
          No trip data found. Please start from the Create Trip page.
        </div>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }
  const renderItineraryLoading = () => {
    if (loading && !hasGenerated) {
      return (
        <div className="day-suggestion">
          <p>Generating your personalized itinerary...</p>
        </div>
      );
    }
    return (
      itinerary.map((day, index) => (
        <div key={index} className="day-suggestion">
          <h3>
            {day.day
              ? new Date(day.day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : `Day ${index + 1}`}
          </h3>
          <p>{day.plan || day}</p>
        </div>
      ))
    )
  }

  const renderImageLoading = () => {
    return (
      <div className="trip-image-generate">
        {imgLoading ? <Loading /> : (
          <img
            src={trip?.cover_photo || (trip?.destination ? `https://source.unsplash.com/featured/?${trip.destination}` : undefined)}
            alt={trip?.destination || "Trip destination"}
            onLoad={() => setImgLoading(false)}
            onError={() => setImgLoading(false)}
          />
        )}
      </div>
    );
  }
  // lat and lng for weather component
  const lat = itinerary[0]?.places?.[0]?.gps_coordinates?.latitude;
  const lng = itinerary[0]?.places?.[0]?.gps_coordinates?.longitude;
  return (
    <div className="trip-generate-container">


      <div className="trip-generate-content">
        {/* Left column - Trip suggestions */}
        <div className="trip-suggestions-container">
          <h2>Trip Suggestions</h2>

          {/* Trip image */}
          {renderImageLoading()}

          {/* Generated itinerary */}
          {renderItineraryLoading()}

          {/* Action buttons */}
          <div className="suggestion-actions">
            <button
              onClick={handleSoundsGood}
              className="sounds-good-button"
              disabled={loading || isSavingTrip || showEditForm}
            >
              {showEditForm ? "Editing..." : "Sounds Good"}
            </button>

            <button
              onClick={handleTryAgain}
              className="try-again-button"
              disabled={loading || isSavingTrip}
            >
              {loading ? "Generating..." : "Try Again"}
            </button>
          </div>
        </div>

        {/* Right column - Weather and editable itinerary */}
        <div className="trip-details-container">
          {/* Weather section */}
          <div className="weather-section">
            <h2>Weather</h2>
            <div className="weather-forecast">
              <WeatherForecast lat={lat} lng={lng} trip={trip.destination} />
            </div>
          </div>

          {/* My Itinerary section */}
          <div className="my-itinerary-section">
            <h2>My Itinerary</h2>

            {showEditForm ? (
              // Editable form
              <div className="editable-itinerary">
                {editableItinerary.map((day, index) => (
                  <div key={index} className="editable-day">
                    <h4>{new Date(day.day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || `Day ${index + 1}`}</h4>
                    <textarea
                      value={day.plan || day}
                      onChange={(e) => {
                        const updated = [...editableItinerary];
                        if (typeof day === "object" && day.plan !== undefined) {
                          updated[index] = { ...day, plan: e.target.value };
                        } else {
                          updated[index] = e.target.value;
                        }
                        setEditableItinerary(updated);
                      }
                      }
                      rows={6}
                      placeholder="What are your plans for this day?"
                    />
                  </div>
                ))}

                <button
                  onClick={handleChooseMyOwnAdventure}
                  className="choose-adventure-button"
                  disabled={isSavingTrip}
                >
                  {isSavingTrip ? "Saving..." : "Choose My Own Adventure"}
                </button>
              </div>
            ) : (
              // Preview form (non-editable)
              <div className="itinerary-preview">
                {itinerary.map((day, index) => (
                  <div key={index} className="day-preview">
                    <h4>Day {index + 1}</h4>
                    <div className="day-input-placeholder">
                      <p>What are your plans today?</p>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSoundsGood}
                  className="choose-adventure-button"
                  disabled={loading || isSavingTrip}
                >
                  Edit My Adventure
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default TripGenerate;
