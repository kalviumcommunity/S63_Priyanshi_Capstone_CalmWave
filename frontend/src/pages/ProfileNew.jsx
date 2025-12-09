import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Profile.css';
import { updateProfilePicture, getProfilePicture } from '../utils/profileUtils';
import { validatePassword } from '../utils/validationUtils';
import ConfirmModal from '../components/ConfirmModal';

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
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid - clear storage and redirect to login
        localStorage.clear();
        setErrorMsg('Your session has expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(prevData => ({
        ...prevData,
        fullName: data.fullName,
        email: data.email
      }));

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
      if (error.message.includes('Failed to fetch')) {
        setErrorMsg('Network error. Please check your connection.');
      } else {
        setErrorMsg('Failed to load your profile data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, token, navigate]);

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
  }, [userId, token, fetchUserData]);

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
      // Check password strength
      const passwordValidation = validatePassword(userData.newPassword);
      if (!passwordValidation.isValid) {
        setErrorMsg(passwordValidation.message);
        return;
      }
      
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
    setErrorMsg('');
    setSuccessMsg('');
    
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

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
        
        const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Handle different HTTP status codes
        if (response.status === 401) {
          setErrorMsg('Your session has expired. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        if (response.status === 403) {
          setErrorMsg('You are not authorized to update this profile.');
          return;
        }
        
        if (response.status === 404) {
          setErrorMsg('User profile not found.');
          return;
        }
        
        if (response.status === 500) {
          setErrorMsg('Server error. Please try again later.');
          return;
        }
        
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
        
        if (error.name === 'AbortError') {
          setErrorMsg('Request timed out. Please check your internet connection and try again.');
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          setErrorMsg('Network error. Please check your internet connection.');
        } else {
          setErrorMsg('An error occurred while updating your profile. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error in update process:', error);
      setErrorMsg('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const initiateDeleteAccount = () => {
    setShowDeleteModal(true);
  };
  
  const handleDeleteAccount = async () => {
    // Modal will handle the confirmation

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      
      const response = await fetch(`http://localhost:8000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle different HTTP status codes
      if (response.status === 401) {
        setErrorMsg('Your session has expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      if (response.status === 403) {
        setErrorMsg('You are not authorized to delete this account.');
        return;
      }
      
      if (response.status === 404) {
        setErrorMsg('User account not found.');
        return;
      }
      
      if (response.status === 500) {
        setErrorMsg('Server error. Please try again later.');
        return;
      }

      if (response.ok) {
        // Clear all local storage
        localStorage.clear();
        
        // Create a custom element for the success message with a friendly goodbye
        const successElement = document.createElement('div');
        successElement.className = 'success-message account-deleted-message';
        successElement.innerHTML = `
          <div style="font-size: 3rem; margin-bottom: 10px;">👋</div>
          <div>Your account has been deleted successfully.</div>
          <div style="margin-top: 10px;">We hope to see you again soon!</div>
        `;
        
        // Replace any existing success message
        const existingMsg = document.querySelector('.success-message');
        if (existingMsg) {
          existingMsg.replaceWith(successElement);
        } else {
          // If no existing message, use the state
          setSuccessMsg('👋 Your account has been deleted successfully. We hope to see you again soon!');
        }
        
        // Redirect to signup page after a short delay
        setTimeout(() => {
          navigate('/signup');
        }, 3000);
      } else {
        try {
          const data = await response.json();
          setErrorMsg(data.message || 'Failed to delete account');
        } catch {
          setErrorMsg('Failed to delete account. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      
      if (error.name === 'AbortError') {
        setErrorMsg('Request timed out. Please check your internet connection and try again.');
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setErrorMsg('Network error. Please check your internet connection.');
      } else {
        setErrorMsg('An error occurred while trying to delete your account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    navigate('/home');
  };

  // If user is not logged in, show friendly message with login/signup options
  if (!userId || userId === 'null') {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <div className="auth-prompt-container">
            <div className="auth-prompt-box">
              <div className="auth-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ADFF2F" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h2>Welcome to CalmWave!</h2>
              <p>Create an account to unlock personalized features, track your progress, and customize your wellness journey.</p>
              
              <div className="auth-prompt-buttons">
                <button onClick={() => navigate('/signup')} className="primary-auth-btn">
                  Create Account
                </button>
                <button onClick={() => navigate('/login')} className="secondary-auth-btn">
                  Already have an account? Log In
                </button>
              </div>
              
              <div className="auth-divider">
                <span>or</span>
              </div>
              
              <button onClick={() => navigate('/')} className="browse-btn">
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
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
                  onClick={initiateDeleteAccount}
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

      {/* Secure confirmation modal for account deletion */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="WARNING: You are about to permanently delete your account. All your data will be lost and this action cannot be undone."
        confirmText={isLoading ? "Deleting..." : "Delete My Account"}
        cancelText="Cancel"
        confirmButtonClass="danger"
        requireTypedConfirmation={true}
        confirmationWord="DELETE"
      />
      </div>
    </>
  );
}