import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TherapyPage.css";
import quotes from "../utils/quotes"; // add this line


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

const messages = {
  "Minimal Anxiety": "You're doing great. Take a moment to relax and breathe with these calming sounds.",
  "Mild Anxiety": "Let's help your mind unwind with some gentle Indian rhythms.",
  "Moderate Anxiety": "You're not alone. These peaceful tones are here to help you rest your thoughts.",
  "Severe Anxiety": "You're safe now. Let the healing sounds guide your mind to calmness.",
};

const recommendedFrequency = {
  "Minimal Anxiety": "1-2 times per week",
  "Mild Anxiety": "2-3 times per week",
  "Moderate Anxiety": "3-4 times per week",
  "Severe Anxiety": "Daily sessions recommended",
};

const TherapyPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [currentView, setCurrentView] = useState("main"); // main, additional, mood, history
  const [binauralPlaying, setBinauralPlaying] = useState(false);
  const [selectedBinauralBeat, setSelectedBinauralBeat] = useState("Alpha Waves (8-12 Hz)");
  const [breathingActive, setBreathingActive] = useState(false);
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
  const [quote, setQuote] = useState("");



  const audioRef = useRef(null);
  const binauralRef = useRef(null);
  const additionalAudioRef = useRef(null);


  // Effect for initialization and cleanup
  useEffect(() => {
    console.log('TherapyPage mounted');

    if (state?.level) {
      const src = audioMap[state.level];
      setMessage(messages[state.level]);
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
      
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
  
  // Fetch mood history when the history view is shown
  useEffect(() => {
    if (currentView === 'history') {
      fetchMoodHistory();
    }
    // eslint-disable-next-line
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

  // --- MAIN VIEW ---
  const renderMainView = () => (

    <div className="therapy-main animate-fadeIn">
      <h2 className="therapy-title">Therapy Session</h2>
      {!state?.level && (
        <div className="notice-banner" style={{background:'#fff3cd', border:'1px solid #ffeeba', color:'#856404', padding:'0.75rem 1rem', borderRadius:'8px', margin:'0.5rem 0'}}>
          To get your personalized audio, please take the anxiety quiz first.
          <button className="button" style={{marginLeft:'0.75rem'}} onClick={() => navigate('/quiz')}>Take Quiz</button>
        </div>
      )}
      <div className="therapy-info">
        <p><strong>Anxiety Level:</strong> {state?.level || 'Not set'}</p>
        {state?.level && <p><strong>Relax & Listen</strong> {recommendedFrequency[state?.level]}</p>}
      </div>
      <div className="therapy-message">
        <p>{message}</p>
          <div className="daily-quote" style={{ marginTop: "1rem", fontStyle: "italic", color: "#444" }}>
    🧘 Relaxation Tip: “{quote}”

  </div>
      </div>
      <div className="section-card" style={{textAlign: "center"}}>
        <button 
          className="button" 
          onClick={() => {
            console.log("Play button clicked for recommended audio");
            if (audioRef.current) {
              // Use our audio context to play the audio
              const audio = playAudio(audioRef.current.src, {
                loop: true,
                onPlay: () => {
                  console.log("Playing recommended audio successfully");
                },
                onError: (error) => {
                  console.error("Error playing recommended audio:", error);
                  alert("Could not play the recommended audio. Please check if the audio file exists.");
                }
              });
              
              // Store the audio element in our ref for later use
              audioRef.current.element = audio;
            } else {
              console.log("audioRef.current is null or undefined");
            }
          }}
        >
          ▶ Play Recommended Audio
        </button>
        <button 
          className="button" 
          onClick={() => {
            console.log("Pause button clicked for recommended audio");
            if (audioRef.current && audioRef.current.element) {
              // Use our audio context to pause the audio
              pauseAudio(audioRef.current.element, (audio) => {
                console.log("Audio paused");
                
                // Calculate session duration and save if played for at least 10 seconds
                const duration = getSessionDuration(audio);
                console.log("Session duration:", duration, "seconds");
                
                if (duration >= 10) {
                  console.log("Duration >= 10 seconds, saving session");
                  saveSoundSession('Recommended', state?.level || 'Unknown', duration);
                } else {
                  console.log("Duration < 10 seconds, not saving session");
                }
              });
              
              // Clear the element reference
              audioRef.current.element = null;
            } else {
              console.log("No audio is currently playing");
            }
          }} 
          style={{marginLeft: "1rem"}}
        >
          ⏸ Pause
        </button>
        <button 
          className="button stop-button" 
          onClick={() => {
            if (audioRef.current && audioRef.current.element) {
              // Calculate session duration and save if played for at least 10 seconds
              const duration = getSessionDuration(audioRef.current.element);
              if (duration >= 10) {
                saveSoundSession('Recommended', state?.level || 'Unknown', duration);
              }
              
              // Use our audio context to stop the audio
              pauseAudio(audioRef.current.element);
              if (audioRef.current.element) {
                audioRef.current.element.currentTime = 0;
              }
              
              // Clear the element reference
              audioRef.current.element = null;
            }
          }} 
          style={{marginLeft: "1rem"}}
        >
          ⏹ Stop
        </button>
      </div>
      <div className="button-group">
        <button className="button primary-button" onClick={() => setCurrentView("additional")}>
          Additional Options
        </button>
        <button className="button secondary-button" onClick={() => setCurrentView("mood")}>
          Mood Tracker
        </button>
        <button className="button secondary-button" onClick={() => setCurrentView("history")}>
          Mood History
        </button>
      </div>
    </div>
  );

  // --- ADDITIONAL OPTIONS VIEW ---
  const renderAdditionalView = () => (
    <div className="therapy-additional animate-fadeIn">
      <h2 className="therapy-title">Additional Therapy Tools</h2>
      {/* Binaural Beats */}
      <div className="section-card">
        <h3>🎵 Binaural Beats</h3>
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
      <div className="section-card">
        <h3>🧘 Breathing Exercise</h3>
        {!breathingActive ? (
          <button className="button" onClick={() => setBreathingActive(true)}>
            Start Exercise
          </button>
        ) : (
          <>
            <div className="breathing-circle"></div>
            <button className="button" onClick={() => setBreathingActive(false)}>
              Stop Exercise
            </button>
          </>
        )}
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
    <div className="therapy-page">
      <Navbar />
      <div className="therapy-container">
        {currentView === "main" && renderMainView()}
        {currentView === "additional" && renderAdditionalView()}
        {currentView === "mood" && renderMoodView()}
        {currentView === "history" && renderMoodHistoryView()}
      </div>
      <Footer />
    </div>
  );
};

export default TherapyPage;
