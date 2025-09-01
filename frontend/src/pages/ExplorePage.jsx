import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ExplorePage.css';

import Explore2 from '../assests/Explore2.jpg';



function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-root">
      <Navbar />
      <header className="home-header">
        <div className="hero-background">
          <div className="hero-content">
            <h1>Transform Your Mind with Soothing Sound Therapy</h1>
            <p>
              CalmWave brings the science of sound therapy to your fingertips. Whether you're feeling anxious, stressed, or simply seeking a mental reset, our app helps you reconnect with inner peace. Using curated soundscapes and frequencies backed by neuroscience, CalmWave supports your journey toward mental clarity and emotional balance.
            </p>
            <p>
              Dive into a world of healing audio experiences — from deep alpha waves that relax your body, to custom binaural beats that promote focus and calm. Join thousands who have made CalmWave their daily ritual for wellness.
            </p>
            <button className="get-started-btn" onClick={() => navigate('/quiz')}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      <section className="features-section">
        <div className="features-content">
          <div className="features-text">
            <h2>Discover the Key Features of Our Sound Therapy App</h2>
            <p>
              CalmWave is designed with your mental wellness at its core. Our app features personalized therapy sessions, mood-based sound generation, and guided meditations that help you unwind at any time of the day. Whether you're winding down after work or preparing for a deep night's rest, CalmWave tunes in to your needs.
            </p>
            <p>
              ✦ Mood-Based Sound Profiles: Let the app analyze your emotional state and generate healing frequencies tailored just for you.<br />
              ✦ Daily Mood Logs: Track your emotional patterns and gain insights over time.<br />
              ✦ Guided Relaxation: Professional audio guides to walk you through breathing and mindfulness practices.<br />
              ✦ Progress Visualization: See how your mental state improves with consistent practice.
            </p>
          </div>
          <img
            src={Explore2}
            alt="Floating meditation"
            className="features-img"
          />
        </div>
      </section>
      <Footer />
      
    </div>
  );
}

export default HomePage;
