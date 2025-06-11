import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import './home.css';
import './App.css';
import { HowItWorks } from './components/HowItWorks';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-image-section">
        <div className="hero-overlay">
          <h1 className="hero-title">Nomadia</h1>
          <p>Plan your dream trip.<br />Share your story.</p>
          <Link to="/create">
            <button className="start-button">Start Planning</button>
          </Link>
        </div>
      </div>

      <div className="content-section">
        <p className="content-one">
          Visual-first travel planning made <strong>social, beautiful,</strong> and <strong>fun.</strong>
        </p>
        <HowItWorks />
      </div>
    </div>
  );
};

export default Home;
