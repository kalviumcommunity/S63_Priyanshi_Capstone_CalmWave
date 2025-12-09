import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

import HomeBg from '../assests/Home.jpeg';
import Home5 from '../assests/Home5.jpg';
import Home6 from '../assests/Home6.jpg';
import Home7 from '../assests/Home7.jpg';
import Home2 from '../assests/Home2.jpg';
import Home3 from '../assests/Home3.jpg';
import Home4 from '../assests/Home4.jpg';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page-wrapper">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="home-hero-section">
        {/* Background Image Container */}
        <div className="home-hero-bg-container">
          <div className="home-hero-bg">
            <img src={HomeBg} alt="Meditation background" className="home-bg-image" />
            <div className="home-hero-overlay"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="home-hero-content">
          {/* Main Content Area */}
          <div className="home-main-content">
            <h1 className="home-main-heading">
              Health Is Wealth<br />
              Trust in <em>Our Care</em>
            </h1>

            <p className="home-description">
              Empower your health, empower your life. Invest in your<br />
              health for a prosperous future. Healthy habits happy life.
            </p>

            <button 
              className="home-get-started-btn"
              onClick={() => navigate('/therapy')}
            >
              Get Started →
            </button>
          </div>

          {/* Side Cards */}
          <div className="home-side-cards">
            <div className="home-card home-card-1">
              <h3>Anxiety Assessment</h3>
              <button 
                className="home-card-arrow"
                onClick={() => navigate('/quiz')}
              >
                →
              </button>
            </div>

            <div className="home-card home-card-2">
              <h3>Mood Tracking</h3>
              <div className="home-stats-visual">
                <div className="home-gauge">
                  <svg viewBox="0 0 100 50" className="home-gauge-svg">
                    <path
                      d="M 10 45 A 40 40 0 0 1 90 45"
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 45 A 40 40 0 0 1 70 15"
                      fill="none"
                      stroke="#1a3a2e"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="home-gauge-value">75%</div>
                </div>
                <p className="home-stats-label">Performance metrics</p>
              </div>
              <button 
                className="home-card-arrow"
                onClick={() => navigate('/journal')}
              >
                →
              </button>
            </div>

            <div className="home-card home-card-3"y>
              <p className="home-card-tag">Thearpy</p>
              <h3>Sound therapy<br/>Session</h3>
              <button 
                className="home-card-arrow"
                onClick={() => navigate('/therapy')}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CALMWAVE HELPS YOU SECTION */}
      <section className="home-helps-section">
        <div className="home-helps-container">
          <p className="home-helps-label">CalmWave helps you</p>
          
          <h2 className="home-helps-title">
            Helping People and Doing Good<br />
            <em>Work in Society</em>
          </h2>

          <div className="home-helps-content">
            {/* Left Side - Images Grid */}
            <div className="home-helps-images">
              <img src={Home5} alt="Person sitting" className="home-helps-img home-helps-img-1" />
              <img src={Home6} alt="People helping" className="home-helps-img home-helps-img-2" />
              <img src={Home7} alt="Support and care" className="home-helps-img home-helps-img-3" />
            </div>

            {/* Right Side - Benefits List */}
            <div className="home-helps-benefits">
              <h3 className="home-helps-benefits-title">
                Helping <em>Society</em> People
              </h3>
              
              <ul className="home-helps-list">
                <li className="home-helps-item">
                  <div className="home-helps-icon">✓</div>
                  <span>Reduce anxiety and find inner peace</span>
                </li>
                <li className="home-helps-item">
                  <div className="home-helps-icon">✓</div>
                  <span>Improve mental wellness through sound therapy</span>
                </li>
                <li className="home-helps-item">
                  <div className="home-helps-icon">✓</div>
                  <span>Track your emotional journey and growth</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* WELLNESS JOURNEYS SECTION */}
      <section className="home-journeys-section">
        <div className="home-journeys-container">
          <h2 className="home-journeys-title">
            Wellness <em>Journeys</em> Stories
          </h2>

          <div className="home-journeys-cards">
            {/* Card 1 - Relaxation Techniques */}
            <div className="home-journey-card">
              <div className="home-journey-image-wrapper">
                <img src={Home2} alt="Relaxation Techniques" className="home-journey-image" />
              </div>
              <div className="home-journey-content">
                <h3 className="home-journey-card-title">Relaxation Techniques</h3>
                <div className="home-journey-meta">
                  <span className="home-journey-author">CalmWave Guide</span>
                  <span className="home-journey-separator">|</span>
                  <span className="home-journey-type">Therapy</span>
                </div>
                <button 
                  className="home-journey-play-btn"
                  onClick={() => navigate('/therapy')}
                >
                  →
                </button>
              </div>
            </div>

            {/* Card 2 - Track Progress */}
            <div className="home-journey-card">
              <div className="home-journey-image-wrapper">
                <img src={Home3} alt="Track Progress" className="home-journey-image" />
              </div>
              <div className="home-journey-content">
                <h3 className="home-journey-card-title">Track Progress</h3>
                <div className="home-journey-meta">
                  <span className="home-journey-author">Daily Insights</span>
                  <span className="home-journey-separator">|</span>
                  <span className="home-journey-type">Analytics</span>
                </div>
                <button 
                  className="home-journey-play-btn"
                  onClick={() => navigate('/journal')}
                >
                  →
                </button>
              </div>
            </div>

            {/* Card 3 - Mood Trends */}
            <div className="home-journey-card">
              <div className="home-journey-image-wrapper">
                <img src={Home4} alt="Mood Trends" className="home-journey-image" />
              </div>
              <div className="home-journey-content">
                <h3 className="home-journey-card-title">Mood Trends</h3>
                <div className="home-journey-meta">
                  <span className="home-journey-author">Mental Wellness</span>
                  <span className="home-journey-separator">|</span>
                  <span className="home-journey-type">Tracking</span>
                </div>
                <button 
                  className="home-journey-play-btn"
                  onClick={() => navigate('/journal')}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="home-journeys-pagination">
            <button className="home-pagination-arrow">←</button>
            <button className="home-pagination-dot">1</button>
            <button className="home-pagination-dot home-pagination-active">2</button>
            <button className="home-pagination-dot">3</button>
            <button className="home-pagination-arrow">→</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
