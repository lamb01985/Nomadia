import React, { useEffect, useState } from "react";
import './WeatherForecast.css';

const weatherIcons = {
  0: "☀️",  // Clear
  1: "🌤️",  // Mostly clear
  2: "🌥️",  // Partly cloudy
  3: "☁️",  // Overcast
  45: "🌫️", // Fog
  48: "🌫️",
  51: "🌧️", // Drizzle Light
  53: "🌧️", // Drizzle Moderate
  55: "🌧️", // Drizzle Dense
  56: "🌧️", // Freezing Drizzle Light
  57: "🌧️", // Freezing Drizzle Dense
  61: "🌧️", // Rain
  63: "🌧️", // Rain
  65: "🌧️", // Rain
  71: "❄️", // Snow
  73: "❄️", // Snow
  75: "❄️", // Snow
  80: "🌦️", // Showers
  81: "🌦️", // Showers
  82: "🌦️", // Showers
  85: "🌦️", // Showers
  86: "🌦️", // Showers
  95: "⛈️",  // Thunderstorm
  96: "⛈️",  // Thunderstorm
  99: "⛈️"  // Thunderstorm
};

const WeatherForecast = ({ lat, lng, trip }) => {
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lat || !lng) return;
    const fetchForecast = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m&timezone=America%2FLos_Angeles&forecast_days=3&temperature_unit=fahrenheit`
        );
        const data = await response.json();
        const daily = data.daily;

        const forecastData = daily.time.map((date, index) => ({
          date,
          max: daily.temperature_2m_max[index],
          min: daily.temperature_2m_min[index],
          code: daily.weather_code[index]
        }));

        setForecast(forecastData);
      } catch (err) {
        setError("Failed to fetch forecast.");
        console.error(err);
      }
    };

    fetchForecast();
  }, [lat, lng]);

  if (error) return <p>{error}</p>;
if (!forecast.length) return null;
  return (
    <div className="weathercontainer">
      <h2>Next 3 Days in {trip}</h2>
      <div className="weatherforecast">
{forecast.map((day) => {
  const [year, month, dayNum] = day.date.split('-');
  const localDate = new Date(year, month - 1, dayNum);
  return (
    <div key={day.date} className="weathercard">
      <h3>{localDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h3>
      <div className="weathericon">{weatherIcons[day.code] || "❓"}</div>
      <p className="weatherp"><strong >🌡️ High: </strong>{Math.floor(day.max)}°F</p>  <strong>Low: </strong>{Math.floor(day.min)}°F
    </div>
  );
})}
      </div>
    </div>
  );
};


export default WeatherForecast;
