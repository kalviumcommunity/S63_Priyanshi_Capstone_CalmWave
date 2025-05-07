import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import logo from '../assests/logo.png';
import defaultProfile from '../assests/defaultProfile.png';

export default function Navbar() {
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const [profilePic, setProfilePic] = useState(defaultProfile);

  // ✅ Load profile image from localStorage on mount
  useEffect(() => {
    const storedPic = localStorage.getItem('profilePic');
    if (storedPic) {
      setProfilePic(storedPic);
    }
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return alert('Please select an image.');
    if (!userId || userId === 'null') return alert('User not logged in.');

    const formData = new FormData();
    formData.append('profile', file);
    formData.append('userId', userId);

    try {
      const res = await fetch('http://localhost:8000/api/upload-profile', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.filePath) {
        const fullPath = `http://localhost:8000/${data.filePath}`;
        setProfilePic(fullPath);
        localStorage.setItem('profilePic', fullPath); // ✅ Store it for future use
      } else {
        alert(data.message || 'Upload failed.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload error occurred. Try again.');
    }
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img className="logo-img" src={logo} alt="CalmWave Logo" />
      </div>

      <ul className="nav-links">
        <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Explore</Link></li>
        <li><Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>Home</Link></li>
        <li><Link to="/quiz" className={location.pathname === '/quiz' ? 'active' : ''}>Quiz</Link></li>
        <li><Link to="/therapy" className={location.pathname === '/therapy' ? 'active' : ''}>Therapy</Link></li>
      </ul>

      <div className="profile-upload">
        <Link to="/profile">
          <img src={profilePic} alt="Profile" className="profile-pic" />
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
    </nav>
  );
}
