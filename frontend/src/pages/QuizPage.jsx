import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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

  const quotes = [
    "Don’t worry, this quiz won’t bite. But it might expose your overthinking😉.",
    "If overthinking were a sport, we’d all be gold medalists😅.",
    "Is it anxiety or just caffeine? Let’s find out🫣.",
    "Every emotion is a message. Let’s see what yours is saying today💌.",
    "We’re not saying you’re anxious, but let’s just check — for funsies🎲.",
    "Let’s find out what your mind’s trying to tell you. No pressure🧠.",
    "Thought spiral in progress? No worries — we’ve got a parachute💙.",
    "You don’t need to feel okay to start. You just need to start🌤️.",
    "You’re stronger than you think. Let’s explore your peace🌿.",
    "Your brain’s been doing cartwheels again, huh? Let’s help it stick the landing🤸‍♂️.",
  ];

  const [showStartScreen, setShowStartScreen] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState("");
  const [randomQuote, setRandomQuote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    setRandomQuote(quote);
  }, []);

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
    
    // Save quiz result to backend
    try {
      setIsSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      // Create quiz result data
      const quizData = {
        score: total,
        level: levelText,
        date: new Date()
      };
      
      if (!token) {
        // Save locally if not logged in
        const existing = JSON.parse(localStorage.getItem('quizResults') || '[]');
        existing.push(quizData);
        localStorage.setItem('quizResults', JSON.stringify(existing));
      } else {
        // Send data to backend if logged in
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/quizresults`, quizData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      console.log('Quiz result saved successfully');
      
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

  if (showStartScreen) {
    return (
      <>
        <Navbar />
        <div className="start-bg">
          <div className="start-overlay">
            <div className="start-content">
              <h1>Let’s Find Out Where You Stand</h1>
              <p>{randomQuote}</p>
              <button onClick={() => setShowStartScreen(false)}>Start</button>
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
        <div className="result-screen">
          <div className="result-box">
            <h1>🎉 Hurray! You Completed the Quiz</h1>
            
            {error && (
              <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '4px' }}>
                {error}
              </div>
            )}
            
            <p className="result-score">Your Score: <strong>{score}</strong></p>
            <p className="result-level">Anxiety Level: <strong>{level}</strong></p>
            <p className="result-msg">Remember, this is just a self-assessment. You're doing great just by being here 💙</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "24px" }}>
              <button 
                onClick={() => window.location.reload()}
                disabled={isSubmitting}
              >
                Retake Quiz
              </button>
              <button 
                className="result-action-btn" 
                onClick={handleStartTherapy}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Start Therapy"}
              </button>
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
        <h1>Anxiety Assessment</h1>
        <p className="quiz-progress">Question {currentQuestion + 1} of {questions.length}</p>
        <div className="question-box">
          <p>{questions[currentQuestion].question}</p>
          <div className="options">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${answers[currentQuestion] === option ? "selected" : ""}`}
                onClick={() => handleAnswerClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="quiz-buttons">
            <button
              className="prev-button"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            <button className="next-button" onClick={handleNext}>
              {currentQuestion === questions.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default QuizPage;
