import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import PresidentImage from '../picture/anamola presdi.jpg';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Leading Mozambique Forward</h1>
          <p>Join us in building a stronger, more prosperous Mozambique. Together, we can create positive change and ensure a brighter future for all citizens.</p>
          <div className="hero-buttons">
            <Link to="/about" className="btn btn-primary">Learn More</Link>
            <Link to="/contact" className="btn btn-secondary">Get Involved</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src={PresidentImage} alt="Anamola President" />
        </div>
      </section>

      {/* Leadership Section */}
      <section className="leadership-section">
        <div className="container">
          <h2>Our Leadership</h2>
          <p>Meet the dedicated leaders guiding ANAMOLA's vision for Mozambique</p>
          
          <div className="leadership-grid">
            <div className="leader-card">
              <div className="leader-image">
                <div className="leader-placeholder">
                  <span>Photo</span>
                </div>
              </div>
              <div className="leader-info">
                <h3>VENÂNCIO MONDLANE</h3>
                <div className="leader-divider"></div>
                <p>President</p>
              </div>
            </div>

            <div className="leader-card">
              <div className="leader-image">
                <div className="leader-placeholder">
                  <span>Photo</span>
                </div>
              </div>
              <div className="leader-info">
                <h3>DEPUTY LEADER</h3>
                <div className="leader-divider"></div>
                <p>Deputy President</p>
              </div>
            </div>

            <div className="leader-card">
              <div className="leader-image">
                <div className="leader-placeholder">
                  <span>Photo</span>
                </div>
              </div>
              <div className="leader-info">
                <h3>SECRETARY GENERAL</h3>
                <div className="leader-divider"></div>
                <p>National Chairperson</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission">
        <div className="container">
          <h2>Our Mission</h2>
          <p>
            Anamola is dedicated to building a stronger, more prosperous Mozambique 
            through democratic principles, social justice, and sustainable development. 
            We believe in the power of unity and the strength of our diverse communities.
          </p>
        </div>
      </section>

      {/* Key Areas Section */}
      <section className="key-areas">
        <div className="container">
          <h2>Key Areas of Focus</h2>
          <div className="areas-grid">
            <div className="area-card">
              <h3>Democracy & Governance</h3>
              <p>Strengthening democratic institutions and promoting transparent governance</p>
            </div>
            <div className="area-card">
              <h3>Economic Development</h3>
              <p>Creating opportunities for sustainable economic growth and job creation</p>
            </div>
            <div className="area-card">
              <h3>Social Justice</h3>
              <p>Advocating for equality, human rights, and social inclusion</p>
            </div>
            <div className="area-card">
              <h3>Education & Healthcare</h3>
              <p>Improving access to quality education and healthcare for all Mozambicans</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="container">
          <h2>Join Our Movement</h2>
          <p>Together, we can build a better future for Mozambique</p>
          <Link to="/contact" className="btn btn-primary">Contact Us Today</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
