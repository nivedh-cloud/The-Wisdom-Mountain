import React, { useState, useEffect } from 'react';
import { FaBell, FaUser, FaTextHeight } from 'react-icons/fa';
import LanguageSwitch from './LanguageSwitch';
import ThemeToggle from './ThemeToggle';
import logoImage from '../assets/images/northMountain.png';

const TopHeader = ({ lang, setLang }) => {
  const [textScale, setTextScale] = useState(1);

  useEffect(() => {
    // Apply text scale to CSS variable
    document.documentElement.style.setProperty('--text-scale', textScale);
    
    // Save to localStorage
    localStorage.setItem('textScale', textScale.toString());
  }, [textScale]);

  useEffect(() => {
    // Load saved text scale from localStorage
    const savedScale = localStorage.getItem('textScale');
    if (savedScale) {
      setTextScale(parseFloat(savedScale));
    }
  }, []);

  const handleTextSizeChange = (e) => {
    setTextScale(parseFloat(e.target.value));
  };

  return (
    <header className="top-header">
      <div className="header-container">
        {/* Logo/Brand Section */}
        <div className="header-brand">
          <div className="brand-logo">
            <img 
              src={logoImage} 
              alt="Wisdom Mountain Logo" 
              className="logo-image"
              onError={(e) => {
                // Fallback to text if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="logo-fallback" style={{display: 'none'}}>🏔️</div>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">The Wisdom Mountain</h1>
            <p className="brand-tagline">Scripture wisdom</p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="header-controls">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Language Switch */}
          <LanguageSwitch lang={lang} setLang={setLang} />
          
          {/* Text Size Control */}
          <div className="text-size-control" style={{"display": "none"}}>
            <FaTextHeight className="text-size-icon" />
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              value={textScale}
              onChange={handleTextSizeChange}
              className="text-size-slider"
              title={`Text Size: ${Math.round(textScale * 100)}%`}
            />
            <span className="text-size-label">{Math.round(textScale * 100)}%</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="header-actions"  style={{"display": "none"}}>
          <button className="header-action-btn notification-btn" style={{"display": "none"}}>
            <FaBell />
            <span className="notification-badge">3</span>
          </button>
          <div className="header-divider"></div>
          <div className="user-profile">
            <div className="user-avatar" style={{"display": "none"}}>
              <FaUser />
            </div>
            <span className="user-name">User</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
