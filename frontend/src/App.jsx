import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContent from './AppContent';

import { stopAllAudio } from './utils/audioContext';

// Add event listener to stop all audio when the page is unloaded
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', stopAllAudio);
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
