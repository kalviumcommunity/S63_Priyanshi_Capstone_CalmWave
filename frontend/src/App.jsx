import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
// import Explore from './pages/Explore';
// import Quiz from './pages/Quiz';
// import Therapy from './pages/Therapy';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/explore" element={<Explore />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/therapy" element={<Therapy />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
