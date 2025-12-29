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
    <>
      {/* BACKGROUND VIDEO */}
      <div className="navbar-video-wrapper">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="navbar-video"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* NAVBAR */}
      <nav className="glass-navbar">
        <div className="navbar-left">
          <img src={logo} alt="CalmWave" className="logo-img" />

          <button
            className="hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <li>
            <Link
              to="/"
              className={location.pathname === "/" ? "active" : ""}
            >
              Explore
            </Link>
          </li>
          <li>
            <Link
              to="/home"
              className={location.pathname === "/home" ? "active" : ""}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/quiz"
              className={location.pathname === "/quiz" ? "active" : ""}
            >
              Quiz
            </Link>
          </li>
          <li>
            <Link
              to="/therapy"
              className={location.pathname === "/therapy" ? "active" : ""}
            >
              Therapy
            </Link>
          </li>
        </ul>

        <div className="navbar-right">
          <Link to="/profile">
            <img
              src={profilePic}
              alt="Profile"
              className="profile-pic"
              onError={(e) => (e.target.src = defaultProfile)}
            />
          </Link>
        </div>
      </nav>
    </>
  );
}
