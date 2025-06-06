import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContent from './AppContent';
import { ThemeProvider } from "./utils/ThemeContext";
import { stopAllAudio } from './utils/audioContext';

// Stop audio on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', stopAllAudio);
}

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
};

export default App;

App.jsx