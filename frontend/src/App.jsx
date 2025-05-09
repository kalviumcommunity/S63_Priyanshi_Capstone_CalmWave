import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ExplorePage from './pages/ExplorePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Quiz from './pages/QuizPage';
import ProfileNew from './pages/ProfileNew';
import Therapy from './pages/TherapyPage';

const App = () => {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path='/home' element={<Home/>}/>
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/profile" element={<ProfileNew />} />
        <Route path="/therapy" element={<Therapy />} />
        
        

        {/* <Route path="/explore" element={<Explore />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/therapy" element={<Therapy />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
