import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assests/logo.png";
import defaultProfile from "../assests/defaultProfile.png";
import { getProfilePicture } from "../utils/profileUtils";

export default function Navbar() {
  const location = useLocation();
  const [profilePic, setProfilePic] = useState(defaultProfile);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setProfilePic(getProfilePicture(defaultProfile));
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left: Brand */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <img src={logo} alt="" className="brand-icon" />
            <span className="brand-name">CalmWave</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
        </button>

        {/* Center: Navigation */}
        <ul className={`navbar-menu ${isMenuOpen ? "menu-open" : ""}`}>
            <Link
              to="/"
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            >
              Explore
            </Link>
          
          <li>
            <Link
              to="/home"
              className={`nav-link ${location.pathname === "/home" ? "active" : ""}`}
            >
              Home
            </Link>
          </li>
          
          <li>
            <Link
              to="/quiz"
              className={`nav-link ${location.pathname === "/quiz" ? "active" : ""}`}
            >
              Quiz
            </Link>
          </li>
          <li>
            <Link
              to="/therapy"
              className={`nav-link ${location.pathname === "/therapy" ? "active" : ""}`}
            >
              Therapy
            </Link>
          </li>
        </ul>

        {/* Right: Profile */}
        <div className="navbar-actions">
          <Link to="/profile" className="profile-button" aria-label="Go to profile">
            <img
              src={profilePic}
              alt=""
              className="profile-image"
              onError={(e) => (e.target.src = defaultProfile)}
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
