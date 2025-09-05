
import React, { useState } from 'react';
import { FaHome, FaUsers, FaCrown, FaSitemap, FaGavel, FaUser, FaMapMarkerAlt, FaClock, FaBook, FaChevronDown } from 'react-icons/fa';
import menuConfig from '../assets/data/menuConfig.json';

const MenuBar = ({ lang, page, setPage, setLang }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const handleMenuClick = (menuType) => {
    if (menuType === 'home') {
      setPage('home');
    } else {
      // Get the first item from the corresponding menu
      const menuItems = menuConfig.menus[menuType === 'family-trees' ? 'familytrees' : menuType];
      if (menuItems && menuItems.length > 0) {
        setPage(menuItems[0].key);
      } else {
        setPage(menuType);
      }
    }
    setActiveDropdown(null);
  };

  const handleDropdownClick = (e, menuType) => {
    e.preventDefault();
    setActiveDropdown(activeDropdown === menuType ? null : menuType);
  };

  // Helper function to check if a page is active for a menu
  const isMenuActive = (menuType, pageKeys = []) => {
    if (page === menuType) return true;
    return pageKeys.includes(page);
  };

  const menuItems = [
    {
      key: 'home',
      icon: FaHome,
      label: lang === 'te' ? 'హోమ్' : 'Home',
      onClick: () => handleMenuClick('home'),
      active: page === 'home'
    },
    
    {
      key: 'genealogy',
      icon: FaUsers,
      label: lang === 'te' ? 'వంశావళి' : 'Genealogy',
      onClick: () => handleMenuClick('genealogy'),
      active: isMenuActive('genealogy', ['adam-to-noah','noah-to-abraham','abraham-to-moses','moses-to-david','david-to-hezekiah','before-babylonian-exile','after-babylonian-exile','tree'])
    },
    {
      key: 'bookswriters',
      icon: FaBook,
      label: lang === 'te' ? 'పుస్తకాలు & రచయితలు' : 'Books & Writers',
      onClick: () => handleMenuClick('bookswriters'),
      active: isMenuActive('bookswriters', ['old-testament-books','new-testament-books','biblical-authors','books-by-category'])
    },
    {
      key: 'judges',
      icon: FaGavel,
      label: lang === 'te' ? 'న్యాయాధిపతులు' : 'Judges',
      onClick: () => handleMenuClick('judges'),
      active: isMenuActive('judges', ['list-of-judges'])
    },
    {
      key: 'kings',
      icon: FaCrown,
      label: lang === 'te' ? 'రాజులు' : 'Kings',
      onClick: () => handleMenuClick('kings'),
      active: isMenuActive('kings', ['judah-kings','israel-kings'])
    },
    {
      key: 'prophets',
      icon: FaUser,
      label: lang === 'te' ? 'ప్రవక్తలు' : 'Prophets',
      onClick: () => handleMenuClick('prophets'),
      active: isMenuActive('prophets', ['list-of-prophets'])
    },
    {
      key: 'maps',
      icon: FaMapMarkerAlt,
      label: lang === 'te' ? 'మ్యాప్‌లు' : 'Maps',
      onClick: () => handleMenuClick('maps'),
      active: isMenuActive('maps', ['old-testament-maps','new-testament-maps'])
    },
    {
      key: 'keyeras',
      icon: FaClock,
      label: lang === 'te' ? 'ముఖ్య యుగాలు' : 'Key Eras',
      onClick: () => handleMenuClick('keyeras'),
      active: isMenuActive('keyeras', ['wilderness-wanderings','the-exile','judges-period','united-kingdom','divided-kingdom','return-from-exile'])
    }

  ];

  return (
    <nav className="modern-menu-bar">
      <div className="menu-container">
        {/* Main Navigation */}
        <div className="menu-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${item.active ? 'active' : ''}`}
              onClick={item.onClick}
            >
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;
