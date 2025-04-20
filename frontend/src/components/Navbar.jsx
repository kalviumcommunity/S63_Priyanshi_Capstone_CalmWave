import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import logo from '../assests/logo.png';
import defaultProfile from '../assests/defaultProfile.png';

export default function Navbar() {
  const location = useLocation();
  const [profilePic, setProfilePic] = useState(defaultProfile);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile', file);

    try {
      const res = await fetch('http://localhost:8000/api/upload-profile', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data?.filePath) {
        setProfilePic(`http://localhost:8000/${data.filePath}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img className="logo-img" src={logo} alt="CalmWave Logo" />
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/" className={location.pathname === '/explore' ? 'active' : ''}>
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

      <div className="profile-upload">
        <label htmlFor="upload">
          <img src={profilePic} alt="Profile" className="profile-pic" />
        </label>
        <input
          type="file"
          id="upload"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
    </nav>
  );
}
