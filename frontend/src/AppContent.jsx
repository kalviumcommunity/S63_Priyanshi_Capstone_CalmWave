// ============================================
// APPCONTENT.JSX - Route Configuration Component
// ============================================
// This component defines all application routes and handles
// audio cleanup when navigating between pages

import React, { useEffect } from 'react'; // React and useEffect hook
import { Routes, Route, useLocation } from 'react-router-dom'; // React Router components and hooks

// ============================================
// PAGE COMPONENT IMPORTS
// ============================================
// Import all page-level components that will be rendered for different routes
import ExplorePage from './pages/ExplorePage'; // Landing/welcome page
import Login from './pages/Login'; // Login page for authentication
import Signup from './pages/Signup'; // User registration page
import ForgotPassword from './pages/ForgotPassword'; // Password recovery page
import Home from './pages/Home'; // Main home page (after login)
import Quiz from './pages/QuizPage'; // Anxiety assessment quiz
import ProfileNew from './pages/ProfileNew'; // User profile and dashboard
import Therapy from './pages/TherapyPage'; // Sound therapy sessions page

// Import audio utility for cleanup on route changes
import { stopAllAudio } from './utils/audioContext';

// ============================================
// APPCONTENT COMPONENT - Route Manager
// ============================================
const AppContent = () => {
  // Get current location object (contains pathname, search, hash, etc.)
  // This hook re-renders component when route changes
  const location = useLocation();
  
  // ============================================
  // AUDIO CLEANUP ON ROUTE CHANGE
  // ============================================
  // useEffect runs whenever location changes (user navigates to different page)
  useEffect(() => {
    console.log('Route changed, stopping all audio'); // Log for debugging
    stopAllAudio(); // Stop any playing audio from previous page
  }, [location]); // Dependency array - runs when location changes
  
  // ============================================
  // ROUTE DEFINITIONS
  // ============================================
  // Define which component renders for each URL path
  return (
    <Routes>
      {/* Landing page - shown at root URL */}
      <Route path="/" element={<ExplorePage />} />
      
      {/* Authentication routes */}
      <Route path="/login" element={<Login />} /> {/* User login */}
      <Route path="/signup" element={<Signup />} /> {/* New user registration */}
      <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Password recovery */}
      
      {/* Main application routes (typically accessed after login) */}
      <Route path='/home' element={<Home/>}/> {/* Home dashboard */}
      <Route path="/quiz" element={<Quiz />} /> {/* Anxiety assessment quiz */}
      <Route path="/profile" element={<ProfileNew />} /> {/* User profile page */}
      <Route path="/therapy" element={<Therapy />} /> {/* Sound therapy page */}
    </Routes>
  );
};

// Export AppContent component as default export
export default AppContent;