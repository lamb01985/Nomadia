import React from 'react';
// import TripCard from './components/TripCard';
// import TripBuild from './TripBuild';
import TripSummary from './TripSummary';
// import DayView from './DayView';
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import NavBar from './components/NavBar';
import './home.css';
import './App.css';
import { useNavigate } from 'react-router-dom'; // simplifies navigation between pages
import { HowItWorks } from './components/HowItWorks';



const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">

      <div className="hero-image-section">
        {/* <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1950&q=80"
          alt="Beautiful Travel Image"
          className="hero-img"
        /> */}
        <div className="hero-overlay">
          <h1 className="hero-title">Nomadia</h1>
          <p>Plan your dream trip.<br />Share your story.</p>
          <Link to="/create">
            <button className="start-button">Start Planning</button>
          </Link>
        </div>
      </div>


      <div className="content-section">
        <p className="content-one">Visual-first travel planning made<strong> social, beautiful,</strong> and <strong>fun.</strong></p>
        {/* <p className="content-two">Discover breathtaking destinations, create unforgettable memories, and embark on adventures that will change your perspective forever.</p> */}
        <HowItWorks />
      </div>

      {/* Footer */}
      {/* <footer className="footer-section">
        <p>Start building your next adventure today.</p>
        <Link to="/create">
          <button className="start-button">Create My First Trip</button>
        </Link>
      </footer> */}
    </div>
  );
}

export default Home;
