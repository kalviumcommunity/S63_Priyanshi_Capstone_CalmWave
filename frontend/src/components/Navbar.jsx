import React from 'react';
import '../styles/Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <img className="logo-img" src="/logo.png" alt="CalmWave Logo" />
      </div>

      <ul className="nav-links">
        <li><a href="/home">Home</a></li>
        <li><a href="/explore">Explore</a></li>
        <li><a href="/quiz">Quiz</a></li>
        <li><a href="/therapy">Therapy</a></li>
      </ul>

      <div className="login-box">
        <button>Login</button>
      </div>
    </nav>
  );
}
