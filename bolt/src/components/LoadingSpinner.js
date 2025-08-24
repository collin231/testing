import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', text = 'Loading...' }) => {
  return (
    <div className={`custom-loading-container custom-size-${size} custom-color-${color}`}>
      <div className="custom-loading-dot"></div>
      {text && <p className="custom-loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
