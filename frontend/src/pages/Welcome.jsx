import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import welcomeIllustration from '../assests/image8.png';
import '../styles/Profile.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="welcome-layout">
        <div className="welcome-left-column">
          <div className="auth-prompt-box">
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
            
            <button onClick={() => navigate('/home')} className="browse-btn">
              Continue to Home
            </button>
          </div>
        </div>
        
        <div className="welcome-right-column">
          <img src={welcomeIllustration} alt="Welcome Illustration" className="welcome-illustration" />
        </div>
      </div>
    </>
  );
};

export default Welcome;
