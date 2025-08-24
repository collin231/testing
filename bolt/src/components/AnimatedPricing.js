import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AnimatedPricing.css';

// Check Icon Component
const CheckIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16" 
    height="16" 
    viewBox="0 0 24 24"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3"
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

// Price Toggle Component
const PriceToggle = ({ isYearly, onToggle }) => {
  return (
    <div className="price-toggle-container">
      <div className="toggle-wrapper">
        <span className={`toggle-label ${!isYearly ? 'active' : ''}`}>Monthly</span>
        <button 
          className={`toggle-button ${isYearly ? 'yearly' : 'monthly'}`}
          onClick={onToggle}
          aria-label="Toggle between monthly and yearly pricing"
        >
          <div className="toggle-slider"></div>
        </button>
        <span className={`toggle-label ${isYearly ? 'active' : ''}`}>Yearly</span>
        {isYearly && (
          <div className="yearly-discount">
            <span className="discount-badge">Save 20%</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Animated Background Component
const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="animated-background">
      <div 
        className="floating-orb"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      />
      <div className="gradient-overlay" />
    </div>
  );
};

// Pricing Card Component
const PricingCard = ({ 
  planName, 
  description, 
  monthlyPrice, 
  yearlyPrice, 
  features, 
  buttonText, 
  isPopular = false, 
  buttonVariant = 'primary',
  isYearly = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const currentPrice = isYearly ? yearlyPrice : monthlyPrice;
  const originalPrice = isYearly ? monthlyPrice * 12 : monthlyPrice;

  return (
    <div 
      className={`pricing-card ${isPopular ? 'popular' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isPopular && (
        <div className="popular-badge">
          Most Popular
        </div>
      )}
      
      <div className="card-header">
        <h3 className="plan-name">{planName}</h3>
        <p className="plan-description">{description}</p>
      </div>
      
      <div className="price-section">
        <span className="currency">MT</span>
        <span className="amount">{currentPrice}</span>
        <span className="period">/{isYearly ? 'year' : 'month'}</span>
      </div>
      
      {isYearly && (
        <div className="yearly-savings">
          <span className="original-price">MT {originalPrice}</span>
          <span className="savings-text">per year if paid monthly</span>
        </div>
      )}
      
      <div className="card-divider"></div>
      
      <ul className="features-list">
        {features.map((feature, index) => (
          <li key={index} className="feature-item">
            <CheckIcon className="check-icon" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link 
        to="/register" 
        className={`join-button ${buttonVariant} ${isHovered ? 'hovered' : ''}`}
      >
        {buttonText}
      </Link>
    </div>
  );
};

// Main Pricing Page Component
const AnimatedPricing = ({ 
  title, 
  subtitle, 
  plans, 
  showAnimatedBackground = true 
}) => {
  const [isYearly, setIsYearly] = useState(true);

  const togglePricing = () => {
    setIsYearly(!isYearly);
  };

  return (
    <div className="animated-pricing-page">
      {showAnimatedBackground && <AnimatedBackground />}
      
      <main className="pricing-content">
        <div className="header-section">
          <h1 className="main-title">{title}</h1>
          <p className="subtitle">{subtitle}</p>
          
          <PriceToggle 
            isYearly={isYearly} 
            onToggle={togglePricing} 
          />
        </div>
        
        <div className="pricing-cards-container">
          {plans.map((plan, index) => (
            <PricingCard 
              key={index} 
              {...plan} 
              isYearly={isYearly}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AnimatedPricing;
