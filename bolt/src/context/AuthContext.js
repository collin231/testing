import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('user');
    const storedProfile = localStorage.getItem('profile');
    const storedSession = localStorage.getItem('session');

    if (storedUser && storedProfile && storedSession) {
      try {
        const userData = JSON.parse(storedUser);
        const profileData = JSON.parse(storedProfile);
        const sessionData = JSON.parse(storedSession);

        // Check if session is still valid (basic check)
        if (sessionData.access_token) {
          setUser(userData);
          setProfile(profileData);
        } else {
          // Clear invalid session
          localStorage.removeItem('user');
          localStorage.removeItem('profile');
          localStorage.removeItem('session');
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        localStorage.removeItem('session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData, profileData, sessionData) => {
    setUser(userData);
    setProfile(profileData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('profile', JSON.stringify(profileData));
    localStorage.setItem('session', JSON.stringify(sessionData));
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    localStorage.removeItem('session');
  };

  const value = {
    user,
    profile,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
