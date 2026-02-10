import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/Login.css';
import googleLogo from '../assests/google.png';

import loginImage from '../assests/image8.png';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
console.log("🧪 Backend URL:", API_BASE_URL);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Attempting login with:', { email, password });

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/users/login`,
        { email, password },
        { withCredentials: true } // ✅ Enables cookies if backend uses sessions
      );

      console.log(res.data);

      if (res.data?.user?._id && res.data?.token) {
        localStorage.setItem('userId', res.data.user._id);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('fullName', res.data.user.fullName);
        localStorage.setItem('email', res.data.user.email);

        if (res.data.user.profileImage) {
          const imageUrl = res.data.user.profileImage.startsWith('http')
            ? res.data.user.profileImage
            : `${API_BASE_URL}/${res.data.user.profileImage}`;
          localStorage.setItem('profilePic', imageUrl);
        }

        setMessage('Login successful!');
        navigate('/home');
      } else {
        setMessage('Invalid user data received from server.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else if (err.message === 'Network Error') {
        setMessage('Network error: check internet or CORS.');
      } else {
        setMessage('Login failed. Please try again.');
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <>
      <Navbar />
      <div className="login-wrapper">
        <div className="login-split-card">
          {/* LEFT PANEL - Form Side */}
          <div className="login-right-panel">
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

              <button className="social-button google" onClick={handleGoogleLogin}>
                <img src={googleLogo} alt="Google Logo" className="social-logo" />
                Continue with Google
              </button>
              
              

              <div className="signup-link">
                Need to create an account? <Link to="/signup">Sign Up</Link>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Image Side */}
          <div className="login-left-panel">
            <div className="login-image-container">
              <img src={loginImage} alt="CalmWave Wellness" />
              <div className="login-image-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
