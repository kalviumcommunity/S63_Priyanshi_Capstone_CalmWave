import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import quizImage from "../assests/image.png";
import "../styles/QuizPage.css";

const QuizPage = () => {
  const questions = [
    { question: "1. Feeling nervous, anxious, or on edge", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { question: "2. Not being able to stop or control worrying", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { question: "3. Worrying too much about different things", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { question: "4. Trouble relaxing", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { question: "5. Being so restless that it is hard to sit still", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { question: "6. Becoming easily annoyed or irritable", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { question: "7. Feeling afraid as if something awful might happen", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
  ];

  const [showStartScreen, setShowStartScreen] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPreviousResults, setShowPreviousResults] = useState(false);
  const [previousResults, setPreviousResults] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    setPreviousResults(storedResults);
  }, []);

  // Function to get local quiz results
  const getLocalQuizResults = () => {
    try {
      return JSON.parse(localStorage.getItem('quizResults') || '[]');
    } catch (err) {
      console.error('Error reading local quiz results:', err);
      return [];
    }
  };

  // Function to view previous results
  const handleViewPreviousResults = () => {
    const results = getLocalQuizResults();
    setPreviousResults(results);
    setShowPreviousResults(true);
  };

  const handleAnswerClick = (option) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = option;
    setAnswers(updatedAnswers);
  };

  const calculateScore = async () => {
    const scoreMap = {
      "Not at all": 0,
      "Several days": 1,
      "More than half the days": 2,
      "Nearly every day": 3,
    };

    const total = answers.reduce((acc, answer) => acc + (scoreMap[answer] || 0), 0);

    let levelText = "";
    if (total <= 4) levelText = "Minimal Anxiety";
    else if (total <= 9) levelText = "Mild Anxiety";
    else if (total <= 14) levelText = "Moderate Anxiety";
    else levelText = "Severe Anxiety";

    setScore(total);
    setLevel(levelText);
    
    // Save quiz result locally (no backend required)
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create quiz result data
      const quizData = {
        id: Date.now(), // Use timestamp as unique ID
        score: total,
        level: levelText,
        date: new Date().toISOString(),
        answers: answers // Store the actual answers for reference
      };
      
      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('quizResults') || '[]');
      existing.push(quizData);
      localStorage.setItem('quizResults', JSON.stringify(existing));
      
      console.log('Quiz result saved locally');
      
    } catch (err) {
      console.error('Error saving quiz result:', err);
      setError('Failed to save your quiz result, but you can still continue.');
    } finally {
      setIsSubmitting(false);
      setShowResultScreen(true);
    }
  };

  const handleNext = () => {
    if (!answers[currentQuestion]) {
      alert("Please select an option before continuing.");
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleStartTherapy = () => {
    navigate('/therapy', { state: { level } }); // 🚀 Pass anxiety level to therapy page
  };

  // Check previous results FIRST
  if (showPreviousResults) {
    return (
      <>
        <Navbar />
        <div className="previous-results-screen">
          <div className="results-box">
            <h1>📊 Your Quiz History</h1>
            
            {previousResults.length === 0 ? (
              <div className="no-results">
                <p>No previous quiz results found. Take your first quiz to get started!</p>
                <button onClick={() => {
                  setShowPreviousResults(false);
                  setShowStartScreen(true);
                }}>Take Quiz</button>
              </div>
            ) : (
              <>
                <div className="results-list">
                  {previousResults.map((result, index) => (
                    <div key={result.id || index} className="result-item">
                      <div className="result-header">
                        <span className="result-date">
                          {new Date(result.date).toLocaleDateString()}
                        </span>
                        <span className="result-time">
                          {new Date(result.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="result-details">
                        <span className="result-score">Score: <strong>{result.score}</strong></span>
                        <span className="result-level">Level: <strong>{result.level}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="results-actions">
                  <button onClick={() => {
                    setShowPreviousResults(false);
                    setShowStartScreen(false);
                    setCurrentQuestion(0);
                    setAnswers([]);
                    setShowResultScreen(false);
                  }}>Take New Quiz</button>
                  <button onClick={() => {
                    setShowPreviousResults(false);
                    setShowStartScreen(true);
                  }}>Back to Start</button>
                </div>
              </>
            )}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (showStartScreen) {
    return (
      <>
        <Navbar />
        <div className="quiz-landing-container">
          <div className="quiz-landing-card">
            <div className="quiz-landing-left">
              <h1 className="quiz-landing-title">Quizzes</h1>
              <h2 className="quiz-landing-subtitle">Let's Find Out Where You Stand</h2>
              <p className="quiz-landing-quote">Every emotion is a message. Let's see what yours is saying today💌.</p>
              <div className="quiz-landing-buttons">
                <button 
                  className="quiz-btn-start"
                  onClick={() => {
                    setShowStartScreen(false);
                    setShowPreviousResults(false);
                    setShowResultScreen(false);
                    setCurrentQuestion(0);
                    setAnswers([]);
                  }}
                >
                  Start Quiz
                </button>
                <button 
                  className="quiz-btn-results"
                  onClick={handleViewPreviousResults}
                >
                  View Previous Results ({previousResults.length})
                </button>
              </div>
            </div>
            
            <div className="quiz-landing-right">
              <div className="quiz-image-container">
                <div className="quiz-hero-image">
                  <img src={quizImage} alt="Quiz illustration" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2rem'}} />
                </div>
                <div className="floating-option option-a">
                  <span className="option-badge">A</span>
                  <span>Feeling anxious?</span>
                </div>
                <div className="floating-option option-b">
                  <span className="option-badge">B</span>
                  <span>Need to relax?</span>
                </div>
                <div className="floating-option option-c">
                  <span className="option-badge">C</span>
                  <span>How's your mood?</span>
                </div>
                <div className="floating-option option-d">
                  <span className="option-badge">D</span>
                  <span>Ready to reflect?</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (showResultScreen) {
    return (
      <>
        <Navbar />
        <div className="quiz-result-screen">
          <div className="result-content-wrapper">
            <div className="result-main-card">
              <div className="result-header-section">
                <div className="celebration-icon">🎉</div>
                <h1 className="result-main-title">Quiz Completed!</h1>
                <p className="result-subtitle">Here's your mental wellness assessment</p>
              </div>
              
              {error && (
                <div className="result-error-message">
                  {error}
                </div>
              )}
              
              <div className="result-stats-container">
                <div className="result-stat-box score-box">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-label">Your Score</div>
                    <div className="stat-value">{score}</div>
                    <div className="stat-max">out of {questions.length * 3}</div>
                  </div>
                </div>
                
                <div className="result-stat-box level-box">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <div className="stat-label">Anxiety Level</div>
                    <div className="stat-value-text">{level}</div>
                  </div>
                </div>
              </div>
              
              <div className="result-insight-card">
                <div className="insight-header">
                  <span className="insight-icon">💙</span>
                  <h3>A Message for You</h3>
                </div>
                <p className="insight-text">
                  Remember, this is just a self-assessment. You're doing great just by being here and taking steps to understand yourself better. Mental wellness is a journey, not a destination.
                </p>
              </div>
              
              <div className="result-action-buttons">
                <button 
                  className="result-btn btn-outlined"
                  onClick={() => window.location.reload()}
                  disabled={isSubmitting}
                >
                  <span className="btn-icon">🔄</span>
                  Retake Quiz
                </button>
                <button 
                  className="result-btn btn-primary" 
                  onClick={handleStartTherapy}
                  disabled={isSubmitting}
                >
                  <span className="btn-icon">🌿</span>
                  {isSubmitting ? "Saving..." : "Start Your Journey"}
                </button>
              </div>
            </div>
            
            <div className="result-floating-elements">
              <div className="floating-shape shape-1"></div>
              <div className="floating-shape shape-2"></div>
              <div className="floating-shape shape-3"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="quiz-page">
        <div className="quiz-assessment-container">
          <div className="quiz-assessment-card">
            <div className="quiz-content-wrapper">
              <div className="quiz-main-section">
                <div className="quiz-header">
                  <h2>Question {currentQuestion + 1} of {questions.length}</h2>
                  <button className="submit-button" onClick={() => {
                    if (currentQuestion === questions.length - 1) {
                      calculateScore();
                    } else {
                      handleNext();
                    }
                  }}>
                    Submit
                  </button>
                </div>
                
                <p className="question-text">{questions[currentQuestion].question}</p>
                
                <div className="quiz-options-grid">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      className={`quiz-option-card ${answers[currentQuestion] === option ? "selected" : ""}`}
                      onClick={() => handleAnswerClick(option)}
                    >
                      <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                      <span className="option-text">{option}</span>
                    </button>
                  ))}
                </div>
                
                <div className="quiz-navigation">
                  <button
                    className="nav-btn prev-btn"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    Prev
                  </button>
                  
                  <div className="question-numbers">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        className={`question-num ${currentQuestion === index ? "active" : ""} ${answers[index] ? "answered" : ""}`}
                        onClick={() => setCurrentQuestion(index)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    className="nav-btn next-btn"
                    onClick={handleNext}
                    disabled={currentQuestion === questions.length - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
              
              <div className="quiz-progress-sidebar">
                <div className="progress-circle">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#e5e5e5"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#2d3436"
                      strokeWidth="8"
                      strokeDasharray={`${(answers.filter(a => a).length / questions.length) * 339.292} 339.292`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="progress-text">
                    <span className="progress-number">{answers.filter(a => a).length}/{questions.length}</span>
                  </div>
                </div>
                <p className="progress-label">Question {currentQuestion + 1} of {questions.length}</p>
                <p className="progress-question">{questions[currentQuestion].question}</p>
                
                <div className="sidebar-options">
                  {questions[currentQuestion].options.map((option, index) => (
                    <div
                      key={index}
                      className={`sidebar-option ${answers[currentQuestion] === option ? "selected" : ""}`}
                    >
                      <span className="sidebar-label">{String.fromCharCode(65 + index)}</span>
                      <span className="sidebar-text">{option}</span>
                    </div>
                  ))}
                </div>
                
                <div className="sidebar-navigation">
                  <button
                    className="sidebar-nav-btn"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    Prev
                  </button>
                  <button
                    className="sidebar-nav-btn next"
                    onClick={handleNext}
                    disabled={currentQuestion === questions.length - 1}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default QuizPage;
