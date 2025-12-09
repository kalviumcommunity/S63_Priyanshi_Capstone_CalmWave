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
              Therapy<br/>Session
            </h1>

            {/* Description */}
            <p className="therapy-hero-description">
              Experience Personalized Audio Therapy & Relaxation Techniques Designed For Your Mental Well-being.
            </p>

            {/* Stats Bar */}
            <div className="therapy-stats-bar">
              <div className="stat-group">
                <span className="stat-emoji">🎵</span>
                <span className="stat-label">Personalized Audio <strong>Therapy</strong></span>
              </div>
              <span className="stat-separator">/</span>
              <div className="stat-group">
                <span className="stat-emoji">⭐</span>
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
    <div className="therapy-additional animate-fadeIn">
      <h2 className="therapy-title">Additional Therapy Tools</h2>
      {/* Binaural Beats */}
      <div className="section-card">
        <div className="binaural-header">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ADFF2F" strokeWidth="2" className="binaural-music-icon">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <h3>🎵 Binaural Beats</h3>
        </div>
        <select
          value={selectedBinauralBeat}
          onChange={(e) => setSelectedBinauralBeat(e.target.value)}
          className="select-dropdown"
        >
          {Object.keys(binauralBeatsMap).map(beat => (
            <option key={beat} value={beat}>{beat}</option>
          ))}
        </select>
        <button className="button" style={{marginTop: "1rem"}} onClick={() => {
          if (!binauralPlaying) {
            // Use our audio context to play the binaural beats
            const audio = playAudio(binauralBeatsMap[selectedBinauralBeat], {
              loop: true,
              onPlay: () => {
                setBinauralPlaying(true);
                console.log(`Playing ${selectedBinauralBeat} successfully`);
              },
              onError: (error) => {
                console.error(`Error playing ${selectedBinauralBeat}:`, error);
                alert(`Could not play ${selectedBinauralBeat}. Please check if the audio file exists.`);
              }
            });
            
            // Store the audio element in our ref for later use
            binauralRef.current = {
              element: audio,
              name: selectedBinauralBeat
            };
          } else {
            if (binauralRef.current && binauralRef.current.element) {
              // Use our audio context to pause the audio
              pauseAudio(binauralRef.current.element, (audio) => {
                // Calculate session duration and save if played for at least 10 seconds
                const duration = getSessionDuration(audio);
                if (duration >= 10) {
                  saveSoundSession('Binaural', binauralRef.current.name, duration);
                }
              });
              
              // Clear the element reference
              binauralRef.current = null;
            }
            setBinauralPlaying(false);
          }
        }}>
          {binauralPlaying ? "Stop Binaural Beats" : "Play Binaural Beats"}
        </button>
      </div>
      {/* Breathing Exercise */}
      <div className="section-card breathing-exercise-card">
        <h3 className="breathing-title">
          Try a quick breathing <span className="breathing-italic">exercise</span><br />
          <span className="breathing-italic">to ease</span> your stress.
        </h3>
        <div className="breathing-center">
          <div className={`breathing-circle-container ${breathingActive ? 'breathing-active' : ''}`}>
            <div className="breathing-ring breathing-ring-1"></div>
            <div className="breathing-ring breathing-ring-2"></div>
            <div className="breathing-ring breathing-ring-3"></div>
            <div className="breathing-ring breathing-ring-4"></div>
            <div className="breathing-core">
              <span className="breathing-leaf">🌱</span>
            </div>
          </div>
        </div>
        <div className="breathing-controls">
          <div className="breathing-control">
            <span className="breathing-label">Click to</span>
            <button 
              className="breathing-start-btn" 
              onClick={() => {
                if (breathingActive) {
                  handleBreathingStop();
                } else {
                  handleBreathingStart();
                }
              }}
            >
              {breathingActive ? 'Stop' : 'Start'}
            </button>
          </div>
          <div className="breathing-control">
            <span className="breathing-label">Mins</span>
            <span className="breathing-value">{getBreathingMins(breathingTime)}</span>
          </div>
          <div className="breathing-control">
            <span className="breathing-label">Secs</span>
            <span className="breathing-value">{getBreathingSecs(breathingTime)}</span>
          </div>
        </div>
      </div>
      {/* Additional Music */}
      <div className="section-card">
        <h3>🎶 Additional Music</h3>
        <div className="audio-options">
          {Object.keys(additionalAudios).map(audio => (
            <button
              key={audio}
              className={`button ${selectedAdditionalAudio === audio ? 'active' : ''}`}
              onClick={() => {
                // If clicking the same button that's already playing, stop it
                if (selectedAdditionalAudio === audio && additionalAudioPlaying) {
                  if (additionalAudioRef.current && additionalAudioRef.current.element) {
                    // Use our audio context to pause the audio
                    pauseAudio(additionalAudioRef.current.element, (audioElement) => {
                      // Calculate session duration and save if played for at least 10 seconds
                      const duration = getSessionDuration(audioElement);
                      if (duration >= 10) {
                        saveSoundSession('Additional', selectedAdditionalAudio, duration);
                      }
                    });
                  }
                  
                  // Clear the state
                  setSelectedAdditionalAudio(null);
                  setAdditionalAudioPlaying(false);
                  additionalAudioRef.current = null;
                  return;
                }
                
                // Otherwise play the selected audio
                setSelectedAdditionalAudio(audio);
                
                // Use our audio context to play the audio
                const audioElement = playAudio(additionalAudios[audio], {
                  loop: true,
                  onPlay: () => {
                    setAdditionalAudioPlaying(true);
                    console.log(`Playing ${audio} successfully`);
                  },
                  onError: (error) => {
                    console.error(`Error playing ${audio}:`, error);
                    alert(`Could not play ${audio}. Please check if the audio file exists.`);
                    setSelectedAdditionalAudio(null);
                  }
                });
                
                // Store the audio element in our ref for later use
                additionalAudioRef.current = {
                  element: audioElement,
                  name: audio
                };
              }}
            >
              {audio}
            </button>
          ))}
        </div>
        
        {additionalAudioPlaying && (
          <button 
            className="button stop-button" 
            onClick={() => {
              if (additionalAudioRef.current && additionalAudioRef.current.element) {
                // Use our audio context to pause the audio
                pauseAudio(additionalAudioRef.current.element, (audioElement) => {
                  // Calculate session duration and save if played for at least 10 seconds
                  const duration = getSessionDuration(audioElement);
                  if (duration >= 10) {
                    saveSoundSession('Additional', selectedAdditionalAudio, duration);
                  }
                });
                
                // Clear the state
                setAdditionalAudioPlaying(false);
                setSelectedAdditionalAudio(null);
                additionalAudioRef.current = null;
              }
            }}
            style={{marginTop: "1rem"}}
          >
            ⏹ Stop {selectedAdditionalAudio}
          </button>
        )}
      </div>
      <div className="button-group">
        <button className="button" onClick={() => setCurrentView("main")}>
          Back to Main
        </button>
      </div>
    </div>
  );

  // --- MOOD TRACKER VIEW ---
  const renderMoodView = () => (
    <div className="mood-tracker animate-fadeIn">
      <h2 className="therapy-title">Mood Tracker</h2>
      
      {successMessage && (
        <div className="success-message" style={{ color: 'green', marginBottom: '1rem' }}>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <p>How are you feeling right now?</p>
      <div className="mood-buttons">
        {["Happy", "Neutral", "Sad", "Anxious", "Tired"].map(mood => (
          <button
            key={mood}
            className={`mood-button ${currentMood === mood ? "active" : ""}`}
            onClick={() => setCurrentMood(mood)}
          >
            {mood === "Happy" && "😊"}
            {mood === "Neutral" && "😐"}
            {mood === "Sad" && "😔"}
            {mood === "Anxious" && "😰"}
            {mood === "Tired" && "😴"}
            {" "}{mood}
          </button>
        ))}
      </div>
      
      <div style={{ marginTop: '1rem' }}>
  <label htmlFor="moodNote" style={{ display: 'block', marginBottom: '0.5rem' }}>
    ✏ Journal Entry (optional):
  </label>
  <textarea
    id="moodNote"
    rows={4}
    placeholder="Write about your feelings..."
    value={moodNote}
    onChange={(e) => setMoodNote(e.target.value)}
    style={{
      width: "100%",
      padding: "0.5rem",
      borderRadius: "8px",
      border: "1px solid #ccc"
    }}
  />
</div>

      
      <button
        className="button mood-submit"
        onClick={submitMoodData}
        disabled={!currentMood || isSubmitting}
        style={{marginTop: "1rem"}}
      >
        {isSubmitting ? "Saving..." : "Submit Mood"}
      </button>
      
      <div className="button-group">
        <button 
          className="button secondary-button" 
          onClick={() => {
            setCurrentView("history");
            fetchMoodHistory(); // Fetch updated mood history when navigating
          }}
          disabled={isSubmitting}
        >
          View Mood History
        </button>
        <button 
          className="button" 
          onClick={() => setCurrentView("main")}
          disabled={isSubmitting}
        >
          Back to Main
        </button>
      </div>
    </div>
  );
  
  // --- MOOD HISTORY VIEW ---
  const renderMoodHistoryView = () => {
    // Format dates for chart display
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    // Map mood values to numeric values for the chart
    const getMoodValue = (mood) => {
      const moodMap = {
        "Happy": 5,
        "Neutral": 3,
        "Sad": 1,
        "Anxious": 2,
        "Tired": 2
      };
      return moodMap[mood] || 3;
    };
    
    // Get emoji for mood
    const getMoodEmoji = (mood) => {
      const emojiMap = {
        "Happy": "😊",
        "Neutral": "😐",
        "Sad": "😔",
        "Anxious": "😰",
        "Tired": "😴"
      };
      return emojiMap[mood] || "";
    };
    
    // Prepare data for the line chart
    const chartData = {
      labels: moodHistory.slice(0, 10).reverse().map(entry => formatDate(entry.date)),
      datasets: [
        {
          label: 'Mood Trend',
          data: moodHistory.slice(0, 10).reverse().map(entry => getMoodValue(entry.mood)),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
    
    // Chart options
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const index = context.dataIndex;
              const reversedIndex = moodHistory.length - 1 - index;
              if (reversedIndex >= 0 && reversedIndex < moodHistory.length) {
                const entry = moodHistory[reversedIndex];
                return `${entry.mood} ${getMoodEmoji(entry.mood)}`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 6,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              if (value === 1) return "Sad 😔";
              if (value === 2) return "Low 😰";
              if (value === 3) return "Neutral 😐";
              if (value === 4) return "Good 🙂";
              if (value === 5) return "Happy 😊";
              return "";
            }
          }
        }
      }
    };
    
    return (
      <div className="mood-history animate-fadeIn">
        <h2 className="therapy-title">Mood History</h2>
        
        {historyError && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
            {historyError}
          </div>
        )}
        
        {isLoadingHistory ? (
          <div className="loading-indicator">
            <p>Loading your mood history...</p>
          </div>
        ) : moodHistory.length === 0 ? (
          <div className="empty-state">
            <p>You haven't recorded any moods yet. Start tracking your mood to see your history here!</p>
            <button 
              className="button" 
              onClick={() => setCurrentView("mood")}
              style={{marginTop: "1rem"}}
            >
              Record Your Mood
            </button>
          </div>
        ) : (
          <>
            <div className="section-card">
              <h3>Mood Trend</h3>
              <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
              </div>
              <p className="chart-description">
                This chart shows your mood trends over time. Higher values represent more positive moods.
              </p>
            </div>
            
            <div className="section-card">
              <h3>Recent Mood Entries</h3>
              <div className="mood-entries">
                {moodHistory.slice(0, 5).map((entry, index) => (
                  <div key={index} className="mood-entry">
                    <div className="mood-entry-header">
                      <span className="mood-emoji">{getMoodEmoji(entry.mood)}</span>
                      <span className="mood-name">{entry.mood}</span>
                      <span className="mood-date">
                        {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    {entry.note && (
                      <div className="mood-note">
                        <p>{entry.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="button-group">
              <button 
                className="button" 
                onClick={() => setCurrentView("mood")}
              >
                Record New Mood
              </button>
              <button 
                className="button" 
                onClick={() => setCurrentView("main")}
              >
                Back to Main
              </button>
            </div>
          </>
        )}
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
