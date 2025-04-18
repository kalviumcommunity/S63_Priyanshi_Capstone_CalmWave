import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ForgotPassword.css';

function ForgotPassword() {
  return (
    <div className="forgot-password-container">
      <h2>Create Account</h2>
      <p>Enter your registered email and set a new password to regain access to your account.</p>
      <form className="forgot-password-form">
        
        <div className="form-group">
          <label htmlFor="email">Enter Registered Email</label>
          <input type="email" id="email" name="email" placeholder="Enter your email" required />
        </div>

        <div className="form-group">
          <label htmlFor="password">Enter your new password</label>
          <input type="password" id="password" name="password" placeholder="Create a new password" required />
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Your Password</label>
          <input type="password" id="confirm-password" name="confirm-password" placeholder="Confirm your new password" required />
        </div>

        <div className="terms-row">
          <input type="checkbox" id="terms" required />
          <label htmlFor="terms">I agree with <span className="terms-link">Terms & Conditions</span></label>
        </div>

        <button type="submit" className="reset-button">Reset Password</button>
      </form>

      <div className="login-link">
        Already registered? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
