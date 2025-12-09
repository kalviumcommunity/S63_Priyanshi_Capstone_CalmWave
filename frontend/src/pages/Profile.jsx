import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';
import { API_BASE_URL } from '../utils/app';

export default function Profile() {
  const [profilePic, setProfilePic] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return alert('Please select a file to upload.');
    if (!userId || userId === 'null') return alert('User not logged in. Please log in first.');

    const formData = new FormData();
    formData.append('profile', file);
    formData.append('userId', userId);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload-profile`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.filePath) {
        const fullPath = `${API_BASE_URL}/${data.filePath}`;
        setProfilePic(fullPath);
        localStorage.setItem('profilePic', fullPath);
        setSuccessMsg('🎉 Profile uploaded successfully!');
      } else {
        alert(data.message || 'Upload failed.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Something went wrong during the upload.');
    }
  };

  const handleNext = () => {
    navigate('/home');
  };

  return (
    <div className="profile-page">
      <h1 className="welcome-text animate-fade">Hey there! 👋 Let’s get you looking great – upload your profile picture!</h1>

      <div className="upload-box animate-slideup">
        <div className="button-row">
          <label htmlFor="file-upload" className="upload-label">Choose a Picture</label>
          <button className="next-button" onClick={handleNext} disabled={!profilePic}>
            Next →
          </button>
        </div>

        <input id="file-upload" type="file" onChange={handleUpload} accept="image/*" />

        {profilePic && <img src={profilePic} alt="Uploaded" className="profile-preview" />}
        {successMsg && <p className="success-message">{successMsg}</p>}
      </div>
    </div>
  );
}
