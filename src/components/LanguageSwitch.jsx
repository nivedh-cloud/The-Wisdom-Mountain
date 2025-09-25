import React, { useCallback } from 'react';

const LanguageSwitch = ({ lang, setLang }) => {
  const isTelugu = lang === 'te';

  const toggleLang = useCallback(() => {
    setLang(isTelugu ? 'en' : 'te');
  }, [isTelugu, setLang]);

  return (
    <div className="theme-toggle-container language-toggle-container language-position">
      <button
        className="theme-toggle language-toggle"
        onClick={toggleLang}
        aria-label="Toggle language"
        title={isTelugu ? 'Telugu' : 'English'}
      >
        <div className={`theme-toggle-slider ${isTelugu ? 'active' : ''}`}>
          <div className="theme-toggle-handle">
            {/* Use glificon-like spans for consistency with ThemeToggle */}
            <span className={`lang-icon ${isTelugu ? 'lang-te' : 'lang-en'}`} aria-hidden="true">
              {isTelugu ? 'తె' : 'En'}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default LanguageSwitch;
