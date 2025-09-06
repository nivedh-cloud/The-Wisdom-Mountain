

import menuConfig from '../assets/data/menuConfig.json';
import { FaSearch, FaSignOutAlt, FaMoon, FaBook, FaBookOpen, FaUser, FaList, FaTimes } from 'react-icons/fa';
import { FaHome, FaUsers, FaCrown, FaSitemap, FaGavel, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { GiHolyGrail } from 'react-icons/gi';
import { useState } from 'react';

// Icon component mapping for React Icons
const IconComponents = {
  FaBook,
  FaBookOpen,
  FaUser,
  FaCrown,
  FaMapMarkerAlt,
  FaClock,
  FaSitemap,
  GiHolyGrail
};

// Glyphicon mapping for menu items
const glyphiconMap = {
  FaUser: 'glyphicon-user',
  FaCrown: 'glyphicon-king',
  FaTree: 'glyphicon-tree-deciduous', 
  FaBible: 'glyphicon-book',
  FaUserFriends: 'glyphicon-user',
  GiCrownCoin: 'glyphicon-king',
  FaBook: 'glyphicon-book',
  FaBookOpen: 'glyphicon-book-open',
  FaList: 'glyphicon-list',
  'glyphicon-user': 'glyphicon-user',
  'glyphicon-map-marker': 'glyphicon-map-marker',
  'glyphicon-time': 'glyphicon-time'
};

// Component for rendering glyphicon
const GlyphIcon = ({ iconName, className = '' }) => (
  <span className={`glyphicon ${glyphiconMap[iconName] || iconName || 'glyphicon-user'} ${className}`}></span>
);

// Component for rendering both React Icons and Glyphicons
const MenuIcon = ({ iconName, iconColor, className = '' }) => {
  // Check if it's a React Icon
  const IconComponent = IconComponents[iconName];
  
  if (IconComponent) {
    return <IconComponent className={className} style={{ color: iconColor }} />;
  }
  
  // Fallback to Glyphicon
  return <GlyphIcon iconName={iconName} className={className} />;
};

const LeftNav = ({ lang, page, navigateToPage, translations, isMobileMenuOpen, closeMobileMenu }) => {
  // Search state
  const [search, setSearch] = useState('');

  // Handle navigation with mobile menu close
  const handleNavigation = (pageKey) => {
    navigateToPage(pageKey);
    if (closeMobileMenu) {
      closeMobileMenu();
    }
  };

  // Determine which menu to show
  let menuType = 'genealogy';
  if (page === 'kings' || ['judah-kings','israel-kings'].includes(page)) menuType = 'kings';
  if (page === 'family-trees' || ['adam-lineage','abraham-lineage'].includes(page)) menuType = 'familytrees';
  if (page === 'judges' || ['list-of-judges'].includes(page)) menuType = 'judges';
  if (page === 'prophets' || ['list-of-prophets'].includes(page)) menuType = 'prophets';
  if (page === 'maps' || ['old-testament-maps','new-testament-maps','israel-maps-tribes'].includes(page)) menuType = 'maps';
  if (page === 'keyeras' || ['wilderness-wanderings','the-exile','judges-period','united-kingdom','divided-kingdom','return-from-exile'].includes(page)) menuType = 'keyeras';
  if (page === 'bookswriters' || ['old-testament-books','new-testament-books','biblical-authors','books-by-category','names-of-god','old-testament-names','new-testament-names','old-testament-torah','old-testament-historical','old-testament-wisdom','old-testament-majorProphets','old-testament-minorProphets','new-testament-gospels','new-testament-history','new-testament-paulineEpistles','new-testament-generalEpistles','new-testament-prophecy'].includes(page)) menuType = 'bookswriters';
  if (page === 'genealogy' || ['adam-to-jesus','adam-to-noah','noah-to-abraham','abraham-to-moses','moses-to-david','david-to-hezekiah','before-babylonian-exile','after-babylonian-exile'].includes(page)) menuType = 'genealogy';
  
  // Menu header from JSON

  const menuHeader = menuConfig.menuHeaders[menuType][lang];
  // Menu items
  const menuItems = menuConfig.menus[menuType] || [];

  const filteredItems = Array.isArray(menuItems)
    ? menuItems.filter(item => item.label[lang].toLowerCase().includes(search.toLowerCase()))
    : [];

  // Toggle accordion sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Render accordion-style Books & Writers navigation
  const renderBooksAccordion = () => {
    return (
      <div className="books-accordion">
        {/* Old Testament Section */}
        <div className="accordion-section">
          <button 
            className="accordion-main-header"
            onClick={() => toggleSection('oldTestament')}
          >
            <div className="main-header-content">
              <FaBook className="main-header-icon" />
              <span>{lang === 'te' ? 'పాత నిబంధన పుస్తకాలు' : 'Old Testament Books'}</span>
            </div>
            {expandedSections.oldTestament ? <FaChevronDown /> : <FaChevronRight />}
          </button>
          {expandedSections.oldTestament && (
            <div className="accordion-content">
              {Object.entries(biblicalBooksData.oldTestament).map(([category, books]) => (
                <div key={category} className="sub-category-section">
                  <button 
                    className="accordion-sub-header"
                    onClick={() => handleNavigation(`old-testament-${category}`)}
                  >
                    <div className="sub-header-content">
                      <span className="sub-category-icon">📚</span>
                      <span>
                        {category === 'torah' && (lang === 'te' ? 'ధర్మశాస్త్రం' : 'Torah/Law')}
                        {category === 'historical' && (lang === 'te' ? 'చరిత్ర పుస్తకాలు' : 'Historical Books')}
                        {category === 'wisdom' && (lang === 'te' ? 'జ్ఞాన పుస్తకాలు' : 'Wisdom Books')}
                        {category === 'majorProphets' && (lang === 'te' ? 'ప్రధాన ప్రవక్తలు' : 'Major Prophets')}
                        {category === 'minorProphets' && (lang === 'te' ? 'చిన్న ప్రవక్తలు' : 'Minor Prophets')}
                      </span>
                    </div>
                    <span className="book-count">({books.length})</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Testament Section */}
        <div className="accordion-section">
          <button 
            className="accordion-main-header"
            onClick={() => toggleSection('newTestament')}
          >
            <div className="main-header-content">
              <FaBookOpen className="main-header-icon" />
              <span>{lang === 'te' ? 'కొత్త నిబంధన పుస్తకాలు' : 'New Testament Books'}</span>
            </div>
            {expandedSections.newTestament ? <FaChevronDown /> : <FaChevronRight />}
          </button>
          {expandedSections.newTestament && (
            <div className="accordion-content">
              {Object.entries(biblicalBooksData.newTestament).map(([category, books]) => (
                <div key={category} className="sub-category-section">
                  <button 
                    className="accordion-sub-header"
                    onClick={() => handleNavigation(`new-testament-${category}`)}
                  >
                    <div className="sub-header-content">
                      <span className="sub-category-icon">📖</span>
                      <span>
                        {category === 'gospels' && (lang === 'te' ? 'సువార్తలు' : 'Gospels')}
                        {category === 'history' && (lang === 'te' ? 'చరిత్ర' : 'History')}
                        {category === 'paulineEpistles' && (lang === 'te' ? 'పౌలు లేఖలు' : 'Pauline Epistles')}
                        {category === 'generalEpistles' && (lang === 'te' ? 'సాధారణ లేఖలు' : 'General Epistles')}
                        {category === 'prophecy' && (lang === 'te' ? 'ప్రవచనం' : 'Prophecy')}
                      </span>
                    </div>
                    <span className="book-count">({books.length})</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        

        {/* Names of God Section */}
        <div className="accordion-section">
          <button 
            className="accordion-main-header"
            onClick={() => toggleSection('namesOfGod')}
          >
            <div className="main-header-content">
              <span className="main-header-icon" style={{ color: '#8b5cf6' }}>🏆</span>
              <span>{lang === 'te' ? 'దేవుని నామాలు' : 'Names of God'}</span>
            </div>
            {expandedSections.namesOfGod ? <FaChevronDown /> : <FaChevronRight />}
          </button>
          {expandedSections.namesOfGod && (
            <div className="accordion-content">
              <div className="sub-category-section">
                <button 
                  className="accordion-sub-header"
                  onClick={() => handleNavigation('old-testament-names')}
                >
                  <div className="sub-header-content">
                    <span className="sub-category-icon">📜</span>
                    <span>{lang === 'te' ? 'పాత నిబంధన నామాలు' : 'Old Testament Names'}</span>
                  </div>
                </button>
              </div>
              <div className="sub-category-section">
                <button 
                  className="accordion-sub-header"
                  onClick={() => handleNavigation('new-testament-names')}
                >
                  <div className="sub-header-content">
                    <span className="sub-category-icon">✝️</span>
                    <span>{lang === 'te' ? 'కొత్త నిబంధన నామాలు' : 'New Testament Names'}</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Determine if left nav should be hidden
  const shouldHideLeftNav = ['prophets', 'judges'].includes(menuType);
  
  // Debug log (remove in production)
  if (shouldHideLeftNav) {
    console.log('🔻 Hiding left nav for:', { page, menuType, shouldHideLeftNav });
  }

  return (
    <aside 
      className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${shouldHideLeftNav ? 'left-nav-hidden' : ''}`}
      style={shouldHideLeftNav ? { display: 'none !important' } : {}}
    >
      {/* Mobile close button */}
      <button 
        className="sidebar-close-button"
        onClick={closeMobileMenu}
        aria-label="Close menu"
      >
        <FaTimes />
      </button>
      
      <div className="sidebar-header">{menuHeader}</div>
      
      {/* Search Bar - only show for non-accordion modes */}
      {!['bookswriters', 'judges', 'kings', 'prophets', 'maps', 'keyeras'].includes(menuType) && (
        <div className="sidebar-search-container">
          <div className="sidebar-search-wrapper">
            <FaSearch className="sidebar-search-icon" />
            <input
              className="sidebar-search sidebar-search-padded"
              placeholder={lang === 'te' ? 'వెతకండి...' : 'Search...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Simple menu rendering for all menu types including bookswriters */}
      <ul className="sidebar-menu">
        {filteredItems.map(item => {
          return (
            <li key={item.key} className={item.key === 'tree' ? 'menu-item-tree' : ''}>
              <button className={`sidebar-menu-item ${page === item.key ? 'active' : ''}`} onClick={() => handleNavigation(item.key)}>
                {item.key === 'adam-to-jesus' ? (
                  <FaSitemap className="sidebar-menu-icon" />
                ) : (
                  <MenuIcon 
                    iconName={item.icon} 
                    iconColor={item.iconColor} 
                    className="sidebar-menu-icon" 
                  />
                )}
                <span className="nav-label">{item.label[lang]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
export default LeftNav;
