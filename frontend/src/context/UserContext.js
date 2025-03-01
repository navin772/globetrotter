import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('globetrotter_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Ensure score properties are initialized
    const normalizedUserData = {
      ...userData,
      score: userData.score || 0,
      correct_answers: userData.correct_answers || 0,
      total_answers: userData.total_answers || 0
    };
    
    setUser(normalizedUserData);
    localStorage.setItem('globetrotter_user', JSON.stringify(normalizedUserData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('globetrotter_user');
  };

  const updateScore = (correct) => {
    if (user) {
      const updatedUser = {
        ...user,
        score: user.score + (correct ? 1 : 0),
        correct_answers: user.correct_answers + (correct ? 1 : 0),
        total_answers: user.total_answers + 1
      };
      setUser(updatedUser);
      localStorage.setItem('globetrotter_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateScore }}>
      {children}
    </UserContext.Provider>
  );
};