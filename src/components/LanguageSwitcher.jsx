const LanguageSwitcher = ({ lang, setLang }) => (
  <div className="language-switcher">
    <span 
      className={`language-option ${lang === 'en' ? 'active' : ''}`} 
      onClick={() => setLang('en')}
    >
      E
    </span>
    <span 
      className={`language-option ${lang === 'te' ? 'active' : ''}`} 
      onClick={() => setLang('te')}
    >
      తె
    </span>
  </div>
);
export default LanguageSwitcher;
