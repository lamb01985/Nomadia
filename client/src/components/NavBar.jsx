import React from 'react';
import { User, LogIn, UserPlus, MapPin, LayoutDashboard, Menu, BookOpen, PlusCircle, Calendar } from "lucide-react";
import { useLocation, NavLink} from 'react-router-dom';
import { useState } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import ReactDOM from "react-dom";
import './NavBar.css';

const API_BASE = "http://localhost:8000";

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const {user} =useAuth();

    const handleLogout = async () => {
    const response = await fetch(`${API_BASE}/api/logout`, { credentials: 'include' });
    if (!response.ok) {
      alert('Failed to logout');
      return;
    }
    document.location.href = '/';
  };



  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };


  return (
    <nav className="navigation">
      <div className="navigation-container">
        <div className="navigation-content">
          {/* Logo/Brand on the left */}
          <div className="navigation-brand">
            <NavLink to="/" className="brand-link">
              <button className="home-button">
                Nomadia
              </button>
            </NavLink>
          </div>

          {/* Navigation Dropdown on the right */}
          {/* Navigation Dropdown while logged out */}
{user === null && (
          <div className="navigation-menu">
            <div className="dropdown">
              <button
                className="menu-trigger"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
              >
                <Menu className="nav-icon" size={30} />
                Menu
              </button>

              {isDropdownOpen && (
                <div className="dropdown-content">
                  <NavLink to="/login" className="dropdown-item" >
                    <LogIn className="nav-icon" size={19} />
                    Login
                  </NavLink>

                  <NavLink to="/signup" className="dropdown-item" >
                    <UserPlus className="nav-icon" size={19} />
                    Sign Up
                  </NavLink>

                </div>
              )}
            </div>
          </div>
)}

{/* Navigation Dropdown while logged in */}
{user !== null && (
           <div className="navigation-menu">
            <div className="dropdown">
              <button
                className="menu-trigger"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
              >
                <Menu className="nav-icon" size={30} />
                Welcome, {user.name}
              </button>

              {isDropdownOpen && (
                <div className="dropdown-content">

                  <NavLink to="/create" className="dropdown-item" >
                    <MapPin className="nav-icon" size={19}/>
                    Start Planning
                  </NavLink>

                  <NavLink to="/dashboard" className="dropdown-item" >
                    <LayoutDashboard className="nav-icon" size={19}/>
                    Trip Dashboard
                  </NavLink>

                  <div className="dropdown-separator"></div>


                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <User className="nav-icon" size={19}/>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
)}


        </div>
      </div>

      {/* Backdrop to close dropdown when clicking outside */}
{isDropdownOpen &&
  ReactDOM.createPortal(
    <div className="dropdown-backdrop" onClick={closeDropdown}></div>,
    document.getElementById("portal-root")
  )}
    </nav>

  );
}

export default Navbar;
