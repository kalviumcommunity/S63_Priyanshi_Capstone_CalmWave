// ============================================
// APP.JSX - Main Application Entry Point
// ============================================
// This is the root component of the React application
// Sets up routing, theme context, and global audio management

import React from 'react'; // React library for building UI components
import { BrowserRouter as Router } from 'react-router-dom'; // Routing library for navigation
import AppContent from './AppContent'; // Component containing all route definitions
import { ThemeProvider } from "./utils/ThemeContext"; // Context provider for dark/light theme
import { stopAllAudio } from './utils/audioContext'; // Utility to stop all playing audio

// ============================================
// GLOBAL AUDIO CLEANUP - Prevent memory leaks
// ============================================
// Stop all playing audio when user closes tab or navigates away
// Prevents audio from continuing to play after page unload
if (typeof window !== 'undefined') { // Check if running in browser (not SSR)
  window.addEventListener('beforeunload', stopAllAudio); // Add event listener for page unload
}

// ============================================
// APP COMPONENT - Root of component tree
// ============================================
// Wraps the entire application with necessary providers and routing
const App = () => {
  return (
    // Router provides routing context for entire app
    // Enables navigation between pages using React Router
    <Router>
      {/* ThemeProvider wraps app with theme context */}
      {/* Allows all child components to access and toggle theme (dark/light mode) */}
      <ThemeProvider>
        {/* AppContent contains all route definitions and page components */}
        <AppContent />
      </ThemeProvider>
    </Router>
  );
};

// Export App component as default export
export default App;

