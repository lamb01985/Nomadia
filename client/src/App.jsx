import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './home';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import Navbar from './components/NavBar';
import TripCreate from './TripCreate';
import TripDashboard from './TripDashboard';
import TripGenerate from './TripGenerate';
import TripSummary from './TripSummary';
import DayView from './DayView';
import TripDiary from './TripDiary';
import DayRecap from './DayRecap';
import './App.css';
import WeatherForecast from './components/WeatherForecast.jsx';
import GoogleMapComponent from './components/GoogleMap.jsx';
import { HowItWorks } from './components/HowItWorks.jsx';

const App = () => {
  return (
    <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<TripCreate />} />
          <Route path="/dashboard" element={<TripDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/generate" element={<TripGenerate />} />
          <Route path="/trip/:id" element={<TripSummary />} />
          <Route path="/weatherforecast" element={<WeatherForecast />} />
          <Route path="/googlemapcomponent" element={<GoogleMapComponent />} />
          <Route path="/howitworks" element={<HowItWorks />} />

            {/* Journal part */}
            {/* Journal routes */}
          <Route path="/day/:id" element={<DayView />} />
          <Route path="/trip/:id/highlights" element={<TripDiary />} />
          <Route path="/day/:id/recap" element={<DayRecap />} />
        </Routes>
    </>
  );
}

export default App;
