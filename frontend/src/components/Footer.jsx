import React from 'react';
import logo from '../assests/logo.png';
import '../styles/Footer.css'; // Import the separate Footer styles

function Footer() {
  return (
    <footer className="home-footer">
      <img className="footer-logo" src={logo} alt="CalmWave Logo" />
      
      <nav className="footer-nav">
        <a href="#">Contact Us</a>
        <a href="#">About Us</a>
        <a href="#">Help Center</a>
        <a href="#">Feedback Form</a>
      </nav>
      
      <div className="footer-bottom">
        <span>
          CalmWave is your companion in emotional wellness. Designed for everyone — 
          from students battling daily stress to professionals needing mental clarity — 
          our app transforms moments of chaos into peace.
        </span>
        <span>
          <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
        </span>
      </div>
    </footer>
  );
}

export default Footer;
