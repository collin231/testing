import React from 'react';
import './News.css';

const News = () => {
  const upcomingEvents = [
    {
      date: 'January 15, 2025',
      day: '15',
      month: 'JAN',
      title: 'National Leadership Conference',
      time: '9:00 AM - 5:00 PM',
      location: 'Maputo Convention Center',
      description: 'Annual gathering of ANAMOLA leaders from across Mozambique to discuss strategy and vision for 2025.',
      category: 'Leadership'
    },
    {
      date: 'January 22, 2025',
      day: '22',
      month: 'JAN',
      title: 'Youth Empowerment Workshop',
      time: '2:00 PM - 6:00 PM',
      location: 'Beira Youth Center',
      description: 'Interactive workshop focused on developing leadership skills and political awareness among young Mozambicans.',
      category: 'Youth'
    },
    {
      date: 'February 5, 2025',
      day: '05',
      month: 'FEB',
      title: 'Community Town Hall Meeting',
      time: '6:00 PM - 8:00 PM',
      location: 'Nampula Community Hall',
      description: 'Open forum for community members to discuss local issues and ANAMOLA\'s role in addressing them.',
      category: 'Community'
    },
    {
      date: 'February 18, 2025',
      day: '18',
      month: 'FEB',
      title: 'Policy Development Forum',
      time: '10:00 AM - 4:00 PM',
      location: 'Quelimane Business Center',
      description: 'Expert panel discussion on economic development policies and their implementation in Mozambique.',
      category: 'Policy'
    },
    {
      date: 'March 3, 2025',
      day: '03',
      month: 'MAR',
      title: 'Women\'s Leadership Summit',
      time: '9:00 AM - 6:00 PM',
      location: 'Tete Conference Hall',
      description: 'Empowering women leaders in politics and community development across Mozambique.',
      category: 'Leadership'
    },
    {
      date: 'March 15, 2025',
      day: '15',
      month: 'MAR',
      title: 'Regional Campaign Launch',
      time: '3:00 PM - 7:00 PM',
      location: 'Pemba City Square',
      description: 'Official launch of ANAMOLA\'s regional campaign initiatives in northern Mozambique.',
      category: 'Campaign'
    }
  ];

  const featuredStories = [
    {
      id: 1,
      date: 'December 15, 2024',
      title: 'ANAMOLA Movement Officially Launched',
      category: 'Movement Launch',
      summary: 'The ANAMOLA political movement was officially launched today in Maputo, marking a new chapter in Mozambique\'s political landscape.',
      readTime: '5 min read'
    },
    {
      id: 2,
      date: 'December 10, 2024',
      title: 'Community Outreach Program Launched',
      category: 'Community',
      summary: 'ANAMOLA has launched a comprehensive community outreach program aimed at understanding the needs of Mozambican communities.',
      readTime: '3 min read'
    },
    {
      id: 3,
      date: 'December 5, 2024',
      title: 'Youth Engagement Initiative',
      category: 'Youth',
      summary: 'Our new youth engagement initiative focuses on empowering young Mozambicans to become active participants in the country\'s future.',
      readTime: '4 min read'
    }
  ];

  const recentUpdates = [
    {
      id: 1,
      date: 'November 30, 2024',
      title: 'Policy Development Committee Formed',
      category: 'Policy',
      summary: 'ANAMOLA has established a policy development committee to create comprehensive solutions for Mozambique\'s key challenges.',
      status: 'Active'
    },
    {
      id: 2,
      date: 'November 25, 2024',
      title: 'Regional Office Opening',
      category: 'Infrastructure',
      summary: 'New regional office opened in Beira to better serve central Mozambique communities.',
      status: 'Completed'
    },
    {
      id: 3,
      date: 'November 20, 2024',
      title: 'Member Registration System',
      category: 'Technology',
      summary: 'Online member registration system launched to streamline the joining process.',
      status: 'Live'
    },
    {
      id: 4,
      date: 'November 15, 2024',
      title: 'Training Program Launch',
      category: 'Education',
      summary: 'Leadership training program for new members begins next month.',
      status: 'Upcoming'
    }
  ];

  return (
    <div className="news-page">
      {/* Hero Section */}
      <section className="news-hero">
        <div className="container">
          <h1>Latest News & Events</h1>
          <p className="subtitle">Stay updated with ANAMOLA's activities and developments</p>
          <p className="hero-description">
            Discover the latest news, upcoming events, and important announcements 
            from the ANAMOLA political movement as we work towards a better Mozambique.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <div className="content-sections">
        {/* Events Section */}
        <section className="section-table events-section">
          <div className="container">
            <div className="section-header">
              <h2>Events</h2>
              <p className="section-subtitle">Upcoming events and activities</p>
            </div>
            
            <div className="table-container">
              <div className="table-header">
                <div className="header-cell">Date</div>
                <div className="header-cell">Event</div>
                <div className="header-cell">Location</div>
                <div className="header-cell">Category</div>
                <div className="header-cell">Action</div>
              </div>
              
              <div className="table-body">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="table-row">
                    <div className="table-cell date-cell">
                      <div className="event-date-display">
                        <span className="event-day">{event.day}</span>
                        <span className="event-month">{event.month}</span>
                      </div>
                    </div>
                    <div className="table-cell event-cell">
                      <h3>{event.title}</h3>
                      <p className="event-time">🕒 {event.time}</p>
                      <p className="event-description">{event.description}</p>
                    </div>
                    <div className="table-cell location-cell">
                      <span>{event.location}</span>
                    </div>
                    <div className="table-cell category-cell">
                      <span className="category-badge">{event.category}</span>
                    </div>
                    <div className="table-cell action-cell">
                      <button className="event-register">Register</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stories Section */}
        <section className="section-table stories-section">
          <div className="container">
            <div className="section-header">
              <h2>Stories</h2>
              <p className="section-subtitle">Featured stories and in-depth coverage</p>
            </div>
            
            <div className="table-container">
              <div className="table-header">
                <div className="header-cell">Date</div>
                <div className="header-cell">Story</div>
                <div className="header-cell">Category</div>
                <div className="header-cell">Read Time</div>
                <div className="header-cell">Action</div>
              </div>
              
              <div className="table-body">
                {featuredStories.map((story, index) => (
                  <div key={story.id} className="table-row">
                    <div className="table-cell date-cell">
                      <span className="story-date">{story.date}</span>
                    </div>
                    <div className="table-cell story-cell">
                      <h3>{story.title}</h3>
                      <p className="story-summary">{story.summary}</p>
                    </div>
                    <div className="table-cell category-cell">
                      <span className="category-badge">{story.category}</span>
                    </div>
                    <div className="table-cell time-cell">
                      <span className="read-time">{story.readTime}</span>
                    </div>
                    <div className="table-cell action-cell">
                      <a href="#" className="read-more-btn">Read More</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Updates Section */}
        <section className="section-table updates-section">
          <div className="container">
            <div className="section-header">
              <h2>Updates</h2>
              <p className="section-subtitle">Latest announcements and developments</p>
            </div>
            
            <div className="table-container">
              <div className="table-header">
                <div className="header-cell">Date</div>
                <div className="header-cell">Update</div>
                <div className="header-cell">Category</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Action</div>
              </div>
              
              <div className="table-body">
                {recentUpdates.map((update, index) => (
                  <div key={update.id} className="table-row">
                    <div className="table-cell date-cell">
                      <span className="update-date">{update.date}</span>
                    </div>
                    <div className="table-cell update-cell">
                      <h3>{update.title}</h3>
                      <p className="update-summary">{update.summary}</p>
                    </div>
                    <div className="table-cell category-cell">
                      <span className="category-badge">{update.category}</span>
                    </div>
                    <div className="table-cell status-cell">
                      <span className={`status-badge ${update.status.toLowerCase()}`}>
                        {update.status}
                      </span>
                    </div>
                    <div className="table-cell action-cell">
                      <button className="details-btn">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="newsletter-section">
          <div className="container">
            <h2>Stay Connected</h2>
            <p className="section-subtitle">Subscribe to our newsletter for the latest updates and news</p>
            <div className="newsletter-content">
              <p>
                Never miss an important announcement, event, or development. 
                Join thousands of Mozambicans who stay informed about ANAMOLA's mission.
              </p>
              <form className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  required 
                />
                <button type="submit" className="btn btn-primary">Subscribe</button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default News;
