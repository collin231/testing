import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import './Header.css';
import Logo from '../picture/Logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <img src={Logo} alt="Anamola Logo" />
            <span className="logo-text">ANAMOLA</span>
          </Link>
        </div>
        
        <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={closeMenu} className={location.pathname === '/' ? 'active' : ''}>
            Home
          </Link>
          <Link to="/about" onClick={closeMenu} className={location.pathname === '/about' ? 'active' : ''}>
            About
          </Link>
          <Link to="/news" onClick={closeMenu} className={location.pathname === '/news' ? 'active' : ''}>
            News
          </Link>
          <Link to="/membership" onClick={closeMenu} className={location.pathname === '/membership' ? 'active' : ''}>
            Membership
          </Link>
          <Link to="/contact" onClick={closeMenu} className={location.pathname === '/contact' ? 'active' : ''}>
            Contact
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={closeMenu} className={location.pathname.startsWith('/dashboard') ? 'active' : ''}>
                Dashboard
              </Link>
              <Link to="/store" onClick={closeMenu} className={location.pathname === '/store' ? 'active' : ''}>
                Store
              </Link>
              {isAdminAuthenticated && (
                <Link to="/admin" onClick={closeMenu} className={location.pathname === '/admin' ? 'active' : ''}>
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeMenu} className={location.pathname === '/login' ? 'active' : ''}>
              Login
            </Link>
          )}
        </nav>

        <button className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
