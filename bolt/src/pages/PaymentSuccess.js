import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [memberData, setMemberData] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const hasInitiatedVerification = useRef(false);
  const maxRetries = 3;

  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent');

  const verifyPayment = useCallback(async () => {
    // Prevent multiple simultaneous verification attempts
    if (isVerifying) return;
    
    setIsVerifying(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/payment-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          paymentIntentId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationStatus('success');
        setMemberData(data.data);
        setIsVerifying(false);
        return; // Exit early on success
      } else {
        // Check if it's a processing error that might resolve itself
        if (data.error && (data.error.includes('processing') || data.error.includes('pending'))) {
          // Payment is still processing, wait and retry
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            setIsVerifying(false);
            setTimeout(() => {
              verifyPayment();
            }, 2000); // Retry after 2 seconds
            return;
          }
        }
        
        // If we've exhausted retries or it's a real error
        setVerificationStatus('failed');
        setError(data.error || 'Payment verification failed');
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      
      // Network errors might be temporary, retry once
      if (verificationStatus === 'verifying' && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setIsVerifying(false);
        setTimeout(() => {
          verifyPayment();
        }, 3000); // Retry after 3 seconds
        return;
      }
      
      setVerificationStatus('failed');
      setError('Failed to verify payment. Please contact support.');
      setIsVerifying(false);
    }
  }, [sessionId, paymentIntentId, retryCount, maxRetries, verificationStatus, isVerifying]);

  useEffect(() => {
    if ((sessionId || paymentIntentId) && verificationStatus === 'verifying' && !isVerifying && !hasInitiatedVerification.current) {
      hasInitiatedVerification.current = true;
      verifyPayment();
    }
  }, [sessionId, paymentIntentId, verificationStatus, isVerifying, verifyPayment]);

  const handleTryAgain = () => {
    setVerificationStatus('verifying');
    setError(null);
    setRetryCount(0);
    setIsVerifying(false);
    hasInitiatedVerification.current = false;
    // Small delay to ensure state is reset before calling verifyPayment
    setTimeout(() => {
      verifyPayment();
    }, 100);
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToDashboard = () => {
    if (memberData?.memberId) {
      navigate(`/dashboard/${memberData.memberId}`);
    }
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="payment-success-page">
        <div className="payment-success-container">
          <div className="verification-status">
            <div className="loading-spinner"></div>
            <h2>Processing Your Payment...</h2>
            <p>Please wait while we verify your payment and create your account. This may take a few moments.</p>
            <div className="processing-steps">
              <p>✓ Payment received from Stripe</p>
              <p>⏳ Verifying payment details...</p>
              <p>⏳ Creating your account...</p>
              <p>⏳ Setting up your membership...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="payment-success-page">
        <div className="payment-success-container">
          <div className="verification-status failed">
            <div className="status-icon"></div>
            <h2>Payment Verification Failed</h2>
            <p className="error-message">{error}</p>
            <div className="action-buttons">
              <button onClick={handleTryAgain} className="btn btn-primary">
                Try Again
              </button>
              <button onClick={() => navigate('/')} className="btn btn-secondary">
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-page">
      <div className="payment-success-container">
        <div className="success-header">
          <div className="success-icon"></div>
          <h1>Welcome to Anamola!</h1>
          <p className="success-message">
            Your payment was successful and your account has been created.
          </p>
        </div>

        <div className="success-content">
          {memberData && (
            <div className="member-details">
              <h2>Your Account Details</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Member ID</span>
                  <span className="value">{memberData.memberId}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Full Name</span>
                  <span className="value">{memberData.fullName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email</span>
                  <span className="value">{memberData.email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Membership Type</span>
                  <span className="value">{memberData.membershipType}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Payment Status</span>
                  <span className="value success">Completed</span>
                </div>
                <div className="detail-item">
                  <span className="label">Join Date</span>
                  <span className="value">{new Date(memberData.paymentDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {memberData?.loginCredentials && (
            <div className="login-credentials">
              <h2>Your Login Credentials</h2>
              <div className="credentials-box">
                <div className="credential-item">
                  <span className="label">Email</span>
                  <span className="value">{memberData.loginCredentials.email}</span>
                </div>
                <div className="credential-item">
                  <span className="label">Password</span>
                  <span className="value password-field">
                    {memberData.loginCredentials.password}
                  </span>
                  <span className="password-note">
                    Save this password securely - it won't be shown again!
                  </span>
                </div>
              </div>
              <p className="credentials-note">
                Use these credentials to log in to your member dashboard. 
                We recommend changing your password after your first login.
              </p>
            </div>
          )}

          <div className="next-steps">
            <h2>Next Steps</h2>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Save Your Credentials</h3>
                  <p>Write down your email and password in a secure location.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Log In to Your Dashboard</h3>
                  <p>Access your member dashboard to view your profile and membership details.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Complete Your Profile</h3>
                  <p>Add additional information and customize your member experience.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={handleGoToLogin} className="btn btn-primary">
              Log In Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
