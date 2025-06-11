import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './TripSummary.css';
import WeatherForecast from "./components/WeatherForecast";
import GoogleMapComponent from './components/GoogleMap';
import { BASE_URL } from './config.js';



const TripSummary = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState("/icon.svg"); // Placeholder for future use
  const [mapData, setMapData] = useState([]); // array of POIs
  const navigate = useNavigate();

  // Fetch trip and its days
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripRes = await fetch(`${BASE_URL}/api/trips/${id}`, {
          credentials: 'include'
        });
        if (!tripRes.ok) throw new Error('Failed to fetch trip');
        const tripData = await tripRes.json();
        setTrip(tripData);

        const daysRes = await fetch(`${BASE_URL}/api/${id}/days`, {
          credentials: 'include'
        });
        if (!daysRes.ok) throw new Error('Failed to fetch trip days');
        const daysData = await daysRes.json();
        setDays(daysData);
      } catch (err) {
        console.error(err);
        setError('Could not load trip info');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="trip-detail-container">Loading...</div>;
  if (error) return <div className="trip-detail-container">Error: {error}</div>;
  if (!trip) return <div className="trip-detail-container">Trip not found.</div>;

  const handleDayClick = async (dayId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/days/${dayId}/map`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch map data');
      const data = await res.json(); // array of objects
      console.log("Raw map data from backend:", data);

      const seenCoords = new Set();

      const formatted = data.map((poi, index) => {
        let lat = poi.lat;
        let lng = poi.lng;
        const coordKey = `${lat.toFixed(7)},${lng.toFixed(7)}`;

        // If we already have this coordinate, apply tiny offset
        if (seenCoords.has(coordKey)) {
          lat += (Math.random() - 0.5) * 0.0002;
          lng += (Math.random() - 0.5) * 0.0002;
        }

        seenCoords.add(coordKey);

        return {
          key: poi.id || `poi-${index}`,
          location: { lat, lng },
          name: poi.name
        }
      })

      setMapData(formatted);

    } catch (err) {
      console.error(err);
      setError('Could not load map');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="trip-detail-container">



      <div className="cover-photo-wrapper">
        {trip.cover_photo && (
          <img
            className="trip-cover-photo"
            src={
              trip.cover_photo.startsWith('http')
                ? trip.cover_photo
                : `${BASE_URL}${trip.cover_photo.startsWith('/') ? '' : '/'}${trip.cover_photo}`
            }
            alt="Trip Cover"
          />
        )}
        <div className='trip-detail-cover-photo-overlay'>
          <h2 style={{ textTransform: 'capitalize' }}>{trip.title}</h2>
          <p style={{ textTransform: 'capitalize' }}><strong>Destination:</strong> {trip.destination}</p>
          <p><strong>Dates: </strong>
            {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            →
            {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <p style={{ textTransform: 'capitalize' }}><strong>Vibe:</strong> {trip.vibe}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
        {/* Navigate back to dashboard */}
        <button
          className="subtle-nav-button"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>

        {/* Navigate directly to Journal */}
        <button
          className="subtle-nav-button"
          onClick={() => navigate(`/trip/${id}/highlights`)}
        >
          Open {trip.destination} Journal
        </button>
      </div>

      {/* Map and Itinerary Section */}
      {days.length > 0 && (
        <div className="trip-itinerary-section">

          <div className="trip-map-container">

            {Array.isArray(mapData) && mapData.length > 0 && (<div className="trip-summary-map">
              <GoogleMapComponent locations={mapData} /></div>
            )}
            {Array.isArray(mapData) && mapData.length > 0 && (
              <WeatherForecast
                lat={mapData[0].location.lat}
                lng={mapData[0].location.lng}
                trip={trip.title}
              />
            )}          </div>

          <div className="itinerary-list">
            {days.map((day) => (
              <div key={day.id} className="itinerary-day">
                <h4 className="trip-day-title">Day: {new Date(day.day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h4>
                <p>{day.plan || 'No plan available.'}</p>
                {/* Action Buttons */}
                <div className="button-row">
                  <button
                    id={day.id}
                    className="trip-action-button view-map-button"
                    onClick={() => handleDayClick(day.id)}
                  >
                    View Map
                  </button>
                  <button
                    className="trip-action-button view-day-button"
                    onClick={() => navigate(`/day/${day.id}`)}
                  >
                    Add to Journal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
};

export default TripSummary;
