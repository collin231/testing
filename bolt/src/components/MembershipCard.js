import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MembershipCard.css';

const MembershipCard = ({ user, membership }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/membership-card/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          memberId: user.member_id,
          fullName: user.full_name,
          joinDate: user.created_at
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anamola-membership-${user.member_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPNG = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/membership-card/png', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          memberId: user.member_id,
          fullName: user.full_name,
          joinDate: user.created_at
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anamola-membership-${user.member_id}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to generate PNG');
      }
    } catch (error) {
      console.error('PNG generation error:', error);
      alert('Failed to generate PNG. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderPhysicalCard = () => {
    navigate('/store', { state: { scrollToPhysicalCard: true } });
  };

  if (!user) {
    return <div className="membership-card-loading">Loading membership details...</div>;
  }

  return (
    <div className="membership-card-container">
      <div className="membership-card">
        <div className="card-header">
          <div className="card-title">
            <h2>Anamola</h2>
            <p>Member Card</p>
          </div>
          <div className="qr-code">
            <div className="qr-placeholder">
              <span>QR</span>
            </div>
          </div>
        </div>
        
        <div className="card-details">
          <div className="detail-row">
            <span className="label">Name:</span>
            <span className="value">{user.full_name || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Member Number:</span>
            <span className="value">{user.member_id || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Join Date:</span>
            <span className="value">
              {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="achievement-icons">
          <div className="achievement-icon star">⭐</div>
          <div className="achievement-icon trophy">🏆</div>
          <div className="achievement-icon person">👤</div>
        </div>
      </div>
      
      <div className="card-actions">
        <button 
          className="action-btn download-pdf"
          onClick={handleDownloadPDF}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Download PDF'}
        </button>
        <button 
          className="action-btn download-png"
          onClick={handleDownloadPNG}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Download PNG'}
        </button>
      </div>
      
      <div className="physical-card-option">
        <button className="physical-card-btn" onClick={handleOrderPhysicalCard}>
          <span className="card-icon">💳</span>
          Request Physical Card
        </button>
      </div>
    </div>
  );
};

export default MembershipCard;
