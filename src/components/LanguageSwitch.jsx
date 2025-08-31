import React from 'react';

const LanguageSwitch = ({ lang, setLang }) => {
  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        title="English"
      >
        <span className="lang-text">En</span>
      </button>
      <button
        className={`lang-btn ${lang === 'te' ? 'active' : ''}`}
        onClick={() => setLang('te')}
        title="Telugu"
      >
        <span className="lang-icon">తె</span>
      </button>
    </div>
  );
};

export default LanguageSwitch;
