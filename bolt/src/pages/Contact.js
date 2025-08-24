import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        console.error('Contact submission error:', errorData);
      }
    } catch (error) {
      console.error('Contact submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact">
      <div className="container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p className="subtitle">Get in touch with the Anamola movement</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>
              We'd love to hear from you! Whether you have questions about our movement, 
              want to get involved, or have suggestions for improvement, please reach out.
            </p>
            
            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon"></div>
                <div className="contact-info">
                  <h3>Address</h3>
                  <p>Maputo Convention Center</p>
                  <p>Central District</p>
                  <p>Maputo, Mozambique</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon"></div>
                <div className="contact-info">
                  <h3>Email</h3>
                  <p>info@anamola.org.mz</p>
                  <p>support@anamola.org.mz</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon"></div>
                <div className="contact-info">
                  <h3>Phone</h3>
                  <p>+258 84 XXX XXXX</p>
                  <p>+258 85 XXX XXXX</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon"></div>
                <div className="contact-info">
                  <h3>Office Hours</h3>
                  <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p>Saturday: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>

            <div className="social-media">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="https://facebook.com/anamola" target="_blank" rel="noopener noreferrer" className="social-link">Facebook</a>
                <a href="https://twitter.com/anamola" target="_blank" rel="noopener noreferrer" className="social-link">Twitter</a>
                <a href="https://instagram.com/anamola" target="_blank" rel="noopener noreferrer" className="social-link">Instagram</a>
                <a href="https://youtube.com/anamola" target="_blank" rel="noopener noreferrer" className="social-link">YouTube</a>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="membership">Membership</option>
                  <option value="volunteer">Volunteering</option>
                  <option value="donation">Donation</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Enter your message here..."
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
              
              {submitStatus === 'success' && (
                <div className="success-message">
                  Thank you for your message! We will get back to you soon.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="error-message">
                  Failed to send message. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="contact-map">
          <h2>Visit Our Office</h2>
          <p>
            Our main office is located in the heart of Maputo. We welcome visitors 
            during office hours for meetings and discussions about our movement.
          </p>
          <div className="map-placeholder">
            <div className="map-content">
              <h3>Anamola Headquarters</h3>
              <p>Maputo, Mozambique</p>
              <p>Central District</p>
              <p>Near Independence Square</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
