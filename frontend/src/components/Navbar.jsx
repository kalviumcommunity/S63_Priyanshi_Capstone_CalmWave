import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import logo from '../assests/logo.png';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img className="logo-img" src={logo} alt="CalmWave Logo" />
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/explore" className={location.pathname === '/explore' ? 'active' : ''}>
            Explore
          </Link>
        </li>
        <li>
          <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/quiz" className={location.pathname === '/quiz' ? 'active' : ''}>
            Quiz
          </Link>
        </li>
        <li>
          <Link to="/therapy" className={location.pathname === '/therapy' ? 'active' : ''}>
            Therapy
          </Link>
        </li>
      </ul>

      <div className="login-box">
  <Link to="/login">
  <button>Login</button>
  </Link>
  </div>
    </nav>
  );
}
