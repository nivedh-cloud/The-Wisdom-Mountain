import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaBookOpen, FaRedo } from 'react-icons/fa';
import positiveVerses from '../assets/data/positiveVerses.json';
import './ProphecyOfTheDay.css';

const ProphecyOfTheDay = ({ lang = 'en' }) => {
  const { isDarkMode } = useTheme();
  const [currentVerse, setCurrentVerse] = useState(null);

  // Get a random verse from the collection
  const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * positiveVerses.verses.length);
    return positiveVerses.verses[randomIndex];
  };

  // Get verse for the day (consistent for each day)
  const getVerseOfTheDay = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % positiveVerses.verses.length;
    return positiveVerses.verses[index];
  };

  useEffect(() => {
    // Set verse of the day on component mount
    setCurrentVerse(getVerseOfTheDay());
  }, []);

  const handleRefresh = () => {
    setCurrentVerse(getRandomVerse());
  };

  if (!currentVerse) return null;

  const verse = lang === 'te' ? currentVerse.verseTelugu : currentVerse.verse;
  const reference = lang === 'te' ? currentVerse.referenceTelugu : currentVerse.reference;

  return (
    <div className={`prophecy-of-the-day ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="prophecy-container">
        <div className="prophecy-header">
          <div className="prophecy-title">
            <FaBookOpen className="prophecy-icon" />
            <h2>{lang === 'te' ? 'ఈ రోజు వాక్యం' : 'Prophecy of the Day'}</h2>
          </div>
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            title={lang === 'te' ? 'కొత్త వాక్యం' : 'New Verse'}
          >
            <FaRedo />
          </button>
        </div>
        
        <div className="prophecy-content">
          <blockquote className="verse-text">
            "{verse}"
          </blockquote>
          <cite className="verse-reference">
            — {reference}
          </cite>
        </div>
      </div>
    </div>
  );
};

export default ProphecyOfTheDay;
