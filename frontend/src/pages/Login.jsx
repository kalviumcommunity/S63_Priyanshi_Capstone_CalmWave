import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';
import googleLogo from '../assests/google.png'; // Corrected path
import facebookLogo from '../assests/facebook.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/users/login', {
        email,
        password,
      });
      console.log(res.data);
      setMessage('Login successful!');
      navigate('/home');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Access Account</h2>
        {message && <div className="message">{message}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Your email address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Enter your password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <Link to="/forgot-password" className="forgot-password">
            Forgot your password?
          </Link>
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>

        <div className="or-divider">
          <span>Or</span>
        </div>

        <button className="social-button google">
          <img src={googleLogo} alt="Google Logo" className="social-logo" />
          Continue with Google
        </button>
        <button className="social-button facebook">
          <img src={facebookLogo} alt="Facebook Logo" className="social-logo" />
          Continue with Facebook
        </button>
        <button className="social-button apple">
          <img
            src="https://1000logos.net/wp-content/uploads/2016/10/Apple-Logo.png"
            alt="Apple Logo"
            className="social-logo"
          />
          Continue with Apple
        </button>

        <div className="signup-link">
          Need to create an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
