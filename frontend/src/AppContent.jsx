import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import ExplorePage from './pages/ExplorePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Quiz from './pages/QuizPage';
import ProfileNew from './pages/ProfileNew';
import Therapy from './pages/TherapyPage';

// Import our audio context
import { stopAllAudio } from './utils/audioContext';

const AppContent = () => {
  const location = useLocation();
  
  // Stop all audio when the route changes
  useEffect(() => {
    console.log('Route changed, stopping all audio');
    stopAllAudio();
  }, [location]);
  
  return (
    <Routes>
      <Route path="/" element={<ExplorePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path='/home' element={<Home/>}/>
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/profile" element={<ProfileNew />} />
      <Route path="/therapy" element={<Therapy />} />
    </Routes>
  );
};

export default AppContent;