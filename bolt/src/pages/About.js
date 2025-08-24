import React from 'react';
import './About.css';

const About = () => {
  const journeySteps = [
    {
      year: '2020',
      title: 'Foundation',
      description: 'Anamola was founded with a vision for a stronger, more prosperous Mozambique.',
      icon: ''
    },
    {
      year: '2021',
      title: 'Growth',
      description: 'Party membership grew rapidly as citizens embraced our vision for change.',
      icon: ''
    },
    {
      year: '2022',
      title: 'Movement Formation',
      description: 'ANAMOLA officially emerged as a political movement, with the first organizational structures and leadership roles being established.',
      icon: ''
    },
    {
      year: '2023',
      title: 'Community Engagement',
      description: 'Expanded outreach programs, community meetings, and began building grassroots support across different regions of Mozambique.',
      icon: ''
    },
    {
      year: '2024',
      title: 'National Recognition',
      description: 'ANAMOLA gained national recognition as a legitimate political movement, with growing membership and support from various sectors of society.',
      icon: ''
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>About ANAMOLA</h1>
          <p className="subtitle">Para um Moçambique Livre e Autónomo</p>
          <p className="hero-description">
            Discover the story behind ANAMOLA, our journey from vision to reality, 
            and the principles that guide our mission for a better Mozambique.
          </p>
        </div>
      </section>

      {/* Journey Flow Section */}
      <section className="journey-section">
        <div className="container">
          <h2>Our Journey</h2>
          <p className="section-subtitle">From Vision to Reality: The ANAMOLA Story</p>
          
          <div className="journey-timeline">
            {journeySteps.map((step, index) => (
              <div key={index} className={`journey-step ${index % 2 === 0 ? 'left' : 'right'}`}>
                <div className="step-content">
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-year">{step.year}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <div className="timeline-connector"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="story-section">
        <div className="container">
          <h2>Our Story</h2>
          <div className="story-content">
            <div className="story-text">
              <p>
                Anamola was founded with a vision to create a stronger, more prosperous 
                Mozambique. Our movement emerged from the recognition that true progress 
                comes from unity, democratic principles, and a commitment to social justice.
              </p>
              <p>
                We believe that every Mozambican deserves the opportunity to thrive in a 
                society that values equality, human rights, and sustainable development. 
                Our name "Anamola" represents our commitment to building bridges between 
                communities and fostering a sense of national unity.
              </p>
              <p>
                The movement began as a grassroots initiative, born from conversations 
                in communities across Mozambique about the need for change. What started 
                as a small group of concerned citizens has grown into a national movement 
                dedicated to transforming our nation's future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Core Values</h2>
          <p className="section-subtitle">The Principles That Guide Our Mission</p>
          
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon"></div>
              <h3>Unity</h3>
              <p>Bringing together Mozambicans from all walks of life</p>
            </div>
            <div className="value-item">
              <div className="value-icon"></div>
              <h3>Democracy</h3>
              <p>Upholding democratic principles and citizen participation</p>
            </div>
            <div className="value-item">
              <div className="value-icon"></div>
              <h3>Justice</h3>
              <p>Advocating for social justice and equality for all</p>
            </div>
            <div className="value-item">
              <div className="value-icon"></div>
              <h3>Progress</h3>
              <p>We work towards sustainable development and economic prosperity for Mozambique.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="vision-section">
        <div className="container">
          <h2>Our Vision for Mozambique</h2>
          <div className="vision-content">
            <p>
              We envision a Mozambique where every citizen has access to quality education, 
              healthcare, and economic opportunities. A nation where democratic institutions 
              are strong, corruption is eliminated, and the rule of law prevails.
            </p>
            <p>
              Our goal is to build a society that celebrates its cultural diversity while 
              working towards common objectives that benefit all Mozambicans, regardless 
              of their background or circumstances.
            </p>
            <p>
              We see a future where Mozambique stands as a beacon of hope, progress, and 
              unity in Africa - a model for other nations to follow in their own development journeys.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <div className="container">
          <h2>Join Our Movement</h2>
          <p>
            Anamola is more than a political movement - it's a call to action for all 
            Mozambicans who believe in a better future. Whether you're a student, 
            professional, community leader, or concerned citizen, there's a place for 
            you in our movement.
          </p>
          <p>
            Together, we can build the Mozambique we all deserve - a nation that stands 
            as a beacon of hope, progress, and unity in Africa.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
