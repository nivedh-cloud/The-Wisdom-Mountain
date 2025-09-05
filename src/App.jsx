



import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import TopHeader from './components/TopHeader';
import MenuBar from './components/MenuBar';
import LeftNav from './components/LeftNav';
import PageHeader from './components/PageHeader';
import ProphecyOfTheDay from './components/ProphecyOfTheDay';
import GridComponent from './components/GridComponent';
import FamilyTree from './components/FamilyTree';
import ImageCarousel from './components/ImageCarousel';
import Footer from './components/Footer';
import BooksWritersGrid from './components/BooksWritersGrid';
import NamesOfGodGrid from './screens/NamesOfGodGrid';
import OldTestamentNames from './screens/OldTestamentNames';
import NewTestamentNames from './screens/NewTestamentNames';
import carouselData from './assets/data/carouselData.json';
import { carouselImages as importedCarouselImages } from './assets/images/carousel-images';
import './styles/App.css';
import './styles/GlobalStyles.css';
import IsraelMapsTribes from './screens/IsraelMapsTribes';
import { FaUsers, FaCrown, FaGavel, FaMapMarkerAlt, FaClock, FaBook, FaHome, FaSitemap, FaBars, FaTimes } from 'react-icons/fa';

// Translations data
const translations = {
  en: {
    title: 'The Bible Project',
    home: 'Home',
    genealogy: 'Genealogy',
    kings: 'Kings',
    adam: "Adam's Genealogy",
    welcome: 'Welcome to The Bible Project',
    desc: 'Explore genealogies and historical information from the Bible in English and Telugu.'
  },
  te: {
    title: 'ద బైబిల్ ప్రాజెక్ట్',
    home: 'హోమ్',
    genealogy: 'వంశావళి',
    kings: 'రాజులు',
    adam: 'ఆదాం వంశావళి',
    welcome: 'ద బైబిల్ ప్రాజెక్ట్‌కు స్వాగతం',
    desc: 'ఇంగ్లీష్ మరియు తెలుగు భాషల్లో బైబిల్ నుండి వంశావళులు మరియు చారిత్రక సమాచారాన్ని అన్వేషించండి.'
  }
};


function App() {
  const [lang, setLang] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current page from URL path
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    return path.substring(1); // Remove the leading slash
  };

  const [page, setPage] = useState(getCurrentPage());

  // Update page state when URL changes
  useEffect(() => {
    setPage(getCurrentPage());
  }, [location.pathname]);

  // Close mobile menu when page changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [page]);

  // Navigation function that updates both state and URL
  const navigateToPage = (newPage) => {
    setPage(newPage);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
    if (newPage === 'home') {
      navigate('/');
    } else {
      navigate(`/${newPage}`);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking overlay
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Prepare carousel images with language-specific content
  const carouselImages = carouselData.carouselImages.map(image => ({
    src: importedCarouselImages[image.imageIndex],
    alt: image.alt,
    title: image.title[lang] || image.title.en,
    description: image.description[lang] || image.description.en
  }));

  return (
    <ThemeProvider>
      <div className={`app-container ${page === 'home' ? 'home-page' : ''}`}>
        <TopHeader lang={lang} setLang={setLang} />
        <MenuBar lang={lang} page={page} setPage={navigateToPage} setLang={setLang} />
        
        {/* Mobile Menu Toggle Button */}
        {(page === 'genealogy' || page === 'kings' || page === 'judges' || page === 'prophets' || page === 'maps' || page === 'keyeras' || page === 'bookswriters' || ['adam-to-jesus','adam-to-noah','noah-to-abraham','abraham-to-moses','moses-to-david','david-to-hezekiah','before-babylonian-exile','after-babylonian-exile','judah-kings','israel-kings','adam-lineage','abraham-lineage','list-of-judges','list-of-prophets','old-testament-maps','new-testament-maps','israel-maps-tribes','wilderness-wanderings','the-exile','judges-period','united-kingdom','divided-kingdom','return-from-exile','old-testament-books','new-testament-books','biblical-authors','books-by-category','names-of-god','old-testament-names','new-testament-names','old-testament-torah','old-testament-historical','old-testament-wisdom','old-testament-majorProphets','old-testament-minorProphets','new-testament-gospels','new-testament-history','new-testament-paulineEpistles','new-testament-generalEpistles','new-testament-prophecy'].includes(page)) && (
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}
        
        {/* Mobile Overlay */}
        <div 
          className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={closeMobileMenu}
        />
        
        <div className="main-layout">
          {(page === 'genealogy' || page === 'kings' || page === 'judges' || page === 'prophets' || page === 'maps' || page === 'keyeras' || page === 'bookswriters' || ['adam-to-jesus','adam-to-noah','noah-to-abraham','abraham-to-moses','moses-to-david','david-to-hezekiah','before-babylonian-exile','after-babylonian-exile','judah-kings','israel-kings','adam-lineage','abraham-lineage','list-of-judges','list-of-prophets','old-testament-maps','new-testament-maps','israel-maps-tribes','wilderness-wanderings','the-exile','judges-period','united-kingdom','divided-kingdom','return-from-exile','old-testament-books','new-testament-books','biblical-authors','books-by-category','names-of-god','old-testament-names','new-testament-names','old-testament-torah','old-testament-historical','old-testament-wisdom','old-testament-majorProphets','old-testament-minorProphets','new-testament-gospels','new-testament-history','new-testament-paulineEpistles','new-testament-generalEpistles','new-testament-prophecy'].includes(page)) && (
            <LeftNav 
              lang={lang} 
              page={page} 
              navigateToPage={navigateToPage} 
              translations={translations}
              isMobileMenuOpen={isMobileMenuOpen}
              closeMobileMenu={closeMobileMenu}
            />
          )}
          <main className="main-content">
            <Routes>
              <Route path="/" element={
                <div style={{ 
                  position: 'fixed', 
                  top: 0, 
                  left: 0, 
                  width: '100vw', 
                  height: 'calc(100vh - 80px)', /* Leave space for footer */
                  zIndex: 1 
                }}>
                  <ImageCarousel images={carouselImages} autoPlayInterval={10000} />
                  <ProphecyOfTheDay lang={lang} />
                </div>
              } />
              <Route path="/d3-chart" element={
                <GridComponent lang={lang} page={page} />
              } />
              <Route path="/genealogy" element={
                <div className="page-container">
                  <PageHeader 
                    title={lang === 'te' ? 'వంశావళి' : 'Genealogy'}
                    subtitle={lang === 'te' ? 'బైబిల్ వంశావళి విభాగాలను ఎంచుకోండి.' : 'Select a genealogy section from the left.'}
                    icon={<FaUsers />}
                  />
                </div>
              } />
              <Route path="/tree" element={
                <div className="demo-text">{lang === 'te' ? 'వంశావళి ట్రీ (డెమో త్వరలో)' : 'Genealogy Tree (Demo Coming Soon)'}</div>
              } />
              <Route path="/judges" element={
                <div className="page-container">
                  <PageHeader 
                    title={lang === 'te' ? 'న్యాయాధిపతులు' : 'Judges'}
                    subtitle={lang === 'te' ? 'న్యాయాధిపతుల జాబితాను ఎంచుకోండి.' : 'Select a judges section from the left.'}
                    icon={<FaGavel />}
                  />
                </div>
              } />
              <Route path="/prophets" element={
                <div className="page-container">
                  <PageHeader 
                    title={lang === 'te' ? 'ప్రవక్తలు' : 'Prophets'}
                    subtitle={lang === 'te' ? 'ప్రవక్తల జాబితాను ఎంచుకోండి.' : 'Select a prophets section from the left.'}
                    icon={<FaBook />}
                  />
                </div>
              } />
              <Route path="/maps" element={
                <div className="page-container">
                  <PageHeader 
                    title={lang === 'te' ? 'మ్యాప్‌లు' : 'Maps'}
                    subtitle={lang === 'te' ? 'మ్యాప్ విభాగాన్ని ఎంచుకోండి.' : 'Select a maps section from the left.'}
                    icon={<FaMapMarkerAlt />}
                  />
                </div>
              } />
              <Route path="/keyeras" element={
                <div className="page-container">
                  <PageHeader 
                    title={lang === 'te' ? 'ముఖ్య యుగాలు' : 'Key Eras'}
                    subtitle={lang === 'te' ? 'కీలకమైన కాలాలను ఎంచుకోండి.' : 'Select a key era from the left.'}
                    icon={<FaClock />}
                  />
                </div>
              } />
              <Route path="/bookswriters" element={
                <div className="page-container">
                  <PageHeader 
                    title={lang === 'te' ? 'పుస్తకాలు & రచయితలు' : 'Books & Writers'}
                    subtitle={lang === 'te' ? 'బైబిల్ పుస్తకాలు మరియు రచయితల విభాగాన్ని ఎంచుకోండి.' : 'Select a biblical books and writers section from the left.'}
                    icon={<FaBook />}
                  />
                  <BooksWritersGrid lang={lang} page="old-testament-torah" />
                </div>
              } />
              <Route path="/israel-maps-tribes" element={
                <div className="page-container">
                  <PageHeader 
                    title={lang === 'te' ? 'ఇస్రాయేల్ గోత్రాల మ్యాప్' : 'Israel Tribes Map'}
                    subtitle={lang === 'te' ? 'ఇస్రాయేల్ గోత్రాల భూభాగాలను మ్యాప్‌లో చూడండి.' : 'View the territories of the tribes of Israel on the map.'}
                    icon={<FaMapMarkerAlt />}
                  />
                  <IsraelMapsTribes />
                </div>
              } />
              {/* Books and Writers routes */}
              {['old-testament-books', 'new-testament-books', 'biblical-authors', 'books-by-category', 'old-testament-torah', 'old-testament-historical', 'old-testament-wisdom', 'old-testament-majorProphets', 'old-testament-minorProphets', 'new-testament-gospels', 'new-testament-history', 'new-testament-paulineEpistles', 'new-testament-generalEpistles', 'new-testament-prophecy'].map(route => (
                <Route key={route} path={`/${route}`} element={
                  <BooksWritersGrid lang={lang} page={route} />
                } />
              ))}
              {/* Names of God route */}
              <Route path="/names-of-god" element={
                <NamesOfGodGrid lang={lang} />
              } />
              {/* Old Testament Names route */}
              <Route path="/old-testament-names" element={
                <OldTestamentNames lang={lang} />
              } />
              {/* New Testament Names route */}
              <Route path="/new-testament-names" element={
                <NewTestamentNames lang={lang} />
              } />
              {/* Family Tree routes */}
              {['adam-lineage', 'abraham-lineage'].map(route => (
                <Route key={route} path={`/${route}`} element={
                  <FamilyTree treeType={route} />
                } />
              ))}
              {/* GridComponent routes for all other pages */}
              {['adam-to-jesus','adam-to-noah','noah-to-abraham','abraham-to-moses','moses-to-david','david-to-hezekiah','before-babylonian-exile','after-babylonian-exile','judah-kings','israel-kings','list-of-judges','list-of-prophets','old-testament-maps','new-testament-maps','wilderness-wanderings','the-exile','judges-period','united-kingdom','divided-kingdom','return-from-exile'].map(route => (
                <Route key={route} path={`/${route}`} element={
                  <GridComponent lang={lang} page={route} />
                } />
              ))}
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
