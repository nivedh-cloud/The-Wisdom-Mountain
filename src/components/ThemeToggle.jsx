import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-container theme-position">
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        <div className={`theme-toggle-slider ${isDarkMode ? 'active' : ''}`}>
          <div className="theme-toggle-handle">
            {/* Use glificon classes. If glificons font is not present, CSS will show emoji fallback */}
            <span className={`glificon ${isDarkMode ? 'glificon-moon' : 'glificon-sun'}`} aria-hidden="true"></span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ThemeToggle;
