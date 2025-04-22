// src/components/Home.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
// import Home1 from '../assests/Home1.png'
import Home2 from '../assests/Home2.jpg'
import Home3 from '../assests/Home3.jpg'
import Home4 from '../assests/Home4.jpg'
import Home5 from '../assests/Home5.jpg'
import Home6 from '../assests/Home6.jpg'
import Home7 from '../assests/Home7.jpg'
import Home8 from '../assests/Home8.jpg'
import Home9 from '../assests/Home9.jpg'

const Home = () => {
  return (
    <div className="fade-in">
    <Navbar/>
      {/* Hero Section */}
      <section className="hero-section">
  <div className="hero-overlay">
    <div className="hero-content">
      <h1 className="hero-title">Welcome to Your CalmWave Journey</h1>
      <p className="hero-subtext">
        Discover the power of sound therapy to reduce anxiety and enhance your relaxation.
        Our tailored sessions are designed to meet your unique needs and help you achieve tranquility.
      </p>
      <Link to="/quiz">
        <button className="custom-button">Start Relaxation</button>
      </Link>
    </div>
  </div>
</section>



      {/* Anxiety Quiz */}

          <section className="assessment-section">
  <div className="assessment-content">
    <div className="assessment-text">
      <h2>
        Discover Your Unique Path to Calmness with Our Anxiety Assessment
      </h2>
      <p>
        Take a moment to assess your anxiety levels with our quick quiz. This personalized approach will help you find the most effective relaxation techniques tailored just for you.
      </p>
    </div>
    <div className="assessment-image-glass">
      <img src={Home2} alt="Anxiety Assessment" className="assessment-img" />
    </div>
  </div>
</section>




      {/* Sound Therapy */}
      <section className="section white-bg">
        <h2 className="section-title">Personalized Sound Therapy Just for You</h2>
        <p className="section-subtext">Find your frequency. Feel the calm. Our sound sessions are tailored to your needs.</p>
        <img src={Home3} alt="Sound Therapy" className="section-img" />
      </section>

      {/* Mood Tracking */}
      <section className="gradient-bg section">
        <h2 className="section-title">Track Your Mood and Progress</h2>
        <p className="section-subtext">Visualize your emotional journey with intuitive graphs and mood logs.</p>
        <div className="card-container">
        <div className="flip-card">
  <div className="flip-card-inner">
    <div className="flip-card-front">
      <img src={Home4} alt="Visualize Mood" className="card-img" />
    </div>
    <div className="flip-card-back">
      <p className="card-title">Visualize Your Emotions</p>
      <p className="card-description">
        Track your daily feelings and spot patterns over time. Our interactive mood visualizations help you better understand your emotional journey and make positive changes.
      </p>
    </div>
  </div>
</div>
<div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img src={Home5} alt="Progress Graph" className="card-img" />
              </div>
              <div className="flip-card-back">
                <p className="card-title">Graph Your Progress</p>
                <p className="card-description">Watch your emotional journey unfold! Our progress graphs show how far you’ve come, helping you celebrate wins and understand your personal growth.</p>
              </div>
            </div>
          </div>

          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img src={Home6} alt="Join Support" className="card-img" />
              </div>
              <div className="flip-card-back">
                <p className="card-title">Join Supportive Circles</p>
                <p className="card-description">You’re not alone.Join our supportive call to connect with others, share your experiences, and feel heard in a safe, welcoming space.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Section */}
      <section className="section white-bg">
        <h2 className="section-title">Empower Yourself with Knowledge</h2>
        <p className="section-subtext">Learn techniques from trusted experts and improve your mental fitness daily.</p>
        <div className="card-container">

          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img src={Home7} alt="Expert Insights" className="card-img" />
              </div>
              <div className="flip-card-back">
                <p className="card-title">Expert-backed Techniques</p>
                <p className="card-description">Feel confident using tools that work. Our expert-backed techniques are simple, effective, and created to support your emotional well-being every step of the way.</p>
              </div>
            </div>
          </div>

          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img src={Home8} alt="Guided Programs" className="card-img" />
              </div>
              <div className="flip-card-back">
                <p className="card-title">Guided Programs</p>
                <p className="card-description">Take the guesswork out of growth. Our guided programs walk you through each step with expert-designed activities and reflections tailored to your needs.</p>
              </div>
            </div>
          </div>

          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <img src={Home9} alt="Interactive Tools" className="card-img" />
              </div>
              <div className="flip-card-back">
                <p className="card-title">Interactive Tools & Articles</p>
                <p className="card-description">Dive into a library of helpful articles and hands-on tools designed to make self-growth feel simple, engaging, and even fun.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default Home;