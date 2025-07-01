import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Signup.css';
import { validatePassword, validateEmail } from '../utils/validationUtils';
import googleLogo from '../assests/google.png'; // Corrected typo 'assests'->'assets'
import facebookLogo from '../assests/facebook.png';

// Import the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const termsCheckbox = e.target.terms;
    if (!termsCheckbox.checked) {
      setMessage("You must agree to the terms and conditions");
      return;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setMessage(emailValidation.message);
      return;
    }

    // Validate password strength
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
      
      // Check if user data, _id, and token are returned
      if (res.data?.user?._id && res.data?.token) {
        // Save user data to localStorage
        localStorage.setItem('userId', res.data.user._id);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('fullName', res.data.user.fullName);
        localStorage.setItem('email', res.data.user.email);
        
        setMessage("Signup successful!");
        // Redirect to profile page to set up profile picture
        navigate('/profile');
      } else {
        setMessage("Signup successful! Please log in.");
        navigate('/login');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setMessage(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

const handleGoogleSignup = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google`; // ✅ Add /api
};


  return (
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
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password" 
            required
            minLength="6"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Re-enter your password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            name="confirmPassword" 
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password" 
            required
          />
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
      
      <div className="login-link">
        Already registered? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default Signup;
