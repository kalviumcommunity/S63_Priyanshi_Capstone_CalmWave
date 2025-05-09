// Utility functions for profile-related operations

// Function to update profile picture in localStorage and notify components
export const updateProfilePicture = (picUrl) => {
  console.log('profileUtils - Updating profile picture:', picUrl);
  
  // Save to localStorage
  localStorage.setItem('profilePic', picUrl);
  
  // Dispatch a custom event to notify components
  window.dispatchEvent(new Event('profilePicUpdated'));
  
  return picUrl;
};

// Function to get the current profile picture from localStorage
export const getProfilePicture = (defaultPic) => {
  const pic = localStorage.getItem('profilePic');
  console.log('profileUtils - Getting profile picture:', pic || defaultPic);
  return pic || defaultPic;
};