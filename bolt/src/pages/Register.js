import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import './Register.css';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    contactPreference: 'email',
    
    // Address
    streetAddress: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Mozambique',
    
    // Documents
    idNumber: '',
    idType: '',
    idImage: null,
    profilePhoto: null,
    
    // Verification
    termsAccepted: false,
    newsletterSubscription: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [stripeConfig, setStripeConfig] = useState(null);

  const steps = [
    { id: 1, title: 'Personal Information', icon: '' },
    { id: 2, title: 'Address Details', icon: '' },
    { id: 3, title: 'Document Upload', icon: '' },
    { id: 4, title: 'Verification', icon: '' }
  ];

  useEffect(() => {
    // Fetch Stripe configuration
    fetchStripeConfig();
  }, []);

  const fetchStripeConfig = async () => {
    try {
      console.log('Fetching Stripe configuration...');
      const response = await fetch('http://localhost:5000/api/config');
      console.log('Config response:', response);
      const config = await response.json();
      console.log('Stripe config received:', config);
      setStripeConfig(config);
    } catch (error) {
      console.error('Failed to fetch Stripe config:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.contactPreference) newErrors.contactPreference = 'Contact preference is required';
        break;

      case 2:
        if (!formData.streetAddress) newErrors.streetAddress = 'Street address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.province) newErrors.province = 'Province is required';
        if (!formData.postalCode) newErrors.postalCode = 'Postal code is required';
        break;

      case 3:
        if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
        if (!formData.idType) newErrors.idType = 'ID type is required';
        if (!formData.idImage) newErrors.idImage = 'ID image is required';
        if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
        break;

      case 4:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted, validating...');
    
    if (!validateStep(currentStep)) {
      console.log('Validation failed');
      return;
    }

    console.log('Validation passed, starting payment process...');
    setLoading(true);

    try {
      // Determine membership type and amount based on user selection
      // For now, we'll use a default membership type
      const membershipType = 'Standard Membership';
      const amount = 100; // MT 100 - you can adjust this based on your pricing

      console.log('Creating payment intent with:', { amount, currency: 'mzn', membershipType });

      // Create checkout session directly
      console.log('Creating checkout session with:', { amount, currency: 'MZN', membershipType });

      const sessionResponse = await fetch('http://localhost:5000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          membershipType,
        }),
      });

      console.log('Checkout session response:', sessionResponse);

      const sessionData = await sessionResponse.json();
      console.log('Checkout session data:', sessionData);

      if (sessionData.sessionId) {
        console.log('Checkout session created successfully, redirecting to Stripe...');
        // Redirect to Stripe Checkout using the session ID
        const stripe = await loadStripe(stripeConfig.publishableKey);
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: sessionData.sessionId
          });
          if (error) {
            throw new Error(error.message);
          }
        } else {
          throw new Error('Failed to load Stripe');
        }
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        stripeConfig: stripeConfig,
        formData: formData
      });
      alert(`Registration failed: ${error.message}. Please try again.`);
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-card">
            <div className="form-header">
              <h3>Personal Information</h3>
              <div className="header-icon"></div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth *</label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={errors.dateOfBirth ? 'error' : ''}
                  />
                  <span className="calendar-icon"></span>
                </div>
                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
              </div>
              
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
            
            <div className="contact-preference">
              <label>Contact Preference *</label>
              <div className="preference-buttons">
                <button
                  type="button"
                  className={`preference-btn ${formData.contactPreference === 'email' ? 'active' : ''}`}
                  onClick={() => handleChange({ target: { name: 'contactPreference', value: 'email' } })}
                >
                  <span className="preference-icon"></span>
                  Email
                </button>
                <button
                  type="button"
                  className={`preference-btn ${formData.contactPreference === 'phone' ? 'active' : ''}`}
                  onClick={() => handleChange({ target: { name: 'contactPreference', value: 'phone' } })}
                >
                  <span className="preference-icon"></span>
                  Phone
                </button>
              </div>
              {errors.contactPreference && <span className="error-message">{errors.contactPreference}</span>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-card">
            <div className="form-header">
              <h3>Address Details</h3>
              <div className="header-icon"></div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  className={errors.streetAddress ? 'error' : ''}
                />
                {errors.streetAddress && <span className="error-message">{errors.streetAddress}</span>}
              </div>
              
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Province *</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className={errors.province ? 'error' : ''}
                />
                {errors.province && <span className="error-message">{errors.province}</span>}
              </div>
              
              <div className="form-group">
                <label>Postal Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={errors.postalCode ? 'error' : ''}
                />
                {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-card">
            <div className="form-header">
              <h3>Document Upload</h3>
              <div className="header-icon"></div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>ID Number *</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  className={errors.idNumber ? 'error' : ''}
                />
                {errors.idNumber && <span className="error-message">{errors.idNumber}</span>}
              </div>
              
              <div className="form-group">
                <label>ID Type *</label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleChange}
                  className={errors.idType ? 'error' : ''}
                >
                  <option value="">Select ID Type</option>
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
                {errors.idType && <span className="error-message">{errors.idType}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>ID Image *</label>
                <input
                  type="file"
                  name="idImage"
                  onChange={handleChange}
                  accept="image/*"
                  className={errors.idImage ? 'error' : ''}
                />
                {errors.idImage && <span className="error-message">{errors.idImage}</span>}
              </div>
              
              <div className="form-group">
                <label>Profile Photo *</label>
                <input
                  type="file"
                  name="profilePhoto"
                  onChange={handleChange}
                  accept="image/*"
                  className={errors.profilePhoto ? 'error' : ''}
                />
                {errors.profilePhoto && <span className="error-message">{errors.profilePhoto}</span>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-card">
            <div className="form-header">
              <h3>Verification & Terms</h3>
              <div className="header-icon"></div>
            </div>
            
            <div className="verification-summary">
              <h4>Registration Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <strong>Name:</strong> {formData.fullName}
                </div>
                <div className="summary-item">
                  <strong>Email:</strong> {formData.email}
                </div>
                <div className="summary-item">
                  <strong>Phone:</strong> {formData.phone}
                </div>
                <div className="summary-item">
                  <strong>City:</strong> {formData.city}
                </div>
              </div>
            </div>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                I accept the terms and conditions *
              </label>
              {errors.termsAccepted && <span className="error-message">{errors.termsAccepted}</span>}
            </div>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="newsletterSubscription"
                  checked={formData.newsletterSubscription}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Subscribe to our newsletter for updates
              </label>
            </div>
            
            <div className="payment-notice">
              <h4>Payment Required</h4>
              <p>After verification, you will be redirected to complete your membership payment.</p>
              <div className="payment-methods">
                <span>Accepted Payment Methods:</span>
                <div className="payment-icons">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-page">
      <div className="register-hero">
        <div className="container">
          <h1>Join Anamola</h1>
          <p>Become a member of the party leading Mozambique forward</p>
        </div>
      </div>

      <div className="register-form-section">
        <div className="container">
          {/* Progress Indicator */}
          <div className="progress-container">
            <div className="progress-info">
              <p>Step {currentStep} of {steps.length}</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            {/* Step Navigation */}
            <div className="step-navigation">
              {currentStep > 1 && (
                <button type="button" className="btn btn-secondary" onClick={prevStep}>
                  ← Previous
                </button>
              )}
              
              {currentStep < steps.length ? (
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Next →
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || !stripeConfig}
                >
                  {loading ? 'Processing...' : 'Complete Registration & Pay'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
