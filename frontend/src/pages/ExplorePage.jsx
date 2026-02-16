import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ExplorePage.css';

import BgVideo from '../assests/video.png.mp4';
import Explore2 from '../assests/Explore2.jpg';
import Home2 from '../assests/Home2.jpg';
import Home3 from '../assests/Home3.jpg';
import Home4 from '../assests/Home4.jpg';
import image4 from '../assests/image4.jpg';
import image6 from '../assests/image6.png';
import image7 from '../assests/image7.png';



function ExplorePage() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleAudioClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if not authenticated
      navigate('/login');
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="home-root">
      <Navbar />
      
      {/* HERO SECTION WITH VIDEO BACKGROUND */}
      <section className="explore-hero-section">
        {/* Background Video Container */}
        <div className="explore-hero-bg-container">
          <div className="explore-hero-bg">
            <video autoPlay loop muted playsInline>
              <source src={BgVideo} type="video/mp4" />
            </video>
            <div className="explore-hero-overlay"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="explore-hero-content">
          {/* Category Label */}
          <div className="explore-category-label">Anxiety Relief</div>

          {/* Main Heading */}
          <h1 className="explore-main-heading">
            Reduce Anxiety,<br />
            Find Peace,<br />
            <em>Through Sound Therapy</em>
          </h1>

          {/* Description */}
          <p className="explore-description">
            Drift off with calming sound therapy, healing frequencies, and personalized wellness
          </p>

          {/* Get Started Button */}
          <button 
            className="explore-get-started-btn"
            onClick={() => navigate('/welcome-calmwave')}
          >
            Get Started
          </button>

          {/* Audio Player */}
          <div className="explore-audio-player">
            {/* Play Button */}
            <button 
              className="explore-play-btn"
              onClick={handleAudioClick}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg w
                idth="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>

            {/* Track Info & Progress */}
            <div className="explore-audio-info">
              <div className="explore-track-name">"Calm Mind" Anxiety Relief</div>
              <div className="explore-progress-wrapper">
                <span className="explore-time">0:00</span>
                <div className="explore-progress-bar">
                  <div className="explore-progress-fill" style={{ width: '15%' }}></div>
                </div>
                <span className="explore-time">20:00</span>
              </div>
            </div>

            {/* Volume & More Options */}
            <div className="explore-audio-controls">
              <button className="explore-control-btn" aria-label="Volume" onClick={handleAudioClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              </button>
              <button className="explore-control-btn" aria-label="More options" onClick={handleAudioClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
                  <circle cx="12" cy="5" r="1" fill="currentColor"></circle>
                  <circle cx="12" cy="19" r="1" fill="currentColor"></circle>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT CALMWAVE SECTION */}
      <section className="about-calmwave-section">
        <div className="about-calmwave-container">
          <div className="about-calmwave-content">
            {/* Left Side - Label and Title */}
            <div className="about-left">
              <p className="about-label">About CalmWave</p>
              <h2 className="about-title">
                CalmWave, Aims to Empower Individuals like you to Take Care of your Mental Health and Make Positive <em>Changes in your life.</em>
              </h2>
            </div>

            {/* Right Side - Description and Stats */}
            <div className="about-right">
              <p className="about-description">
                Our mission is to create a supportive and inclusive platform where you can explore effective tools for mental wellness, both through sound therapy and personalized assessments. We believe that true wellness encompasses more than just the absence of stress, it's about nourishing your mind, reducing anxiety, and achieving optimal balance and vitality.
              </p>
              
              <div className="about-calmwave-stats">
                <div className="stat-item">
                  <div className="stat-header">
                    <span className="stat-label">Anxiety Quiz</span>
                    <span className="stat-percentage">75%</span>
                  </div>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-header">
                    <span className="stat-label">Sound Therapy</span>
                    <span className="stat-percentage">88%</span>
                  </div>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: '88%' }}></div>
                  </div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-header">
                    <span className="stat-label">Mood Tracking</span>
                    <span className="stat-percentage">90%</span>
                  </div>
                  <div className="stat-bar">
                    <div className="stat-fill" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHOOSE SELF ASSESSMENT SECTION */}
      <section className="self-assessment-section">
        <h2 className="self-assessment-title">Know About Your Mental Health</h2>
        
        <div className="assessment-container">
          {/* Row 1: Quiz - Content Left, Image Right */}
          <div className="assessment-row">
            <div className="assessment-content-block">
              <h3 className="assessment-heading">Quiz Time</h3>
              <p className="assessment-description">
                Discover insights about your mental wellness through our guided assessment. 
                Get personalized recommendations based on your responses.
              </p>
              <button 
                className="assessment-cta-btn"
                onClick={() => navigate('/quiz')}
              >
                Take Quiz
              </button>
            </div>
            <div className="assessment-image-block">
              <img src={image6} alt="Take Quiz" />
            </div>
          </div>

          {/* Row 2: Music Therapy - Image Left, Content Right */}
          <div className="assessment-row">
            <div className="assessment-image-block">
              <img src={image4} alt="Personalised Sound Therapy" />
            </div>
            <div className="assessment-content-block">
              <h3 className="assessment-heading">Music Therapy</h3>
              <p className="assessment-description">
                Experience personalized sound therapy designed to reduce stress and anxiety. 
                Choose from calming soundscapes tailored to your mood.
              </p>
              <button 
                className="assessment-cta-btn"
                onClick={() => navigate('/therapy')}
              >
                Start Session
              </button>
            </div>
          </div>

          {/* Row 3: Mood Tracking - Content Left, Image Right */}
          <div className="assessment-row">
            <div className="assessment-content-block">
              <h3 className="assessment-heading">Mood Tracking</h3>
              <p className="assessment-description">
                Track your emotions daily and notice patterns in your mental wellness journey. 
                Visualize your progress over time.
              </p>
              <button 
                className="assessment-cta-btn"
                onClick={() => navigate('/therapy')}
              >
                Track Mood
              </button>
            </div>
            <div className="assessment-image-block">
              <img src={image7} alt="Mood Tracking" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
    </div>
  );
}

export default ExplorePage;
