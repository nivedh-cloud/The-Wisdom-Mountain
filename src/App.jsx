



import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import TopHeader from './components/TopHeader';
import MenuBar from './components/MenuBar';
import LeftNav from './components/LeftNav';
import GridComponent from './components/GridComponent';
import FamilyTree from './components/FamilyTree';
import ImageCarousel from './components/ImageCarousel';
import Footer from './components/Footer';
import BooksWritersGrid from './components/BooksWritersGrid';
import carouselData from './assets/data/carouselData.json';
import './styles/App.css';
import './styles/GlobalStyles.css';
import IsraelMapsTribes from './screens/IsraelMapsTribes';

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
  const [page, setPage] = useState('home');

  // Prepare carousel images with language-specific content
  const carouselImages = carouselData.carouselImages.map(image => ({
    src: image.src,
    alt: image.alt,
    title: image.title[lang] || image.title.en,
    description: image.description[lang] || image.description.en
  }));

  return (
    <ThemeProvider>
      <div className={`app-container ${page === 'home' ? 'home-page' : ''}`}>
        <TopHeader lang={lang} setLang={setLang} />
        <MenuBar lang={lang} page={page} setPage={setPage} setLang={setLang} />
        <div className="main-layout">
          {(page === 'genealogy' || page === 'kings' || page === 'judges' || page === 'prophets' || page === 'maps' || page === 'keyeras' || page === 'bookswriters' || ['adam-to-jesus','adam-to-noah','noah-to-abraham','abraham-to-moses','moses-to-david','david-to-hezekiah','before-babylonian-exile','after-babylonian-exile','judah-kings','israel-kings','adam-lineage','abraham-lineage','list-of-judges','list-of-prophets','old-testament-maps','new-testament-maps','israel-maps-tribes','wilderness-wanderings','the-exile','judges-period','united-kingdom','divided-kingdom','return-from-exile','old-testament-books','new-testament-books','biblical-authors','books-by-category','old-testament-torah','old-testament-historical','old-testament-wisdom','old-testament-majorProphets','old-testament-minorProphets','new-testament-gospels','new-testament-history','new-testament-paulineEpistles','new-testament-generalEpistles','new-testament-prophecy'].includes(page)) && (
            <LeftNav
              lang={lang}
              page={page}
              setPage={setPage}
              translations={translations}
            />
          )}
          <main className="main-content">
            {page === 'home' && (
              <ImageCarousel images={carouselImages} autoPlayInterval={6000} />
            )}
            {page === 'd3-chart' && (
              <GridComponent lang={lang} page={page} />
            )}
            {page === 'genealogy' && (
              <div className="page-container">
                <h2 className="page-title-medium">{lang === 'te' ? 'వంశావళి' : 'Genealogy'}</h2>
                <p className="page-description-medium">{lang === 'te' ? 'బైబిల్ వంశావళి విభాగాలను ఎంచుకోండి.' : 'Select a genealogy section from the left.'}</p>
              </div>
            )}
            {page === 'tree' && <div className="demo-text">{lang === 'te' ? 'వంశావళి ట్రీ (డెమో త్వరలో)' : 'Genealogy Tree (Demo Coming Soon)'}</div>}
            {page === 'judges' && (
              <div className="page-container">
                <h2 className="page-title-medium">{lang === 'te' ? 'న్యాయాధిపతులు' : 'Judges'}</h2>
                <p className="page-description-medium">{lang === 'te' ? 'న్యాయాధిపతుల జాబితాను ఎంచుకోండి.' : 'Select a judges section from the left.'}</p>
              </div>
            )}
            {page === 'prophets' && (
              <div className="page-container">
                <h2 className="page-title-medium">{lang === 'te' ? 'ప్రవక్తలు' : 'Prophets'}</h2>
                <p className="page-description-medium">{lang === 'te' ? 'ప్రవక్తల జాబితాను ఎంచుకోండి.' : 'Select a prophets section from the left.'}</p>
              </div>
            )}
            {page === 'maps' && (
              <div className="page-container">
                <h2 className="page-title-medium">{lang === 'te' ? 'మ్యాప్‌లు' : 'Maps'}</h2>
                <p className="page-description-medium">{lang === 'te' ? 'మ్యాప్ విభాగాన్ని ఎంచుకోండి.' : 'Select a maps section from the left.'}</p>
              </div>
            )}
            {page === 'keyeras' && (
              <div className="page-container">
                <h2 className="page-title-medium">{lang === 'te' ? 'ముఖ్య యుగాలు' : 'Key Eras'}</h2>
                <p className="page-description-medium">{lang === 'te' ? 'కీలకమైన కాలాలను ఎంచుకోండి.' : 'Select a key era from the left.'}</p>
              </div>
            )}
            {page === 'bookswriters' && (
              <div className="page-container">
                <h2 className="page-title-medium">{lang === 'te' ? 'పుస్తకాలు మరియు రచయితలు' : 'Books & Writers'}</h2>
                <p className="page-description-medium">{lang === 'te' ? 'బైబిల్ పుస్తకాలు మరియు రచయితల విభాగాన్ని ఎంచుకోండి.' : 'Select a biblical books and writers section from the left.'}</p>
              </div>
            )}
            {['old-testament-books', 'new-testament-books', 'biblical-authors', 'books-by-category', 'old-testament-torah', 'old-testament-historical', 'old-testament-wisdom', 'old-testament-majorProphets', 'old-testament-minorProphets', 'new-testament-gospels', 'new-testament-history', 'new-testament-paulineEpistles', 'new-testament-generalEpistles', 'new-testament-prophecy'].includes(page) && (
              <BooksWritersGrid lang={lang} page={page} />
            )}
            
            {page === 'israel-maps-tribes' && (
              <div className="page-container">
                <h2 className="page-title-medium">{lang === 'te' ? 'ఇస్రాయేల్ గోత్రాల మ్యాప్' : 'Israel Tribes Map'}</h2>
                <p className="page-description-medium">{lang === 'te' ? 'ఇస్రాయేల్ గోత్రాల భూభాగాలను మ్యాప్‌లో చూడండి.' : 'View the territories of the tribes of Israel on the map.'}</p>
                <IsraelMapsTribes />
              </div>
            )}
            {page !== 'd3-chart' && page !== 'israel-maps-tribes' && page !== 'bookswriters' && !['old-testament-books', 'new-testament-books', 'biblical-authors', 'books-by-category', 'old-testament-torah', 'old-testament-historical', 'old-testament-wisdom', 'old-testament-majorProphets', 'old-testament-minorProphets', 'new-testament-gospels', 'new-testament-history', 'new-testament-paulineEpistles', 'new-testament-generalEpistles', 'new-testament-prophecy'].includes(page) && <GridComponent lang={lang} page={page} />}
            {page === 'tree' && <div className="demo-text">{lang === 'te' ? 'వంశావళి ట్రీ (డెమో త్వరలో)' : 'Genealogy Tree (Demo Coming Soon)'}</div>}
            {['adam-lineage', 'abraham-lineage'].includes(page) && <FamilyTree treeType={page} />}
          </main>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
