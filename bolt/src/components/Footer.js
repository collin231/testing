import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ANAMOLA</h3>
            <p>Para um Moçambique Livre e Autónomo</p>
            <p>For a Free and Autonomous Mozambique</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/news">News</Link></li>
              <li><Link to="/membership">Membership</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>Email: info@anamola.org.mz</p>
            <p>Phone: +258 84 XXX XXXX</p>
            <p>Address: Maputo, Mozambique</p>
          </div>
          
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="Twitter">Twitter</a>
              <a href="#" aria-label="Instagram">Instagram</a>
              <a href="#" aria-label="YouTube">YouTube</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Anamola Political Movement. All rights reserved.</p>
          <p>Venâncio Mondlane's Vision for Mozambique</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
