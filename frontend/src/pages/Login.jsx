import React from 'react';
import '../styles/Login.css'


function Login() {
 return (
 <div className="login-container">
 <h2>Access Account</h2>
 <p>A warm and inviting message to create a sense of familiarity.</p>
 <form className="login-form">
 <div className="form-group">
 <label htmlFor="email">Your email address</label>
 <input type="email" id="email" name="email" placeholder="Enter your email" />
 </div>
 <div className="form-group">
 <label htmlFor="password">Enter your password</label>
 <input type="password" id="password" name="password" placeholder="Enter your password" />
 </div>
 <a href="#" className="forgot-password">Forgot your password?</a>
 <button type="submit" className="login-button">Log In</button>
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
 <div className="signup-link">
 Need to create an account? <a href="/signup">Sign Up</a>
 </div>
 </div>
 );
}


export default Login;
