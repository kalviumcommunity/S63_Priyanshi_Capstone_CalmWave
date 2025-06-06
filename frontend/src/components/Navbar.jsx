import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import logo from '../assests/logo.png';
import defaultProfile from '../assests/defaultProfile.png';
import { getProfilePicture } from '../utils/profileUtils';
import { useTheme } from '../utils/ThemeContext'; // ⬅ Import the theme context

export default function Navbar() {
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme(); // ⬅ Access theme and toggler

  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [profilePic, setProfilePic] = useState(defaultProfile);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedToken = localStorage.getItem('token');
    const storedPic = getProfilePicture(defaultProfile);

    setUserId(storedUserId);
    setToken(storedToken);
    setProfilePic(storedPic);

    window.addEventListener('profilePicUpdated', updateProfilePic);
    window.addEventListener('storage', updateProfilePic);

    return () => {
      window.removeEventListener('profilePicUpdated', updateProfilePic);
      window.removeEventListener('storage', updateProfilePic);
    };
  }, [location.pathname]);

  const updateProfilePic = () => {
    const fallback = getProfilePicture(defaultProfile);
    setProfilePic(fallback);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return alert('Please select an image.');
    if (!userId || userId === 'null') return alert('User not logged in.');
    if (!token) return alert('Authentication token missing. Please log in again.');

    const formData = new FormData();
    formData.append('profile', file);
    formData.append('userId', userId);

    try {
      const res = await fetch('http://localhost:8000/api/upload-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.filePath) {
        const fullPath = `http://localhost:8000/${data.filePath}`;
        localStorage.setItem('profilePic', fullPath);
        setProfilePic(fullPath);
        window.dispatchEvent(new Event('profilePicUpdated'));
      } else {
        alert(data.message || 'Upload failed.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload error occurred. Try again.');
    }
  };

  return (
    <nav className={`navbar ${darkMode ? 'dark' : ''}`}>
      <div className="logo-container">
        <img className="logo-img" src={logo} alt="CalmWave Logo" />
      </div>

      <ul className="nav-links">
        <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Explore</Link></li>
        <li><Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>Home</Link></li>
        <li><Link to="/quiz" className={location.pathname === '/quiz' ? 'active' : ''}>Quiz</Link></li>
        <li><Link to="/therapy" className={location.pathname === '/therapy' ? 'active' : ''}>Therapy</Link></li>
      </ul>

      <div className="navbar-right">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {darkMode ? '🌞' : '🌙'}
        </button>

        <div className="profile-upload">
          <Link to="/profile">
            <img
              src={profilePic}
              alt="Profile"
              className="profile-pic"
              onError={(e) => { e.target.src = defaultProfile; }}
            />
          </Link>
          <label htmlFor="upload">
            <input
              type="file"
              id="upload"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept="image/*"
            />
          </label>
        </div>
      </div>
    </nav>
  );
}
