import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear login error
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Use the auth context to login
        login(data.user, data.profile, data.session);
        
        // Redirect to dashboard
        if (data.profile?.member_id) {
          navigate(`/dashboard/${data.profile.member_id}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        setLoginError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="background-pattern"></div>
        <div className="background-overlay"></div>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-icon">
                <span className="logo-text">A</span>
              </div>
              <h1>Welcome Back</h1>
            </div>
            <p className="login-subtitle">Sign in to your Anamola member account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {loginError && (
              <div className="error-banner">
                <div className="error-icon">⚠</div>
                <span>{loginError}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <span className="label-icon">📧</span>
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={errors.email ? 'error' : ''}
                />
                <div className="input-focus-border"></div>
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
                <div className="input-focus-border"></div>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              <span className="button-text">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </span>
              <div className="button-loader"></div>
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="social-login">
            <button className="social-button google">
              <span className="social-icon">🔍</span>
              Continue with Google
            </button>
            <button className="social-button facebook">
              <span className="social-icon">📘</span>
              Continue with Facebook
            </button>
          </div>

          <div className="login-footer">
            <p className="register-prompt">
              Don't have an account?{' '}
              <Link to="/register" className="register-link">
                Join Anamola today
              </Link>
            </p>
            <Link to="/" className="home-link">
              ← Return to Home
            </Link>
          </div>

          <div className="help-section">
            <div className="help-icon">💡</div>
            <div className="help-content">
              <h4>New Member?</h4>
              <p>
                If you just completed your registration and payment, you should have received 
                your login credentials on the success page. Use those credentials to sign in above.
              </p>
              <p className="help-contact">
                <strong>Need help?</strong> Contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
