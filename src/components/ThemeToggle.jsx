import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-container">
      <button className="theme-toggle" onClick={toggleTheme}>
        <div className={`theme-toggle-slider ${isDarkMode ? 'active' : ''}`}>
          <div className="theme-toggle-handle">
            {isDarkMode ? <FaMoon size={12} /> : <FaSun size={12} />}
          </div>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;
