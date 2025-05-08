import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TherapyPage.css";

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
  const [audioSrc, setAudioSrc] = useState(null);
  const [message, setMessage] = useState("");
  const [currentView, setCurrentView] = useState("main"); // main, additional, mood
  const [binauralPlaying, setBinauralPlaying] = useState(false);
  const [selectedBinauralBeat, setSelectedBinauralBeat] = useState("Alpha Waves (8-12 Hz)");
  const [breathingActive, setBreathingActive] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);
  const [selectedAdditionalAudio, setSelectedAdditionalAudio] = useState(null);
  const [additionalAudioPlaying, setAdditionalAudioPlaying] = useState(false);

  const audioRef = useRef(null);
  const binauralRef = useRef(null);
  const additionalAudioRef = useRef(null);

  useEffect(() => {
    if (state?.level) {
      const src = audioMap[state.level];
      setAudioSrc(src);
      setMessage(messages[state.level]);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Create new audio with error handling
      audioRef.current = new Audio(src);
      audioRef.current.loop = true;
      
      // Add event listeners for debugging
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        alert(`Error loading audio for ${state.level}. Please check if the file exists at ${src}`);
      });
    }
    
    return () => {
      stopAllAudio();
    };
    // eslint-disable-next-line
  }, [state]);

  const stopAllAudio = () => {
    if (audioRef.current) audioRef.current.pause();
    if (binauralRef.current) {
      binauralRef.current.pause();
      setBinauralPlaying(false);
    }
    if (additionalAudioRef.current) {
      additionalAudioRef.current.pause();
      setAdditionalAudioPlaying(false);
      setSelectedAdditionalAudio(null);
    }
  };

  // --- MAIN VIEW ---
  const renderMainView = () => (
    <div className="therapy-main animate-fadeIn">
      <h2 className="therapy-title">Therapy Session</h2>
      <div className="therapy-info">
        <p><strong>Anxiety Level:</strong> {state?.level}</p>
        <p><strong>Recommended frequency:</strong> {recommendedFrequency[state?.level]}</p>
      </div>
      <div className="therapy-message">
        <p>{message}</p>
      </div>
      <div className="section-card" style={{textAlign: "center"}}>
        <button 
          className="button" 
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.play()
                .then(() => {
                  console.log("Playing recommended audio successfully");
                })
                .catch(error => {
                  console.error("Error playing recommended audio:", error);
                  alert("Could not play the recommended audio. Please check if the audio file exists.");
                });
            }
          }}
        >
          ▶️ Play Recommended Audio
        </button>
        <button 
          className="button" 
          onClick={() => audioRef.current && audioRef.current.pause()} 
          style={{marginLeft: "1rem"}}
        >
          ⏸️ Pause
        </button>
        <button 
          className="button stop-button" 
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }} 
          style={{marginLeft: "1rem"}}
        >
          ⏹️ Stop
        </button>
      </div>
      <div className="button-group">
        <button className="button primary-button" onClick={() => setCurrentView("additional")}>
          Additional Options
        </button>
        <button className="button secondary-button" onClick={() => setCurrentView("mood")}>
          Mood Tracker
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
            if (binauralRef.current) binauralRef.current.pause();
            binauralRef.current = new Audio(binauralBeatsMap[selectedBinauralBeat]);
            binauralRef.current.loop = true;
            
            // Add error handling for binaural beats playback
            binauralRef.current.play()
              .then(() => {
                setBinauralPlaying(true);
                console.log(`Playing ${selectedBinauralBeat} successfully`);
              })
              .catch(error => {
                console.error(`Error playing ${selectedBinauralBeat}:`, error);
                alert(`Could not play ${selectedBinauralBeat}. Please check if the audio file exists.`);
              });
          } else {
            if (binauralRef.current) binauralRef.current.pause();
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
                if (additionalAudioRef.current) additionalAudioRef.current.pause();
                
                // If clicking the same button that's already playing, stop it
                if (selectedAdditionalAudio === audio && additionalAudioPlaying) {
                  setSelectedAdditionalAudio(null);
                  setAdditionalAudioPlaying(false);
                  return;
                }
                
                // Otherwise play the selected audio
                setSelectedAdditionalAudio(audio);
                additionalAudioRef.current = new Audio(additionalAudios[audio]);
                additionalAudioRef.current.loop = true;
                
                // Add error handling for audio playback
                additionalAudioRef.current.play()
                  .then(() => {
                    setAdditionalAudioPlaying(true);
                    console.log(`Playing ${audio} successfully`);
                  })
                  .catch(error => {
                    console.error(`Error playing ${audio}:`, error);
                    alert(`Could not play ${audio}. Please check if the audio file exists.`);
                    setSelectedAdditionalAudio(null);
                  });
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
              if (additionalAudioRef.current) {
                additionalAudioRef.current.pause();
                setAdditionalAudioPlaying(false);
                setSelectedAdditionalAudio(null);
              }
            }}
            style={{marginTop: "1rem"}}
          >
            ⏹️ Stop {selectedAdditionalAudio}
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
      <button
        className="button mood-submit"
        onClick={() => setCurrentView("main")}
        disabled={!currentMood}
        style={{marginTop: "1rem"}}
      >
        Submit Mood
      </button>
      <div className="button-group">
        <button className="button" onClick={() => setCurrentView("main")}>
          Back to Main
        </button>
      </div>
    </div>
  );

  // --- MAIN RENDER ---
  return (
    <div className="therapy-page">
      <Navbar />
      <div className="therapy-container">
        {currentView === "main" && renderMainView()}
        {currentView === "additional" && renderAdditionalView()}
        {currentView === "mood" && renderMoodView()}
      </div>
      <Footer />
    </div>
  );
};

export default TherapyPage;
