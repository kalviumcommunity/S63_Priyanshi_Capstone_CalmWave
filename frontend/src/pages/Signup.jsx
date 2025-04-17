import React from 'react';
import '../styles/Signup.css'


function Signup() {
 return (
 <div className="signup-container">
 <h2>Create Account</h2>
 <p>Join us for a more relaxing experience</p>
 <form className="signup-form">
 <div className="form-group">
 <label htmlFor="fullName">Enter your full name</label>
 <input type="text" id="fullName" name="fullName" placeholder="Enter your full name" />
 </div>
 <div className="form-group">
 <label htmlFor="email">Your email address</label>
 <input type="email" id="email" name="email" placeholder="Your email address" />
 </div>
 <div className="form-group">
 <label htmlFor="password">Create a password</label>
 <input type="password" id="password" name="password" placeholder="Create a password" />
 </div>
 <div className="form-group">
 <label htmlFor="confirmPassword">Re-enter your password</label>
 <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Re-enter your password" />
 </div>
 <div className="checkbox-inline">
  <input type="checkbox" id="terms" name="terms" />
  <label htmlFor="terms">I agree with terms and condition</label>
</div>


 <button type="submit" className="signup-button">Create Account</button>
 </form>
 <div className="or-divider">
 <span>Or</span>
 </div>
 <button className="social-button google">
          <img src="/google.png" alt="Google Logo" className="social-logo" />
          Continue with Google
        </button>
        <button className="social-button facebook">
          <img src="/facebook.png" alt="Facebook Logo" className="social-logo" />
          Continue with Facebook
        </button>
        <button className="social-button apple">
          <img src="https://1000logos.net/wp-content/uploads/2016/10/Apple-Logo.png" alt="Apple Logo" className="social-logo" />
          Continue with Apple
        </button>
 <div className="login-link">
 Already registered? <a href="/login">Login</a>
 </div>
 </div>
 );
}


export default Signup;
