import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/JournalPage.css';

const JournalPage = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    mood: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  const moodOptions = [
    { value: 'Happy', emoji: '😊', color: '#FFD700' },
    { value: 'Sad', emoji: '😢', color: '#4682B4' },
    { value: 'Angry', emoji: '😠', color: '#DC143C' },
    { value: 'Neutral', emoji: '😐', color: '#808080' },
    { value: 'Anxious', emoji: '😰', color: '#FF6347' },
    { value: 'Excited', emoji: '🤩', color: '#FF69B4' },
    { value: 'Frustrated', emoji: '😤', color: '#FF4500' },
    { value: 'Calm', emoji: '😌', color: '#98FB98' }
  ];

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  const fetchJournalEntries = async () => {
    try {
      setError(null);
      
      // Get mood logs from local storage (no backend required)
      const localMoods = JSON.parse(localStorage.getItem('moodLogs') || '[]');
      const sortedMoods = localMoods.sort((a, b) => new Date(b.date) - new Date(a.date));
      setJournalEntries(sortedMoods);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      setError('Failed to load journal entries');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Removed AI analysis - no backend AI route
  const analyzeWithAI = async () => null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newEntry.mood || !newEntry.date) {
      setError('Please select a mood and date');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create mood log with unique ID
      const moodLog = {
        id: Date.now(), // Use timestamp as unique ID
        mood: newEntry.mood,
        note: newEntry.note,
        date: newEntry.date,
        createdAt: new Date().toISOString()
      };
      
      // Save to local storage
      const existing = JSON.parse(localStorage.getItem('moodLogs') || '[]');
      existing.push(moodLog);
      localStorage.setItem('moodLogs', JSON.stringify(existing));

      setSuccess('Journal entry saved successfully!');
      setNewEntry({
        mood: '',
        note: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      
      // Refresh the entries list
      await fetchJournalEntries();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Error saving journal entry:', err);
      setError('Failed to save journal entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const moodOption = moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.emoji : '😐';
  };

  const getMoodColor = (mood) => {
    const moodOption = moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.color : '#808080';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <div className="journal-page">
        <div className="journal-container">
          <div className="journal-header">
            <h1>My Therapy Journal</h1>
            <p>Track your mood and thoughts</p>
            <button 
              className="new-entry-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : '+ New Entry'}
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {showForm && (
            <div className="journal-form-container">
              <form onSubmit={handleSubmit} className="journal-form">
                <h3>New Journal Entry</h3>
                
                <div className="form-group">
                  <label htmlFor="date">Date:</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newEntry.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mood">How are you feeling?</label>
                  <div className="mood-options">
                    {moodOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`mood-option ${newEntry.mood === option.value ? 'selected' : ''}`}
                        onClick={() => setNewEntry(prev => ({ ...prev, mood: option.value }))}
                        style={{ borderColor: option.color }}
                      >
                        <span className="mood-emoji">{option.emoji}</span>
                        <span className="mood-label">{option.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="note">Journal Entry:</label>
                  <textarea
                    id="note"
                    name="note"
                    value={newEntry.note}
                    onChange={handleInputChange}
                    placeholder="Write about your day, thoughts, or feelings..."
                    rows="6"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting || isAnalyzing}
                  >
                    {isSubmitting ? 'Saving...' : isAnalyzing ? 'Analyzing...' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="journal-entries">
            <h2>Your Journal Entries</h2>
            {journalEntries.length === 0 ? (
              <div className="no-entries">
                <p>No journal entries yet. Start by creating your first entry!</p>
              </div>
            ) : (
              <div className="entries-list">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="journal-entry">
                    <div className="entry-header">
                      <div className="entry-date">
                        {formatDate(entry.date)}
                      </div>
                      <div className="entry-moods">
                        <div className="user-mood">
                          <span className="mood-label">Your Mood:</span>
                          <span 
                            className="mood-badge"
                            style={{ backgroundColor: getMoodColor(entry.mood) }}
                          >
                            {getMoodEmoji(entry.mood)} {entry.mood}
                          </span>
                        </div>

                      </div>
                    </div>
                    {entry.note && (
                      <div className="entry-content">
                        <p>{entry.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JournalPage;