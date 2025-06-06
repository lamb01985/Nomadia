import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TripDashboard.css';
import { Surfing } from '@mui/icons-material';

const vibeIcons = {
  romantic: '❤️',
  adventure: '🏕️',
  foodie: '🍜',
  relaxing: '🌴',
  cultural: '🏛️',
  scenic: '🌄',
  fun: '🎢',
  active: '🏃‍♂️',
  art: '🎨',
  nature: '🌲',
  beach: '🏖️',
  city: '🌆',
  historical: '🏰',
  sightseeing: '👀',
  family: '👨‍👩‍👧‍👦',
  party: '🎉',
  outdoorsy: '🥾',
  surf: '🏄‍♂️',
  surfing: '🏄',
  bridesmaid: '👰‍♀️',
  bachelor: '🍻',
  wedding: '💍',
  spa: '🧖‍♀️',
  wellness: '🧘‍♀️',
  yoga: '🧘‍♂️',
  shopping: '🛍️',
  work: '☕',
  default: '🧭',
};

const TripDashboard = () => {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      const res = await fetch('http://localhost:8000/api/trips', {
        credentials: 'include',
      });
      const data = await res.json();
      setTrips(data);
    };

    fetchTrips();
  }, []);

  const getVibeIcons = (vibe) => {
    const input = vibe?.toLowerCase() || '';

    const matchedIcons = Object.entries(vibeIcons)
      .filter(([key]) => input.includes(key))
      .map(([, icon]) => icon);

    return matchedIcons.length > 0 ? matchedIcons : [vibeIcons.default];
  };

  return (
    <>
      <header className="app-header">
        {/* <h1 className="app-title">Nomadia</h1> */}
      </header>

      <h1 className="trip-page-title">Trip Dashboard</h1>
      <h4 className="page-title2" style={{ color: '#156E75' }}>Manage and view all your travel adventures</h4>

      <div className="dashboard-container">
      {trips.map((item) => (
        <div key={item.id} className="trip-card">
          <button
            className="delete-button"
            onClick={async (e) => {
              e.stopPropagation();
              const confirmDelete = window.confirm("Are you sure you want to delete this trip?");
              if (!confirmDelete) return;

              try {
                const res = await fetch(`http://localhost:8000/api/trips/${item.id}`, {
                  method: 'DELETE',
                  credentials: 'include',
                });
                if (res.ok) {
                  setTrips(trips.filter((trip) => trip.id !== item.id));
                } else {
                  console.error("Failed to delete trip.");
                }
              } catch (err) {
                console.error("Error deleting trip:", err);
              }
            }}
            aria-label="Delete trip"
            title="Delete trip"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon-x-mark">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>

          <div onClick={() => navigate(`/trip/${item.id}`)}>
            <img className="trip-image" src={item.cover_photo} alt={item.title} />
            <div className="trip-overlay">
              <h3 className="trip-title" style={{ textTransform: 'capitalize' }}>{item.title}</h3>
              <p className="trip-date">
                {new Date(item.start_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                –{' '}
                {new Date(item.end_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="trip-vibe">
                {getVibeIcons(item.vibe).map((icon, index) => (
                  <span key={index}>{icon} </span>
                ))}
                <span style={{ textTransform: 'capitalize' }}>{item.vibe}</span>
              </p>
              <p className="trip-destination" style={{ textTransform: 'capitalize' }}>{item.destination}</p>
            </div>
          </div>
        </div>
      ))}
      </div>
    </>
  );
};

export default TripDashboard;
