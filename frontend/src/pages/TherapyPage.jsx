import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TherapyPage.css";
import therapyBgImage from '../assests/image2.png';


// Import Chart.js components
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
// Import audio context
import { playAudio, pauseAudio, stopAllAudio, getSessionDuration } from "../utils/audioContext";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const audioMap = {
  "Minimal Anxiety": "/audios/minimal.mp3",
  "Mild Anxiety": "/audios/mild.mp3",
  "Moderate Anxiety": "/audios/moderate.mp3",
  "Severe Anxiety": "/audios/severe.mp3",
};

const additionalAudios = {
  "Nature Sounds": "/audios/nature.mp3",
  "Meditation Music": "/audios/meditation.mp3",
  "Deep Focus": "/audios/focus.mp3",
  "Sleep Aid": "/audios/sleep.mp3",
};

const binauralBeatsMap = {
  "Alpha Waves (8-12 Hz)": "/audios/alpha-binaural.mp3",
  "Theta Waves (4-8 Hz)": "/audios/theta-binaural.mp3",
  "Delta Waves (0.5-4 Hz)": "/audios/delta-binaural.mp3",
  "Gamma Waves (30-100 Hz)": "/audios/gamma-binaural.mp3",
};

const TherapyPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("main"); // main, additional, mood, history
  const [binauralPlaying, setBinauralPlaying] = useState(false);
  const [selectedBinauralBeat, setSelectedBinauralBeat] = useState("Alpha Waves (8-12 Hz)");
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingTime, setBreathingTime] = useState(299); // 4 min 59 sec
  const [currentMood, setCurrentMood] = useState(null);
  const [moodNote, setMoodNote] = useState("");
  const [selectedAdditionalAudio, setSelectedAdditionalAudio] = useState(null);
  const [additionalAudioPlaying, setAdditionalAudioPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);



  const audioRef = useRef(null);
  const binauralRef = useRef(null);
  const additionalAudioRef = useRef(null);


  // Effect for initialization and cleanup
  useEffect(() => {
    console.log('TherapyPage mounted');

    if (state?.level) {
      const src = audioMap[state.level];
      
      // We don't automatically play the audio, but we prepare the reference
      // The audio will be played when the user clicks the play button
      audioRef.current = {
        src: src,
        level: state.level
      };
    }
    
    // Clean up function - stop all audio when component unmounts
    return () => {
      console.log('TherapyPage unmounting - stopping all audio');
      handleStopAllAudio();
    };
  }, [state, navigate]);
  
  // Update progress bar continuously when playing
  useEffect(() => {
    let interval;
    if (isPlaying && audioRef.current?.element) {
      interval = setInterval(() => {
        const audio = audioRef.current.element;
        if (audio) {
          if (!duration && audio.duration) {
            setDuration(audio.duration);
          }
          // Debug log
          if (Math.floor(audio.currentTime) % 1 === 0) {
            console.log('Audio progress:', formatTime(audio.currentTime), '/', formatTime(audio.duration));
          }
        }
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);
  
  // Breathing exercise timer
  useEffect(() => {
    let interval;
    if (breathingActive && breathingTime > 0) {
      interval = setInterval(() => {
        setBreathingTime((prev) => prev - 1);
      }, 1000);
    } else if (breathingTime === 0 && breathingActive) {
      setBreathingActive(false);
      setBreathingTime(299);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [breathingActive, breathingTime]);
  
  // Fetch mood history when the history view is shown
  useEffect(() => {
    if (currentView === 'history') {
      fetchMoodHistory();
    }
  }, [currentView]);
  
  // Function to fetch mood history data
  const fetchMoodHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    
    try {
      // Get mood logs from local storage (no backend required)
      const localMoods = JSON.parse(localStorage.getItem('moodLogs') || '[]');
      const sortedMoods = localMoods.sort((a, b) => new Date(b.date) - new Date(a.date));
      setMoodHistory(sortedMoods);
      
    } catch (err) {
      console.error('Error fetching mood history:', err);
      setHistoryError('Failed to load your mood history. Please try again.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Function to submit mood data to local storage
  const submitMoodData = async () => {
    if (!currentMood) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create mood log data
      const moodData = {
        id: Date.now(), // Use timestamp as unique ID
        mood: currentMood,
        note: moodNote,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Save to local storage
      const existing = JSON.parse(localStorage.getItem('moodLogs') || '[]');
      existing.push(moodData);
      localStorage.setItem('moodLogs', JSON.stringify(existing));
      
      console.log('Mood log saved locally');
      setSuccessMessage('Your mood has been recorded!');
      
      // Just show success message without auto-redirecting
      setTimeout(() => {
        setSuccessMessage("Your mood has been recorded! You can view your mood history or return to the main page.");
      }, 2000);
      
    } catch (err) {
      console.error('Error saving mood log:', err);
      setError('Failed to save your mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to save a sound session to local storage
  const saveSoundSession = async (sessionType, audioName, duration) => {
    console.log(`Attempting to save sound session: ${sessionType}, ${audioName}, ${duration}s`);
    
    try {
      const sessionData = {
        id: Date.now(), // Use timestamp as unique ID
        sessionType,
        audioName,
        duration, // in seconds
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Save to local storage
      const existing = JSON.parse(localStorage.getItem('soundSessions') || '[]');
      existing.push(sessionData);
      localStorage.setItem('soundSessions', JSON.stringify(existing));
      
      console.log('Sound session saved locally');
      
    } catch (err) {
      console.error('Error saving sound session:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
    }
  };
  
  const handleStopAllAudio = () => {
    // Use our global audio context to stop all audio
    stopAllAudio();
    
    // Reset all state
    if (audioRef.current && audioRef.current.element) {
      audioRef.current.element = null;
    }
    
    if (binauralRef.current) {
      binauralRef.current = null;
      setBinauralPlaying(false);
    }
    
    if (additionalAudioRef.current) {
      additionalAudioRef.current = null;
      setAdditionalAudioPlaying(false);
      setSelectedAdditionalAudio(null);
    }
    
    console.log('All audio stopped and state reset in TherapyPage');
  };

  // Format time in mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathingMins = (seconds) => {
    return Math.floor(seconds / 60).toString().padStart(2, '0');
  };

  const getBreathingSecs = (seconds) => {
    return (seconds % 60).toString().padStart(2, '0');
  };

  const handleBreathingStart = () => {
    setBreathingTime(299);
    setBreathingActive(true);
  };

  const handleBreathingStop = () => {
    setBreathingActive(false);
    setBreathingTime(299);
  };

  // --- MAIN VIEW ---
  const renderMainView = () => (
    <div className="therapy-page-fullscreen" style={{ backgroundImage: `url(${therapyBgImage})` }}>
      {/* Hero Section */}
      <div className="therapy-hero-section-full">
        <div className="therapy-content-grid">
          
          {/* Left Content */}
          <div className="therapy-content-left">
            {/* Top Badge */}
            <div className="therapy-badge">
              <div className="badge-icon">🧘</div>
              <div className="badge-content">
                <div className="badge-title">Your Wellness Journey</div>
                <div className="badge-link">Find Your Peace</div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="therapy-hero-heading">
              𝐓𝐡𝐞𝐫𝐚𝐩𝐲 𝐒𝐞𝐬𝐬𝐢𝐨𝐧<br/>
            </h1>

            {/* Description */}
            <p className="therapy-hero-description">
              Experience Personalized Audio Therapy & Relaxation Techniques Designed For Your Mental Well-being.
            </p>

            {/* Stats Bar */}
            <div className="therapy-stats-bar">
              <div className="stat-group">
                <span className="stat-emoji"></span>
                <span className="stat-label">Personalized Audio <strong>Therapy</strong></span>
              </div>
              <span className="stat-separator">/</span>
              <div className="stat-group">
                <span className="stat-emoji"></span>
                <span className="stat-label"><strong>Proven</strong> Techniques</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="therapy-hero-buttons">
              <button 
                className="therapy-btn-primary"
                onClick={() => {
                  if (isPlaying) {
                    audioRef.current?.element?.pause();
                    setIsPlaying(false);
                  } else {
                    if (audioRef.current?.element) {
                      audioRef.current.element.play();
                      setIsPlaying(true);
                    } else if (audioRef.current?.src) {
                      const audio = playAudio(audioRef.current.src, {
                        loop: true,
                        onPlay: () => {
                          setIsPlaying(true);
                          if (audio.duration) setDuration(audio.duration);
                        },
                        onError: () => alert("Could not play audio")
                      });
                      audioRef.current.element = audio;
                      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
                    }
                  }
                }}
                disabled={!state?.level}
              >
                {isPlaying ? 'Pause Therapy' : 'Start Therapy'} — {state?.level ? 'Ready' : "Take Quiz"}
              </button>
              
              <button 
                className="therapy-btn-secondary"
                onClick={() => navigate('/quiz')}
              >
                {state?.level ? 'Retake Assessment' : 'Take Quiz'}
              </button>
            </div>
          </div>

          {/* Right Content - Floating Elements */}
          <div className="therapy-content-right">
          </div>

        </div>
      </div>

      {/* Listening Instructions */}
      <div className="therapy-instructions-section">
        <p className="therapy-instructions-text">
          🎧 Find a quiet environment • Close your eyes • Be in the moment • Let the sounds guide you
        </p>
      </div>

      {/* Audio Section */}
      <div className="therapy-audio-full">
        <div className="audio-content-wrapper">
          
          {/* Glassmorphic Audio Player Card */}
          <div className="glass-audio-card">
            {/* Bottom Control Bar Only */}
            <div className="glass-bottom-controls">
              <button className="glass-btn-skip" disabled={!state?.level}>
                <span>⏮</span>
              </button>
              
              <button 
                className="glass-btn-pause"
                onClick={() => {
                  if (isPlaying) {
                    audioRef.current?.element?.pause();
                    setIsPlaying(false);
                  } else {
                    if (audioRef.current?.element) {
                      audioRef.current.element.play();
                      setIsPlaying(true);
                    } else if (audioRef.current?.src) {
                      const audio = playAudio(audioRef.current.src, {
                        loop: true,
                        onPlay: () => {
                          setIsPlaying(true);
                          if (audio.duration) setDuration(audio.duration);
                        },
                        onError: () => alert("Could not play audio")
                      });
                      audioRef.current.element = audio;
                      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
                    }
                  }
                }}
                disabled={!state?.level}
              >
                <span>{isPlaying ? '⏸' : '▶'}</span>
              </button>
              
              <button className="glass-btn-skip" disabled={!state?.level}>
                <span>⏭</span>
              </button>

              {/* Track Info Section */}
              <div className="glass-track-section">
                <div className="glass-logo-box">
                  <span className="logo-text">GIVE<br/>TIME</span>
                </div>
                <div className="glass-track-text">
                  <div className="track-name">{state?.level ? `${state.level} Therapy` : 'Therapy Session'}</div>
                  <div className="track-subtitle">Audiobook • CalmWave</div>
                </div>
              </div>

              <button className="glass-btn-action" disabled={!state?.level}>
                <span>⏭</span>
              </button>
              
              <button className="glass-btn-action" disabled={!state?.level}>
                <span>⋯</span>
              </button>
              
              <button className="glass-btn-action" disabled={!state?.level}>
                <span>🔗</span>
              </button>
              
              <button className="glass-btn-action" disabled={!state?.level}>
                <span>☰</span>
              </button>
              
              <button className="glass-btn-action" disabled={!state?.level}>
                <span>🔊</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Cards */}
      <div className="therapy-cards-section">
        <div className="cards-grid">
          
          <div className="bottom-card" onClick={() => setCurrentView("additional")}>
            <div className="card-emoji">🎵</div>
            <h3>Additional Sounds</h3>
            <p>Explore binaural beats, nature sounds, and meditation music</p>
          </div>

          <div className="bottom-card" onClick={() => setCurrentView("mood")}>
            <div className="card-emoji">📝</div>
            <h3>Mood Tracking</h3>
            <p>Log and monitor your daily emotional wellness journey</p>
          </div>

          <div className="bottom-card" onClick={() => setCurrentView("history")}>
            <div className="card-emoji">📊</div>
            <h3>Progress History</h3>
            <p>View detailed mood trends and therapy session history</p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="therapy-footer">
        <div className="footer-content">
          <div className="footer-text">Trusted by wellness communities worldwide</div>
        </div>
      </div>

    </div>
  );

  // --- ADDITIONAL OPTIONS VIEW ---
  const renderAdditionalView = () => (
    <div className="add-page">

      {/* Animated ambient background particles */}
      <div className="add-bg-particles" aria-hidden="true">
        {[...Array(14)].map((_, i) => (
          <span key={i} className="add-particle" style={{ '--i': i }} />
        ))}
      </div>

      {/* Floating gradient orbs */}
      <div className="add-orb add-orb-1" aria-hidden="true" />
      <div className="add-orb add-orb-2" aria-hidden="true" />
      <div className="add-orb add-orb-3" aria-hidden="true" />

      {/* ── Page Header ── */}
      <div className="add-header">
        <div className="add-header-eyebrow">
          <span className="add-eyebrow-dot" />
          Therapy Tools
        </div>
        <h2 className="add-title">Additional Options</h2>
        <p className="add-subtitle">Curated soundscapes & breathing techniques for your inner calm</p>
      </div>

      {/* ── Grid of Cards ── */}
      <div className="add-cards-grid">

        {/* ── Card 1: Binaural Beats ── */}
        <div className="add-card add-card--binaural">
          <div className="add-card-shine" aria-hidden="true" />
          <div className="add-card-top">
            <div className="add-card-icon-wrap add-card-icon-wrap--lime">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <div className="add-card-heading-group">
              <h3 className="add-card-title">Binaural Beats</h3>
              <p className="add-card-desc">Synchronise your brainwaves with precise frequencies</p>
            </div>
          </div>

          {/* Frequency visualizer */}
          <div className="add-freq-visualizer" aria-hidden="true">
            {[...Array(18)].map((_, i) => (
              <span
                key={i}
                className={`add-freq-bar ${binauralPlaying ? 'add-freq-bar--live' : ''}`}
                style={{ '--i': i, '--base-h': `${8 + Math.abs(Math.sin(i * 0.65)) * 28}px` }}
              />
            ))}
          </div>

          <select
            value={selectedBinauralBeat}
            onChange={(e) => setSelectedBinauralBeat(e.target.value)}
            className="add-select"
          >
            {Object.keys(binauralBeatsMap).map(beat => (
              <option key={beat} value={beat}>{beat}</option>
            ))}
          </select>

          <button
            className={`add-btn add-btn--primary ${binauralPlaying ? 'add-btn--active' : ''}`}
            onClick={() => {
              if (!binauralPlaying) {
                const audio = playAudio(binauralBeatsMap[selectedBinauralBeat], {
                  loop: true,
                  onPlay: () => { setBinauralPlaying(true); },
                  onError: () => alert(`Could not play ${selectedBinauralBeat}. Please check if the audio file exists.`)
                });
                binauralRef.current = { element: audio, name: selectedBinauralBeat };
              } else {
                if (binauralRef.current && binauralRef.current.element) {
                  pauseAudio(binauralRef.current.element, (audio) => {
                    const dur = getSessionDuration(audio);
                    if (dur >= 10) saveSoundSession('Binaural', binauralRef.current.name, dur);
                  });
                  binauralRef.current = null;
                }
                setBinauralPlaying(false);
              }
            }}
          >
            <span className="add-btn-icon">{binauralPlaying ? '⏸' : '▶'}</span>
            {binauralPlaying ? 'Stop Binaural Beats' : 'Play Binaural Beats'}
            {binauralPlaying && <span className="add-btn-pulse" aria-hidden="true" />}
          </button>
        </div>

        {/* ── Card 2: Breathing Exercise ── */}
        <div className="add-card add-card--breathing">
          <div className="add-card-shine" aria-hidden="true" />
          <div className="add-card-top">
            <div className="add-card-icon-wrap add-card-icon-wrap--soft">
              🫁
            </div>
            <div className="add-card-heading-group">
              <h3 className="add-card-title">
                Breathing Exercise
                <span className="add-coming-tag">Coming Soon</span>
              </h3>
              <p className="add-card-desc">4-7-8 guided breath to dissolve stress</p>
            </div>
          </div>

          {/* Layered breathing orb */}
          <div className="add-breath-scene">
            <div className={`add-breath-orb-wrap ${breathingActive ? 'add-breath-orb-wrap--active' : ''}`}>
              <div className="add-breath-ring add-breath-ring--1" />
              <div className="add-breath-ring add-breath-ring--2" />
              <div className="add-breath-ring add-breath-ring--3" />
              <div className="add-breath-ring add-breath-ring--4" />
              <div className="add-breath-core">
                <span className="add-breath-emoji">🌱</span>
              </div>
              {breathingActive && (
                <div className="add-breath-phase-label">
                  {breathingTime % 19 < 4 ? 'Inhale' : breathingTime % 19 < 11 ? 'Hold' : 'Exhale'}
                </div>
              )}
            </div>
          </div>

          {/* Timer + controls */}
          <div className="add-breath-controls">
            <div className="add-breath-stat">
              <span className="add-breath-stat-num">{getBreathingMins(breathingTime)}</span>
              <span className="add-breath-stat-lbl">min</span>
            </div>

            <button
              className={`add-btn add-btn--breath ${breathingActive ? 'add-btn--breath-stop' : ''}`}
              onClick={() => breathingActive ? handleBreathingStop() : handleBreathingStart()}
            >
              {breathingActive ? '⏹ Stop' : '▶ Start'}
            </button>

            <div className="add-breath-stat">
              <span className="add-breath-stat-num">{getBreathingSecs(breathingTime)}</span>
              <span className="add-breath-stat-lbl">sec</span>
            </div>
          </div>

          <p className="add-breath-note">🔇 Audio guide coming soon — timer works now</p>
        </div>

        {/* ── Card 3: Additional Music ── */}
        <div className="add-card add-card--music">
          <div className="add-card-shine" aria-hidden="true" />
          <div className="add-card-top">
            <div className="add-card-icon-wrap add-card-icon-wrap--lime">
              🎶
            </div>
            <div className="add-card-heading-group">
              <h3 className="add-card-title">Additional Music</h3>
              <p className="add-card-desc">Ambient soundscapes for every state of mind</p>
            </div>
          </div>

          <div className="add-music-grid">
            {Object.keys(additionalAudios).map((audio, idx) => {
              const icons = ['🌿', '🧘', '🎯', '🌙'];
              const isPlaying = selectedAdditionalAudio === audio && additionalAudioPlaying;
              return (
                <button
                  key={audio}
                  className={`add-music-chip ${selectedAdditionalAudio === audio ? 'add-music-chip--selected' : ''} ${isPlaying ? 'add-music-chip--playing' : ''}`}
                  onClick={() => {
                    if (selectedAdditionalAudio === audio && additionalAudioPlaying) {
                      if (additionalAudioRef.current && additionalAudioRef.current.element) {
                        pauseAudio(additionalAudioRef.current.element, (el) => {
                          const dur = getSessionDuration(el);
                          if (dur >= 10) saveSoundSession('Additional', selectedAdditionalAudio, dur);
                        });
                      }
                      setSelectedAdditionalAudio(null);
                      setAdditionalAudioPlaying(false);
                      additionalAudioRef.current = null;
                      return;
                    }
                    setSelectedAdditionalAudio(audio);
                    const el = playAudio(additionalAudios[audio], {
                      loop: true,
                      onPlay: () => { setAdditionalAudioPlaying(true); },
                      onError: () => { alert(`Could not play ${audio}. Please check if the audio file exists.`); setSelectedAdditionalAudio(null); }
                    });
                    additionalAudioRef.current = { element: el, name: audio };
                  }}
                >
                  <span className="add-music-chip-icon">{icons[idx]}</span>
                  <span className="add-music-chip-label">{audio}</span>
                  {isPlaying && (
                    <span className="add-music-chip-wave" aria-hidden="true">
                      <span /><span /><span />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {additionalAudioPlaying && (
            <button
              className="add-btn add-btn--stop"
              style={{ marginTop: '1.4rem' }}
              onClick={() => {
                if (additionalAudioRef.current && additionalAudioRef.current.element) {
                  pauseAudio(additionalAudioRef.current.element, (el) => {
                    const dur = getSessionDuration(el);
                    if (dur >= 10) saveSoundSession('Additional', selectedAdditionalAudio, dur);
                  });
                  setAdditionalAudioPlaying(false);
                  setSelectedAdditionalAudio(null);
                  additionalAudioRef.current = null;
                }
              }}
            >
              ⏹ Stop {selectedAdditionalAudio}
            </button>
          )}
        </div>

      </div>{/* /add-cards-grid */}

      {/* ── Back Button ── */}
      <div className="add-footer">
        <button className="add-btn add-btn--back" onClick={() => setCurrentView('main')}>
          <span>←</span> Back to Main
        </button>
      </div>

    </div>
  );

  // --- MOOD TRACKER VIEW ---
  const moodData = [
    { key: "Happy",   emoji: "😊", label: "Happy",   color: "#ADFF2F", desc: "Feeling great today!" },
    { key: "Neutral", emoji: "😐", label: "Neutral",  color: "#7dd3fc", desc: "Just going with the flow" },
    { key: "Sad",     emoji: "😔", label: "Sad",      color: "#a78bfa", desc: "It's okay to feel this way" },
    { key: "Anxious", emoji: "😰", label: "Anxious",  color: "#fb923c", desc: "Breathe — you got this" },
    { key: "Tired",   emoji: "😴", label: "Tired",    color: "#94a3b8", desc: "Rest is productive too" },
  ];

  const renderMoodView = () => (
    <div className="mt-page">

      {/* Ambient orbs */}
      <div className="mt-orb mt-orb-1" aria-hidden="true" />
      <div className="mt-orb mt-orb-2" aria-hidden="true" />

      {/* Floating particles */}
      <div className="mt-particles" aria-hidden="true">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="mt-particle" style={{ '--i': i }} />
        ))}
      </div>

      {/* ── Header ── */}
      <div className="mt-header">
        <div className="mt-eyebrow">
          <span className="mt-eyebrow-dot" />
          Wellness Check-in
        </div>
        <h2 className="mt-title">Mood Tracker</h2>
        <p className="mt-subtitle">A moment of honest reflection for your mental well-being</p>
      </div>

      {/* ── Main Panel ── */}
      <div className="mt-panel">
        <div className="mt-panel-shine" aria-hidden="true" />

        {/* Success / Error banners */}
        {successMessage && (
          <div className="mt-banner mt-banner--success">
            <span className="mt-banner-icon">✓</span>
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mt-banner mt-banner--error">
            <span className="mt-banner-icon">!</span>
            {error}
          </div>
        )}

        {/* ── Prompt ── */}
        <div className="mt-prompt">
          <span className="mt-prompt-line" />
          <span className="mt-prompt-text">How are you feeling right now?</span>
          <span className="mt-prompt-line" />
        </div>

        {/* ── Mood Cards ── */}
        <div className="mt-mood-grid">
          {moodData.map(({ key, emoji, label, color, desc }) => (
            <button
              key={key}
              className={`mt-mood-card ${currentMood === key ? 'mt-mood-card--active' : ''}`}
              style={{ '--mood-color': color }}
              onClick={() => setCurrentMood(key)}
            >
              <div className="mt-mood-card-glow" aria-hidden="true" />
              <span className="mt-mood-emoji">{emoji}</span>
              <span className="mt-mood-label">{label}</span>
              <span className="mt-mood-desc">{desc}</span>
              {currentMood === key && <span className="mt-mood-check">✓</span>}
            </button>
          ))}
        </div>

        {/* ── Selected mood confirmation ── */}
        {currentMood && (
          <div className="mt-selected-banner">
            <span>{moodData.find(m => m.key === currentMood)?.emoji}</span>
            <span>You feel <strong>{currentMood}</strong> — that's valid.</span>
          </div>
        )}

        {/* ── Journal entry ── */}
        <div className="mt-journal">
          <label htmlFor="moodNote" className="mt-journal-label">
            <span className="mt-journal-icon">✍️</span>
            Journal Entry <span className="mt-optional">(optional)</span>
          </label>
          <textarea
            id="moodNote"
            className="mt-textarea"
            rows={4}
            placeholder="Write freely about your feelings, your day, your thoughts…"
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
          />
        </div>

        {/* ── Submit ── */}
        <button
          className={`mt-submit-btn ${!currentMood || isSubmitting ? 'mt-submit-btn--disabled' : ''}`}
          onClick={submitMoodData}
          disabled={!currentMood || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mt-spinner" aria-hidden="true" />
              Saving…
            </>
          ) : (
            <>
              <span>✦</span>
              Record My Mood
            </>
          )}
        </button>

        {/* ── Nav buttons ── */}
        <div className="mt-nav-row">
          <button
            className="mt-nav-btn mt-nav-btn--secondary"
            onClick={() => { setCurrentView('history'); fetchMoodHistory(); }}
            disabled={isSubmitting}
          >
            📊 View History
          </button>
          <button
            className="mt-nav-btn mt-nav-btn--ghost"
            onClick={() => setCurrentView('main')}
            disabled={isSubmitting}
          >
            ← Back to Main
          </button>
        </div>

      </div>{/* /mt-panel */}
    </div>
  );
  
  // --- MOOD HISTORY VIEW ---
  const renderMoodHistoryView = () => {
    const moodColorMap = {
      "Happy":   "#ADFF2F",
      "Neutral": "#7dd3fc",
      "Sad":     "#a78bfa",
      "Anxious": "#fb923c",
      "Tired":   "#94a3b8",
    };
    const moodEmojiMap = {
      "Happy": "😊", "Neutral": "😐", "Sad": "😔", "Anxious": "😰", "Tired": "😴"
    };
    const getMoodValue = (mood) => ({ Happy:5, Neutral:3, Sad:1, Anxious:2, Tired:2 }[mood] || 3);
    const formatDate = (ds) => { const d = new Date(ds); return `${d.getMonth()+1}/${d.getDate()}`; };

    // Summary stats
    const total = moodHistory.length;
    const moodCounts = moodHistory.reduce((acc, e) => { acc[e.mood] = (acc[e.mood]||0)+1; return acc; }, {});
    const topMood = Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—';
    const avgVal = total > 0
      ? (moodHistory.reduce((s,e) => s + getMoodValue(e.mood), 0) / total).toFixed(1)
      : 0;
    const avgLabel = avgVal >= 4.5 ? 'Happy' : avgVal >= 3.5 ? 'Good' : avgVal >= 2.5 ? 'Neutral' : avgVal >= 1.5 ? 'Low' : 'Sad';

    // Themed chart data
    const chartData = {
      labels: moodHistory.slice(0,10).reverse().map(e => formatDate(e.date)),
      datasets: [{
        label: 'Mood Score',
        data: moodHistory.slice(0,10).reverse().map(e => getMoodValue(e.mood)),
        borderColor: '#ADFF2F',
        backgroundColor: 'rgba(173,255,47,0.08)',
        pointBackgroundColor: '#ADFF2F',
        pointBorderColor: '#0B2724',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.45,
        fill: true,
        borderWidth: 2,
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11,39,36,0.95)',
          borderColor: 'rgba(173,255,47,0.3)',
          borderWidth: 1,
          titleColor: '#ADFF2F',
          bodyColor: '#F1F4EE',
          callbacks: {
            label: (ctx) => {
              const idx = moodHistory.length - 1 - ctx.dataIndex;
              const entry = moodHistory[idx];
              return entry ? ` ${entry.mood} ${moodEmojiMap[entry.mood] || ''}` : '';
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: 'rgba(241,244,238,0.4)', font: { size: 11 } }
        },
        y: {
          min: 0, max: 6,
          grid: { color: 'rgba(173,255,47,0.07)' },
          ticks: {
            color: 'rgba(241,244,238,0.4)', font: { size: 11 },
            stepSize: 1,
            callback: (v) => ({ 1:'Sad',2:'Low',3:'Neutral',4:'Good',5:'Happy' }[v] || '')
          }
        }
      }
    };

    return (
      <div className="mh-page">

        {/* Ambient orbs */}
        <div className="mh-orb mh-orb-1" aria-hidden="true" />
        <div className="mh-orb mh-orb-2" aria-hidden="true" />

        {/* Particles */}
        <div className="mh-particles" aria-hidden="true">
          {[...Array(10)].map((_,i) => (
            <span key={i} className="mh-particle" style={{ '--i': i }} />
          ))}
        </div>

        {/* ── Header ── */}
        <div className="mh-header">
          <div className="mh-eyebrow">
            <span className="mh-eyebrow-dot" />
            Your Journey
          </div>
          <h2 className="mh-title">Mood History</h2>
          <p className="mh-subtitle">A record of your emotional wellness over time</p>
        </div>

        {/* ── Body ── */}
        <div className="mh-body">

          {/* Error */}
          {historyError && (
            <div className="mh-banner mh-banner--error">
              <span className="mh-banner-icon">!</span>
              {historyError}
            </div>
          )}

          {/* Loading */}
          {isLoadingHistory ? (
            <div className="mh-loading">
              <div className="mh-spinner" />
              <p>Loading your mood history…</p>
            </div>
          ) : moodHistory.length === 0 ? (

            /* Empty state */
            <div className="mh-empty">
              <div className="mh-empty-icon">📋</div>
              <h3 className="mh-empty-title">No entries yet</h3>
              <p className="mh-empty-desc">Start tracking your mood to see your history here. Your first entry is just a tap away.</p>
              <button className="mh-cta-btn" onClick={() => setCurrentView('mood')}>
                ✦ Record Your First Mood
              </button>
            </div>

          ) : (<>

            {/* ── Stat Summary Row ── */}
            <div className="mh-stats-row">
              <div className="mh-stat-card" style={{ '--stat-color': '#ADFF2F' }}>
                <div className="mh-stat-card-glow" />
                <span className="mh-stat-value">{total}</span>
                <span className="mh-stat-label">Total Entries</span>
              </div>
              <div className="mh-stat-card" style={{ '--stat-color': moodColorMap[topMood] || '#ADFF2F' }}>
                <div className="mh-stat-card-glow" />
                <span className="mh-stat-value">{moodEmojiMap[topMood] || '—'}</span>
                <span className="mh-stat-label">Most Frequent</span>
                <span className="mh-stat-sub">{topMood}</span>
              </div>
              <div className="mh-stat-card" style={{ '--stat-color': '#7dd3fc' }}>
                <div className="mh-stat-card-glow" />
                <span className="mh-stat-value">{avgVal}</span>
                <span className="mh-stat-label">Avg Score</span>
                <span className="mh-stat-sub">{avgLabel}</span>
              </div>
            </div>

            {/* ── Chart Card ── */}
            <div className="mh-card">
              <div className="mh-card-shine" aria-hidden="true" />
              <div className="mh-card-header">
                <div className="mh-card-icon">📈</div>
                <div>
                  <h3 className="mh-card-title">Mood Trend</h3>
                  <p className="mh-card-desc">Last 10 entries — higher = more positive</p>
                </div>
              </div>
              <div className="mh-chart-wrap">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* ── Recent Entries Card ── */}
            <div className="mh-card">
              <div className="mh-card-shine" aria-hidden="true" />
              <div className="mh-card-header">
                <div className="mh-card-icon">🗒️</div>
                <div>
                  <h3 className="mh-card-title">Recent Entries</h3>
                  <p className="mh-card-desc">Your last {Math.min(5, moodHistory.length)} check-ins</p>
                </div>
              </div>
              <div className="mh-entries">
                {moodHistory.slice(0, 5).map((entry, i) => (
                  <div
                    key={i}
                    className="mh-entry"
                    style={{
                      '--entry-color': moodColorMap[entry.mood] || '#ADFF2F',
                      '--entry-delay': `${i * 0.07}s`
                    }}
                  >
                    <div className="mh-entry-left">
                      <span className="mh-entry-emoji">{moodEmojiMap[entry.mood] || '🙂'}</span>
                    </div>
                    <div className="mh-entry-body">
                      <div className="mh-entry-row">
                        <span className="mh-entry-mood">{entry.mood}</span>
                        <span className="mh-entry-date">
                          {new Date(entry.date).toLocaleDateString(undefined, { month:'short', day:'numeric' })}
                          {' · '}
                          {new Date(entry.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="mh-entry-note">"{entry.note}"</p>
                      )}
                    </div>
                    <div className="mh-entry-accent" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>

          </>)}

          {/* ── Nav buttons (always visible) ── */}
          <div className="mh-nav-row">
            <button className="mh-nav-btn mh-nav-btn--primary" onClick={() => setCurrentView('mood')}>
              ✦ Record New Mood
            </button>
            <button className="mh-nav-btn mh-nav-btn--ghost" onClick={() => setCurrentView('main')}>
              ← Back to Main
            </button>
          </div>

        </div>{/* /mh-body */}
      </div>
    );
  };


  // --- MAIN RENDER ---
  return (
    <div className="w-full min-h-screen">
      <Navbar />
      {currentView === "main" && renderMainView()}
      {currentView === "additional" && renderAdditionalView()}
      {currentView === "mood" && renderMoodView()}
      {currentView === "history" && renderMoodHistoryView()}
      <Footer />
    </div>
  );
};

export default TherapyPage;
