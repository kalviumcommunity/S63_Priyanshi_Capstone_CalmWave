import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';
import { updateProfilePicture, getProfilePicture } from '../utils/profileUtils';

export default function ProfileNew() {
  const [profilePic, setProfilePic] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch user data when component mounts
    if (userId && token) {
      fetchUserData();
    }
    
    // Set profile pic from localStorage if available
    setProfilePic(getProfilePicture(''));
    
    // Add event listener for profile picture updates
    const handleProfilePicUpdate = () => {
      console.log('ProfileNew - profilePicUpdated event received');
      setProfilePic(getProfilePicture(''));
    };
    
    window.addEventListener('profilePicUpdated', handleProfilePicUpdate);
    
    return () => {
      window.removeEventListener('profilePicUpdated', handleProfilePicUpdate);
    };
  }, [userId, token]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData({
        ...userData,
        fullName: data.fullName,
        email: data.email
      });

      // Prioritize Google profile image if available
      if (data.googleProfileImage) {
        setProfilePic(data.googleProfileImage);
        updateProfilePicture(data.googleProfileImage);
      } else if (data.profileImage) {
        const fullPath = `http://localhost:8000/${data.profileImage}`;
        setProfilePic(fullPath);
        updateProfilePicture(fullPath);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMsg('Failed to load your profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (!userId || userId === 'null') {
      setErrorMsg('User not logged in. Please log in first.');
      return;
    }

    if (!token) {
      setErrorMsg('Authentication token missing. Please log in again.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('profile', file);
    formData.append('userId', userId);

    try {
      const res = await fetch('http://localhost:8000/api/upload-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.filePath) {
        const fullPath = `http://localhost:8000/${data.filePath}`;
        setProfilePic(fullPath);
        // Update profile picture in localStorage and notify components
        updateProfilePicture(fullPath);
        setSuccessMsg('🎉 Profile picture updated successfully!');
        setErrorMsg('');
      } else {
        setErrorMsg(data.message || 'Upload failed.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMsg('Something went wrong during the upload.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Validate passwords if the user is trying to change them
    if (userData.newPassword) {
      if (userData.newPassword !== userData.confirmPassword) {
        setErrorMsg('New passwords do not match');
        return;
      }
      
      if (!userData.currentPassword) {
        setErrorMsg('Current password is required to set a new password');
        return;
      }
    }

    setIsLoading(true);
    try {
      const updateData = {
        fullName: userData.fullName,
        email: userData.email
      };

      // Only include password fields if the user is changing their password
      if (userData.newPassword && userData.currentPassword) {
        updateData.currentPassword = userData.currentPassword;
        updateData.newPassword = userData.newPassword;
      }

      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('Profile updated successfully!');
        setErrorMsg('');
        setIsEditing(false);
        
        // Update local storage with new user data
        localStorage.setItem('fullName', data.user.fullName);
        
        // Clear password fields
        setUserData({
          ...userData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setErrorMsg(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMsg('An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Clear all local storage
        localStorage.clear();
        setSuccessMsg('Your account has been deleted successfully');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const data = await response.json();
        setErrorMsg(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setErrorMsg('An error occurred while trying to delete your account');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleNext = () => {
    navigate('/home');
  };

  // If user is not logged in, redirect to login
  if (!userId || userId === 'null') {
    return (
      <div className="profile-page">
        <div className="message-box">
          <h2>Please log in to view your profile</h2>
          <button onClick={() => navigate('/login')} className="action-button">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="welcome-text animate-fade">
        {isEditing ? 'Edit Your Profile' : 'Your Profile'}
      </h1>

      {successMsg && <div className="success-message">{successMsg}</div>}
      {errorMsg && <div className="error-message">{errorMsg}</div>}

      <div className="profile-container animate-slideup">
        <div className="profile-image-section">
          <div className="profile-image-container">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-placeholder">
                {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          <label htmlFor="file-upload" className="upload-label">
            Change Picture
          </label>
          <input 
            id="file-upload" 
            type="file" 
            onChange={handleUpload} 
            accept="image/*" 
            style={{ display: 'none' }}
          />
        </div>

        <div className="profile-details-section">
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={userData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="password-section">
                <h3>Change Password (Optional)</h3>
                
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={userData.currentPassword}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={userData.newPassword}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="button-group">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-info">
                <h2>{userData.fullName}</h2>
                <p>{userData.email}</p>
              </div>
              
              <div className="profile-actions">
                <button 
                  className="edit-button" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
                <button 
                  className="delete-button" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </button>
                <button 
                  className="home-button" 
                  onClick={handleNext}
                >
                  Go to Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirmation-modal">
          <div className="modal-content">
            <h2>Delete Account</h2>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button 
                className="cancel-button" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-button" 
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}