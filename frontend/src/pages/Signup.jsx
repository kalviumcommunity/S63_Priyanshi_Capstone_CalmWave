import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/Signup.css';
import { validatePassword, validateEmail } from '../utils/validationUtils';
import googleLogo from '../assests/google.png';
import signupImage from '../assests/image9.png';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const termsCheckbox = e.target.terms;

    if (!termsCheckbox.checked) {
      setMessage("You must agree to the terms and conditions");
      return;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setMessage(emailValidation.message);
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setMessage(passwordValidation.message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setMessage("Creating your account...");

      const res = await axios.post(`${API_BASE_URL}/api/users/register`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      }, {
        withCredentials: true
      });

      console.log(res.data);

      if (res.data?.user?._id && res.data?.token) {
        localStorage.setItem('userId', res.data.user._id);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('fullName', res.data.user.fullName);
        localStorage.setItem('email', res.data.user.email);

        setMessage("Signup successful!");
        navigate('/profile'); // Redirect to set up profile image
      } else {
        setMessage("Signup successful! Please log in.");
        navigate('/login');
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else if (err.message === 'Network Error') {
        setMessage('Network error: check your internet or CORS policy.');
      } else {
        setMessage('Signup failed. Please try again.');
      }
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <>
      <Navbar />
      <div className="signup-wrapper">
        <div className="signup-split-card">
          {/* LEFT PANEL - Form Side */}
          <div className="signup-left-panel">
            <div className="signup-container">
              <h2>Create Account</h2>
              <p>Join us for a more relaxing experience</p>
              {message && <div className="message">{message}</div>}

              <form className="signup-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="fullName">Enter your full name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Your email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Create a password</label>
                  <div className="password-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="pw-eye-btn"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Re-enter your password</label>
                  <div className="password-input-wrap">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="pw-eye-btn"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="checkbox-inline">
                  <input type="checkbox" id="terms" name="terms" required />
                  <label htmlFor="terms">I agree with terms and conditions</label>
                </div>

                <button type="submit" className="signup-button">Create Account</button>
              </form>

              <div className="or-divider">
                <span>Or</span>
              </div>

              <button className="social-button google" onClick={handleGoogleSignup}>
                <img src={googleLogo} alt="Google Logo" className="social-logo" />
                Continue with Google
              </button>


              <div className="login-link">
                Already registered? <Link to="/login">Login</Link>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Image Side */}
          <div className="signup-right-panel">
            <div className="signup-image-container">
              <img src={signupImage} alt="CalmWave Wellness" />
              <div className="signup-image-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;