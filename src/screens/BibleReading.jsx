import React, { useState, useEffect, useRef } from 'react';
// LeftNav is rendered by App.jsx; do not render it here to avoid duplicate sidebars
import { FaBook, FaSearch, FaChevronLeft, FaChevronRight, FaBible, FaEllipsisV, FaCog, FaBookmark } from 'react-icons/fa';
import BookmarkColorDropdown from './BookmarkColorDropdown';
import BookmarkListModal from './BookmarkListModal';
import { getVerse, getChapter, getBook, searchVerses } from '../utils/bibleUtils.js';
import { getTeluguVerse, getTeluguChapter, getTeluguBook, searchTeluguVerses, getBookNameMapping, getTeluguBookList } from '../utils/teluguBibleUtils.js';
import teluguData from '../assets/data/books/telugu.json';

const BibleReading = ({ lang }) => {
  // Track the actual reading pane language
  const [readingPaneLang, setReadingPaneLang] = useState(lang || 'en');
  // Modal state for bookmarks list (must be before any use)
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(() => {
    return localStorage.getItem('bibleSelectedBook') || 'Genesis';
  });
  const [selectedChapter, setSelectedChapter] = useState(() => {
    return localStorage.getItem('bibleSelectedChapter') || '1';
  });
  const [selectedVerse, setSelectedVerse] = useState(() => {
    return localStorage.getItem('bibleSelectedVerse') || '1';
  });
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentTeluguChapter, setCurrentTeluguChapter] = useState(null);
  const [selectedTeluguVerses, setSelectedTeluguVerses] = useState(new Set());
  const [selectedEnglishVerses, setSelectedEnglishVerses] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('chapter');
  const [showScreenModeDropdown, setShowScreenModeDropdown] = useState(false);
  const [showCopyDropdown, setShowCopyDropdown] = useState(false);
  const [textSize, setTextSize] = useState('medium'); // 'small', 'medium', 'large'
  const [bookmarks, setBookmarks] = useState(() => {
    // Load bookmarks from localStorage if available
    try {
      const saved = localStorage.getItem('bibleBookmarks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }); // { 'Genesis-1-1': 'red', ... }
  const [showBookmarkDropdown, setShowBookmarkDropdown] = useState(false);

  // Refs for scrollable panes
  const teluguPaneRef = useRef(null);
  const englishPaneRef = useRef(null);
  // Split/Full screen mode: 'split', 'telugu', 'english'
  const [screenMode, setScreenMode] = useState(() => {
    if (lang === 'te') return 'telugu';
    if (lang === 'en') return 'english';
    return 'split';
  });

  // Switch full screen pane when language changes
  useEffect(() => {
    if (lang === 'te') {
      setScreenMode('telugu');
      setReadingPaneLang('te');
    } else if (lang === 'en') {
      // If selectedBook is a Telugu name, map it to English
      const bookMapping = getBookNameMapping();
      const teluguToEnglish = Object.fromEntries(Object.entries(bookMapping).map(([en, te]) => [te, en]));
      if (teluguToEnglish[selectedBook]) {
        setSelectedBook(teluguToEnglish[selectedBook]);
        localStorage.setItem('bibleSelectedBook', teluguToEnglish[selectedBook]);
      }
      setScreenMode('english');
      setReadingPaneLang('en');
    } else {
      setScreenMode('split');
      setReadingPaneLang('en'); // default to English if split
    }
  }, [lang]);

  // Mobile swipe gesture support for chapter navigation
  useEffect(() => {
    // Only enable on mobile devices (touch)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    let touchStartX = null;
    let touchStartY = null;
    let touchEndX = null;
    let touchEndY = null;
    const threshold = 60; // px

    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length === 1) {
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
      }
    };
    const handleTouchEnd = () => {
      if (touchStartX !== null && touchEndX !== null) {
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        // Only consider horizontal swipes
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
          if (dx < 0) {
            // Swipe left: next chapter
            navigateChapter('next');
          } else {
            // Swipe right: previous chapter
            navigateChapter('prev');
          }
        }
      }
      touchStartX = null;
      touchEndX = null;
      touchStartY = null;
      touchEndY = null;
    };

    const contentDiv = document.querySelector('.bible-reading-content');
    if (contentDiv) {
      contentDiv.addEventListener('touchstart', handleTouchStart, { passive: true });
      contentDiv.addEventListener('touchmove', handleTouchMove, { passive: true });
      contentDiv.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    return () => {
      if (contentDiv) {
        contentDiv.removeEventListener('touchstart', handleTouchStart);
        contentDiv.removeEventListener('touchmove', handleTouchMove);
        contentDiv.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [selectedChapter, selectedBook]);
  // Prevent scroll loop
  const isSyncingScroll = useRef(false);
  // Synchronize scroll from Telugu to English
  useEffect(() => {
    const teluguPane = teluguPaneRef.current;
    const englishPane = englishPaneRef.current;
    if (!teluguPane || !englishPane) return;

    const handleTeluguScroll = () => {
      if (isSyncingScroll.current) return;
      isSyncingScroll.current = true;
      // Find verse index by scroll position
      const teluguVerseDivs = teluguPane.querySelectorAll('[data-verse]');
      let scrollTop = teluguPane.scrollTop;
      let verseIndex = 0;
      for (let i = 0; i < teluguVerseDivs.length; i++) {
        if (teluguVerseDivs[i].offsetTop - teluguPane.offsetTop > scrollTop) {
          verseIndex = i;
          break;
        }
      }
      // Scroll English pane to same verse
      const englishVerseDivs = englishPane.querySelectorAll('[data-verse]');
      if (englishVerseDivs[verseIndex]) {
        englishPane.scrollTo({
          top: englishVerseDivs[verseIndex].offsetTop - englishPane.offsetTop,
          behavior: 'auto'
        });
      }
      isSyncingScroll.current = false;
    };

    teluguPane.addEventListener('scroll', handleTeluguScroll);
    return () => {
      teluguPane.removeEventListener('scroll', handleTeluguScroll);
    };
  }, [currentTeluguChapter, currentChapter]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowScreenModeDropdown(false);
        setShowCopyDropdown(false);
        setShowBookmarkDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bibleBookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem('bibleBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const bookMapping = getBookNameMapping();
  const teluguBookName = bookMapping[selectedBook];
  const teluguBooks = getTeluguBookList();

  // Bible books organized by testament
  const oldTestamentBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
    'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
    'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ];

  const newTestamentBooks = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
    'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ];

  const bibleBooks = [...oldTestamentBooks, ...newTestamentBooks];

  useEffect(() => {
    loadChapter();
  }, [selectedBook, selectedChapter]);

  const loadChapter = () => {
    setIsLoading(true);
    try {
      const chapter = getChapter(selectedBook, selectedChapter);
      // Prefer direct lookup from telugu.json for reliability
      const teluguKey = teluguBookName || selectedBook;
      let teluguChapter = (teluguData && teluguData[teluguKey] && teluguData[teluguKey][selectedChapter]) || null;
      if (!teluguChapter) {
        // Try English key fallback
        teluguChapter = (teluguData && teluguData[selectedBook] && teluguData[selectedBook][selectedChapter]) || null;
      }

      setCurrentChapter(chapter);
      setCurrentTeluguChapter(teluguChapter || {});
    } catch (error) {
      console.error('Error loading chapter:', error);
      setCurrentChapter(null);
      setCurrentTeluguChapter(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookChange = (book) => {
    // Always store English name internally
    let englishBook = book;
    // If the selected value is a Telugu name, map to English
    const bookMapping = getBookNameMapping();
    const teluguToEnglish = Object.fromEntries(Object.entries(bookMapping).map(([en, te]) => [te, en]));
    if (teluguToEnglish[book]) {
      englishBook = teluguToEnglish[book];
    }
    setSelectedBook(englishBook);
    localStorage.setItem('bibleSelectedBook', englishBook);
    setSelectedChapter('1');
    localStorage.setItem('bibleSelectedChapter', '1');
    setSelectedVerse('1');
    localStorage.setItem('bibleSelectedVerse', '1');
    setViewMode('chapter');
    setSelectedTeluguVerses(new Set());
    setSelectedEnglishVerses(new Set());
    // Do NOT clear bookmarks here
  };

  const handleChapterChange = (chapter) => {
    setSelectedChapter(chapter);
    localStorage.setItem('bibleSelectedChapter', chapter);
    setSelectedVerse('1');
    localStorage.setItem('bibleSelectedVerse', '1');
    setSelectedTeluguVerses(new Set());
    setSelectedEnglishVerses(new Set());
    // Do NOT clear bookmarks here
  };

  const handleVerseChange = (verse) => {
    setSelectedVerse(verse);
    localStorage.setItem('bibleSelectedVerse', verse);
  };

  // Helper function to get font size based on textSize state
  const getTextSizeStyle = () => {
    switch (textSize) {
      case 'small':
        return { fontSize: '1.5rem' }; // 24px
      case 'large':
        return { fontSize: '2.5rem' }; // 40px
      case 'medium':
      default:
        return { fontSize: '2rem' }; // 32px
    }
  };

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('bibleBookmarks', JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  // Helper function to get bookmark color style
  const getBookmarkStyle = (verseKey) => {
    const color = bookmarks[verseKey];
    switch (color) {
      case 'red':
        return { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' };
      case 'blue':
        return { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6' };
      case 'green':
        return { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid #22c55e' };
      case 'yellow':
        return { backgroundColor: 'rgba(251, 192, 45, 0.15)', borderLeft: '4px solid #fbc02d' };
      case 'purple':
        return { backgroundColor: 'rgba(124, 58, 237, 0.1)', borderLeft: '4px solid #7c3aed' };
      case 'orange':
        return { backgroundColor: 'rgba(251, 140, 0, 0.15)', borderLeft: '4px solid #fb8c00' };
      default:
        return {};
    }
  };

  // Bookmark functions
  const addBookmark = (verseNum, color) => {
    const verseKey = `${selectedBook}-${selectedChapter}-${verseNum}`;
    setBookmarks(prev => ({
      ...prev,
      [verseKey]: color
    }));
  };

  const addBookmarkToSelectedVerses = (color) => {
    const allSelectedVerses = new Set([...Array.from(selectedTeluguVerses), ...Array.from(selectedEnglishVerses)]);
    const newBookmarks = { ...bookmarks };

    allSelectedVerses.forEach(verseNum => {
      const verseKey = `${selectedBook}-${selectedChapter}-${verseNum}`;
      newBookmarks[verseKey] = color;
    });

    setBookmarks(newBookmarks);
  };

  const removeBookmark = (verseNum) => {
    const verseKey = `${selectedBook}-${selectedChapter}-${verseNum}`;
    setBookmarks(prev => {
      const newBookmarks = { ...prev };
      delete newBookmarks[verseKey];
      return newBookmarks;
    });
  };

  const clearAllBookmarks = () => {
    setBookmarks({});
    // Only clear bookmarks here, when user clicks 'Clear Bookmarks'
  };

  const clearChapterBookmarks = () => {
    setBookmarks(prev => {
      const newBookmarks = { ...prev };
      Object.keys(newBookmarks).forEach(key => {
        if (key.startsWith(`${selectedBook}-${selectedChapter}-`)) {
          delete newBookmarks[key];
        }
      });
      return newBookmarks;
    });
  };

  const getVerseBookmark = (verseNum) => {
    const verseKey = `${selectedBook}-${selectedChapter}-${verseNum}`;
    return bookmarks[verseKey];
  };

  const handleVerseClick = (verseNum) => {
    setSelectedVerse(verseNum);
    // toggle selection for both panes by default when clicked while holding ctrl/meta
    // Simple toggle for single click: add/remove from telugu selection and english selection
    setSelectedTeluguVerses(prev => {
      const next = new Set(Array.from(prev));
      if (next.has(verseNum)) next.delete(verseNum); else next.add(verseNum);
      return next;
    });
    setSelectedEnglishVerses(prev => {
      const next = new Set(Array.from(prev));
      if (next.has(verseNum)) next.delete(verseNum); else next.add(verseNum);
      return next;
    });
  };

  const clearSelections = () => {
    setSelectedTeluguVerses(new Set());
    setSelectedEnglishVerses(new Set());
  };

  const copySelected = async (pane) => {
    try {
      let text = '';
      if (pane === 'telugu') {
        const sel = Array.from(selectedTeluguVerses).sort((a,b)=>Number(a)-Number(b));
        text = sel.map(v => `${v}. ${currentTeluguChapter && currentTeluguChapter[v] ? currentTeluguChapter[v] : ''}`).join('\n');
      } else if (pane === 'english') {
        const sel = Array.from(selectedEnglishVerses).sort((a,b)=>Number(a)-Number(b));
        text = sel.map(v => `${v}. ${currentChapter && currentChapter[v] ? currentChapter[v] : ''}`).join('\n');
      } else if (pane === 'both') {
        // Copy both Telugu and English versions in the requested format
        const allVerses = new Set([...Array.from(selectedTeluguVerses), ...Array.from(selectedEnglishVerses)]);
        const sortedVerses = Array.from(allVerses).sort((a,b)=>Number(a)-Number(b));
        const minVerse = Math.min(...sortedVerses);
        const maxVerse = Math.max(...sortedVerses);
        const verseRange = minVerse === maxVerse ? minVerse : `${minVerse}-${maxVerse}`;

        // Telugu section
        const teluguBookName = bookMapping[selectedBook] || selectedBook;
        const teluguLines = [`${teluguBookName} ${selectedChapter}:${verseRange}`];
        for (const verseNum of sortedVerses) {
          const teluguText = currentTeluguChapter && currentTeluguChapter[verseNum] ? currentTeluguChapter[verseNum] : '';
          teluguLines.push(teluguText);
        }

        // English section
        const englishLines = [`${selectedBook} ${selectedChapter}:${verseRange}`];
        for (const verseNum of sortedVerses) {
          const englishText = currentChapter && currentChapter[verseNum] ? currentChapter[verseNum] : '';
          englishLines.push(englishText);
        }

        text = [...teluguLines, '', ...englishLines].join('\n');
      }
      await navigator.clipboard.writeText(text);
      // small visual feedback could be added later
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const englishResults = searchVerses(searchQuery);
      const teluguResults = searchTeluguVerses(searchQuery);
      const allResults = [...englishResults, ...teluguResults];
      setSuggestions(allResults);
      setShowSuggestionsModal(true);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Navigate chapters within the current book
  const navigateChapter = (direction) => {
    const chapters = getChapterNumbers();
    const currentIndex = chapters.indexOf(selectedChapter);
    if (direction === 'next') {
      if (currentIndex < chapters.length - 1) {
        handleChapterChange(chapters[currentIndex + 1]);
      } else {
        // At last chapter, go to next book if available
        const bookList = bibleBooks;
        const bookIdx = bookList.indexOf(selectedBook);
        if (bookIdx < bookList.length - 1) {
          const nextBook = bookList[bookIdx + 1];
          setSelectedBook(nextBook);
          localStorage.setItem('bibleSelectedBook', nextBook);
          setSelectedChapter('1');
          localStorage.setItem('bibleSelectedChapter', '1');
          setSelectedVerse('1');
          localStorage.setItem('bibleSelectedVerse', '1');
          setViewMode('chapter');
          setSelectedTeluguVerses(new Set());
          setSelectedEnglishVerses(new Set());
        }
      }
    } else if (direction === 'prev') {
      if (currentIndex > 0) {
        handleChapterChange(chapters[currentIndex - 1]);
      } else {
        // At first chapter, go to previous book if available
        const bookList = bibleBooks;
        const bookIdx = bookList.indexOf(selectedBook);
        if (bookIdx > 0) {
          const prevBook = bookList[bookIdx - 1];
          // Get last chapter of previous book
          const prevBookObj = getBook(prevBook);
          const prevBookChapters = prevBookObj ? Object.keys(prevBookObj) : [];
          const lastChapter = prevBookChapters[prevBookChapters.length - 1] || '1';
          setSelectedBook(prevBook);
          localStorage.setItem('bibleSelectedBook', prevBook);
          setSelectedChapter(lastChapter);
          localStorage.setItem('bibleSelectedChapter', lastChapter);
          setSelectedVerse('1');
          localStorage.setItem('bibleSelectedVerse', '1');
          setViewMode('chapter');
          setSelectedTeluguVerses(new Set());
          setSelectedEnglishVerses(new Set());
        }
      }
    }
  };

  const getChapterNumbers = () => {
    const book = getBook(selectedBook);
    const chapters = book ? Object.keys(book) : [];
    return chapters;
  };

  const getVerseNumbers = () => {
    if (!currentChapter) {
      return [];
    }
    const verses = Object.keys(currentChapter);
    return verses;
  };

  const renderChapterView = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <FaBook className="text-4xl text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">
            {lang === 'te' ? 'అధ్యాయం లోడ్ అవుతోంది...' : 'Loading chapter...'}
          </p>
        </div>
      );
    }

    if (!currentChapter) {
      return (
        <div className="text-center py-8">
          <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {lang === 'te' ? 'అధ్యాయం కనుగొనబడలేదు' : 'Chapter not found'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Telugu Side */}
        <div className="bible-pane p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            {lang === 'te' ? 'తెలుగు' : 'Telugu'}
          </h3>
          <div className="space-y-3">
            {currentTeluguChapter && Object.keys(currentTeluguChapter).length > 0 ? (
              Object.entries(currentTeluguChapter).map(([verseNum, teluguText]) => (
                <div
                  key={`te-${verseNum}`}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    selectedVerse === verseNum ? 'bg-purple-50 border-l-4 border-purple-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleVerseClick(verseNum)}
                  style={getBookmarkStyle(`${selectedBook}-${selectedChapter}-${verseNum}`)}
                >
                  <div className="flex items-start space-x-3">
                    <span className="bible-verse-number text-purple-600 text-sm">{verseNum}</span>
                    <p
                      className="text-purple-800 leading-relaxed"
                      style={{
                        fontFamily: 'Noto Sans Telugu, sans-serif',
                        ...getTextSizeStyle()
                      }}
                    >
                      {teluguText}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {lang === 'te' ? 'తెలుగు అధ్యాయం అందుబాటులో లేదు' : 'Telugu chapter not available'}
                </p>
              </div>
            )}
          </div>
        </div>
        {/* English (KJV) Side */}
        <div className="bible-pane p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            {lang === 'te' ? 'ఇంగ్లీష్ (KJV)' : 'English (KJV)'}
          </h3>
          <div className="space-y-3">
            {Object.entries(currentChapter).map(([verseNum, englishText]) => (
              <div
                key={`en-${verseNum}`}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedVerse === verseNum ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleVerseClick(verseNum)}
                style={getBookmarkStyle(`${selectedBook}-${selectedChapter}-${verseNum}`)}
              >
                <div className="flex items-start space-x-3">
                  <span className="bible-verse-number text-blue-600 text-sm">{verseNum}</span>
                  <p
                    className="text-gray-800 leading-relaxed"
                    style={getTextSizeStyle()}
                  >
                    {englishText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  const renderSearchView = () => {
    return (
      <div className="space-y-4">
        {searchResults.length === 0 ? (
          <div className="text-center py-8">
            <FaSearch className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {lang === 'te' ? 'ఫలితాలు కనుగొనబడలేదు' : 'No results found'}
            </p>
          </div>
        ) : (
          searchResults.slice(0, 50).map((result, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className="text-sm text-gray-500 min-w-[6rem]">
                  {result.book} {result.chapter}:{result.verse}
                </div>
                <p className="text-gray-800 leading-relaxed flex-1">{result.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="bible-reading-container max-w-7xl mx-auto p-6" style={{ flex: 1, position: 'relative' }}>
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          {/* Row 1: Search (centered) */}
          <div style={{ width: '100%', maxWidth: 720 }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <input
                  ref={(el) => { window._searchInput = el; }}
                  type="text"
                  className="control-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  placeholder={lang === 'te' ? 'పదం లేదా వాక్యం...' : 'Word or phrase...'}
                  autoComplete="off"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => { setSearchQuery(''); setSuggestions([]); clearSelections(); window._searchInput && window._searchInput.focus(); }}
                  className="control-btn"
                  title={lang === 'te' ? 'సరిపరచు' : 'Clear'}
                >
                  ×
                </button>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="control-btn"
                  style={{ background: '#4f46e5', color: '#fff' }}
                >
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Reference with navigation buttons left/right */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '0.5rem 0' }}>
            <button
              onClick={() => navigateChapter('prev')}
              className="control-btn flex items-center px-4 py-2"
              style={{ background: '#edeaff', color: '#2a1a6e', border: '1px solid #b7aaff', fontSize:`13px` }}
            >
              <FaChevronLeft className="mr-2" />
              {lang === 'te' ? 'మునుపటి' : 'Prev'}
            </button>
            <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setShowReferenceModal(true)}>
              {lang === 'te' ? (
                <h2 className="text-lg font-semibold" style={{ margin: 0, backgroundColor:'cornsilk', padding:'5px 24px', borderRadius : 10 , fontSize:16}}>{teluguBookName} {selectedChapter}:{selectedVerse}</h2>
              ) : (
                <h2 className="text-lg font-semibold" style={{ margin: 0, backgroundColor:'cornsilk', padding:'5px 24px', borderRadius : 10 , fontSize:18}}>{selectedBook} {selectedChapter}:{selectedVerse}</h2>
              )}
            </div>
            <button
              onClick={() => navigateChapter('next')}
              className="control-btn flex items-center px-4 py-2"
              style={{ background: '#edeaff', color: '#2a1a6e', border: '1px solid #b7aaff', fontSize:`13px` }}
            >
              {lang === 'te' ? 'తరువాతి' : 'Next'}
              <FaChevronRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions Modal */}
      {showSuggestionsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 600, width: '90%', maxHeight: '70vh', overflowY: 'auto', padding: 24, position: 'relative' }}>
            <button style={{ position: 'absolute', top: 12, right: 16, fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowSuggestionsModal(false)}>&times;</button>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Search Results</h2>
            {suggestions.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', fontSize: 16 }}>No results found.</div>
            ) : (
              suggestions.map((s, idx) => (
                <div
                  key={idx}
                  style={{ padding: '12px 8px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: 15 }}
                  onClick={() => {
                    setSearchQuery(s.text);
                    setSuggestions([]);
                    setShowSuggestionsModal(false);
                    setSelectedBook(s.book);
                    setSelectedChapter(s.chapter);
                    setSelectedVerse(s.verse);
                    // Clear verse selections when navigating via search results
                    setSelectedTeluguVerses(new Set());
                    setSelectedEnglishVerses(new Set());
                    setTimeout(() => {
                      const teluguPane = teluguPaneRef.current;
                      const englishPane = englishPaneRef.current;
                      if (teluguPane) {
                        const el = teluguPane.querySelector(`[data-verse='${s.verse}']`);
                        if (el) teluguPane.scrollTo({ top: el.offsetTop - teluguPane.offsetTop, behavior: 'smooth' });
                      }
                      if (englishPane) {
                        const el = englishPane.querySelector(`[data-verse='${s.verse}']`);
                        if (el) englishPane.scrollTo({ top: el.offsetTop - englishPane.offsetTop, behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{s.book} {s.chapter}:{s.verse}</span> - {s.text.length > 80 ? s.text.slice(0, 80) + '...' : s.text}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Reference Modal */}
      {showReferenceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'rgb(206 212 233)', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 400, width: '95%', maxHeight: '80vh', overflowY: 'auto', padding: 24, position: 'relative' }}>
            <button style={{ position: 'absolute', top: 12, right: 16, fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowReferenceModal(false)}>&times;</button>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{lang === 'te' ? 'పుస్తకం ఎంపిక' : 'Select Reference'}</h2>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ flex: '1 3 350px' }}>
                <label className="text-sm text-gray-700">{lang === 'te' ? 'గ్రంధము ' : 'Book'}</label>
                <select className="control-select w-full" value={selectedBook} onChange={(e) => handleBookChange(e.target.value)}>
                  {lang === 'te'
                    ? bibleBooks.map(book => (
                        <option key={book} value={book}>{bookMapping[book] || book}</option>
                      ))
                    : bibleBooks.map(book => (
                        <option key={book} value={book}>{book}</option>
                      ))}
                </select>
              </div>

              <div style={{ flex: '1 0 120px' }}>
                <label className="text-sm text-gray-700">{lang === 'te' ? 'అధ్యాయం' : 'Chapter'}</label>
                <select className="control-select w-full" value={selectedChapter} onChange={(e) => handleChapterChange(e.target.value)} disabled={isLoading}>
                  {isLoading ? <option value="">{lang === 'te' ? 'లోడ్...' : 'Loading...'}</option> : (
                    getChapterNumbers().map(ch => <option key={ch} value={ch}>{ch}</option>)
                  )}
                </select>
              </div>

              <div style={{ flex: '1 0 120px' }}>
                <label className="text-sm text-gray-700">{lang === 'te' ? 'వచనము' : 'Verse'}</label>
                <select className="control-select w-full" value={selectedVerse} onChange={(e) => handleVerseChange(e.target.value)} disabled={isLoading}>
                  {isLoading ? <option value="">{lang === 'te' ? 'లోడ్...' : 'Loading...'}</option> : (
                    getVerseNumbers().map(v => <option key={v} value={v}>{v}</option>)
                  )}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="control-btn" style={{ background: '#4f46e5', color: '#fff', flex: 1 }} onClick={() => { setShowReferenceModal(false); loadChapter(); }}>
                {lang === 'te' ? 'శోధన' : 'Go'}
              </button>
              
            </div>
          </div>
        </div>
      )}

      {/* Right side dropdown menus */}
      <div style={{ position: 'absolute', top: '100px', right: '20px', display: 'flex', gap: '0.5rem', zIndex: 1000 }}>
        {/* Copy Actions Dropdown - Always visible */}
  <div style={{ position: 'relative', top: '-15px' }} className="dropdown-container">
          <button
            className="control-btn"
            style={{ background: '#f3f4f6', color: '#374151', padding: '0.7rem', minWidth: 'auto', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1.35rem' }}
            onClick={() => {
              setShowCopyDropdown(prev => {
                if (!prev) {
                  setShowBookmarkDropdown(false);
                  setShowScreenModeDropdown(false);
                }
                return !prev;
              });
            }}
          >
            <FaEllipsisV style={{ fontSize: '1.35rem' }} />
          </button>
          {showCopyDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 1001,
              minWidth: '200px',
              fontSize: '1.5rem',
              padding: '1.1rem 0.8rem'
            }}>
              {selectedTeluguVerses && selectedTeluguVerses.size > 0 && (
                <button
                  className="dropdown-item"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#6d28d9'
                  }}
                  onClick={() => {
                    copySelected('telugu');
                    setShowCopyDropdown(false);
                  }}
                >
                  {lang === 'te' ? 'Copy Telugu' : 'Copy Telugu'}
                </button>
              )}
              {selectedEnglishVerses && selectedEnglishVerses.size > 0 && (
                <button
                  className="dropdown-item"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#2563eb'
                  }}
                  onClick={() => {
                    copySelected('english');
                    setShowCopyDropdown(false);
                  }}
                >
                  {lang === 'te' ? 'Copy English' : 'Copy English'}
                </button>
              )}
              {((selectedTeluguVerses && selectedTeluguVerses.size > 0) || (selectedEnglishVerses && selectedEnglishVerses.size > 0)) && (
                <button
                  className="dropdown-item"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#059669'
                  }}
                  onClick={() => {
                    copySelected('both');
                    setShowCopyDropdown(false);
                  }}
                >
                  {lang === 'te' ? 'Copy Both' : 'Copy Both'}
                </button>
              )}
              {((selectedTeluguVerses && selectedTeluguVerses.size > 0) || (selectedEnglishVerses && selectedEnglishVerses.size > 0)) && (
                <button
                  className="dropdown-item"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#dc2626'
                  }}
                  onClick={() => {
                    clearSelections();
                    setShowCopyDropdown(false);
                  }}
                >
                  {lang === 'te' ? 'Clear Selection' : 'Clear Selection'}
                </button>
              )}
              {(!selectedTeluguVerses || selectedTeluguVerses.size === 0) && (!selectedEnglishVerses || selectedEnglishVerses.size === 0) && (
                <div style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  color: '#9ca3af',
                  fontSize: '0.875rem'
                }}>
                  {lang === 'te' ? 'Select verses to copy' : 'Select verses to copy'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bookmark Dropdown */}
        <div style={{ position: 'relative', top: '-15px' }} className="dropdown-container">
          <button
            className="control-btn"
            style={{ background: '#f3f4f6', color: '#374151', padding: '0.7rem', minWidth: 'auto', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1.35rem' }}
            onClick={() => {
              setShowBookmarkDropdown(prev => {
                if (!prev) {
                  setShowCopyDropdown(false);
                  setShowScreenModeDropdown(false);
                }
                return !prev;
              });
            }}
          >
            <FaBookmark style={{ fontSize: '1.35rem' }} />
          </button>
          {showBookmarkDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 1001,
              minWidth: '220px',
              fontSize: '1.5rem',
              padding: '1.1rem 0.8rem'
            }}>
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                {lang === 'te' ? 'Bookmark Color' : 'Bookmark Color'}
              </div>
              <div style={{ padding: '0.5rem' }}>
                <BookmarkColorDropdown
                  addBookmarkToSelectedVerses={addBookmarkToSelectedVerses}
                  setSelectedTeluguVerses={setSelectedTeluguVerses}
                  setSelectedEnglishVerses={setSelectedEnglishVerses}
                  setShowBookmarkDropdown={setShowBookmarkDropdown}
                  selectedTeluguVerses={selectedTeluguVerses}
                  selectedEnglishVerses={selectedEnglishVerses}
                />
                <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.75rem 0 0.25rem 0', paddingTop: '0.5rem' }}>
                  <button
                    className="control-btn"
                    style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', background: '#edeaff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: 6, fontWeight: 500, marginTop: 2, cursor: 'pointer' }}
                    onClick={() => {
                      setShowBookmarkDropdown(false);
                      setShowBookmarksModal(true);
                    }}
                  >
                    Show Bookmarks
                  </button>
                </div>
                {(() => {
                  const allSelectedVerses = new Set([...Array.from(selectedTeluguVerses), ...Array.from(selectedEnglishVerses)]);
                  const hasSelectedBookmarks = Array.from(allSelectedVerses).some(verseNum =>
                    getVerseBookmark(verseNum)
                  );
                  return hasSelectedBookmarks && (
                    <button
                      className="control-btn"
                      style={{
                        width: '100%',
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca'
                      }}
                      onClick={() => {
                        allSelectedVerses.forEach(verseNum => {
                          removeBookmark(verseNum);
                        });
                        setShowBookmarkDropdown(false);
                      }}
                    >
                      ❌ {lang === 'te' ? 'Remove Selected Bookmarks' : 'Remove Selected Bookmarks'}
                    </button>
                  );
                })()}
                {Object.keys(bookmarks).length > 0 && (
                  <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.5rem 0', paddingTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.5rem' }}>
                      {lang === 'te' ? 'Clear Bookmarks' : 'Clear Bookmarks'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        className="control-btn"
                        style={{
                          flex: 1,
                          padding: '0.4rem',
                          fontSize: '0.7rem',
                          background: '#fef3c7',
                          color: '#d97706',
                          border: '1px solid #fde68a'
                        }}
                        onClick={() => {
                          clearChapterBookmarks();
                          setShowBookmarkDropdown(false);
                        }}
                      >
                        {lang === 'te' ? 'This Chapter' : 'This Chapter'}
                      </button>
                      {/*<button
                        className="control-btn"
                        style={{
                          flex: 1,
                          padding: '0.4rem',
                          fontSize: '0.7rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecaca'
                        }}
                        onClick={() => {
                          clearAllBookmarks();
                          setShowBookmarkDropdown(false);
                        }}
                      >
                        {lang === 'te' ? 'All' : 'All'}
                      </button>*/}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Screen Mode Dropdown */}
        <div style={{ position: 'relative', top: '-15px' }} className="dropdown-container">
          <button
            className="control-btn"
            style={{ background: '#f3f4f6', color: '#374151', padding: '0.7rem', minWidth: 'auto', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1.35rem' }}
            onClick={() => {
              setShowScreenModeDropdown(prev => {
                if (!prev) {
                  setShowCopyDropdown(false);
                  setShowBookmarkDropdown(false);
                }
                return !prev;
              });
            }}
          >
            <FaCog style={{ fontSize: '1.35rem' }} />
          </button>
          {showScreenModeDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 1001,
              minWidth: '220px',
              fontSize: '1.5rem',
              padding: '1.1rem 0.8rem'
            }}>
              {/* Show all screen mode options in dropdown */}
              <>
                {screenMode !== 'split' && (
                  <button
                    className="dropdown-item"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#2a1a6e'
                    }}
                    onClick={() => {
                      setScreenMode('split');
                      setReadingPaneLang('en'); // Default to English in split
                      setShowScreenModeDropdown(false);
                    }}
                  >
                    {'Split Screen'}
                  </button>
                )}
                {(screenMode === 'split' || screenMode === 'telugu') && (
                  <button
                    className="dropdown-item"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#2563eb'
                    }}
                    onClick={() => {
                      setScreenMode('english');
                      setReadingPaneLang('en');
                      setShowScreenModeDropdown(false);
                    }}
                  >
                    {'English Full Screen'}
                  </button>
                )}
                {(screenMode === 'split' || screenMode === 'english') && (
                  <button
                    className="dropdown-item"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#6d28d9'
                    }}
                    onClick={() => {
                      setScreenMode('telugu');
                      setReadingPaneLang('te');
                      setShowScreenModeDropdown(false);
                    }}
                  >
                    {'Telugu Full Screen'}
                  </button>
                )}
                {/* Text Size controls always shown below */}
              </>

              {/* Text Size Controls */}
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }}></div>
              <div style={{ padding: '0.5rem 1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  {lang === 'te' ? 'Text Size' : 'Text Size'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    className="control-btn"
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      minWidth: 'auto',
                      background: textSize === 'small' ? '#e5e7eb' : '#f9fafb',
                      color: '#374151'
                    }}
                    onClick={() => setTextSize('small')}
                    disabled={textSize === 'small'}
                  >
                    {lang === 'te' ? 'Small' : 'Small'}
                  </button>
                  <button
                    className="control-btn"
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.875rem',
                      minWidth: 'auto',
                      background: textSize === 'medium' ? '#e5e7eb' : '#f9fafb',
                      color: '#374151'
                    }}
                    onClick={() => setTextSize('medium')}
                    disabled={textSize === 'medium'}
                  >
                    {lang === 'te' ? 'Medium' : 'Medium'}
                  </button>
                  <button
                    className="control-btn"
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '1rem',
                      minWidth: 'auto',
                      background: textSize === 'large' ? '#e5e7eb' : '#f9fafb',
                      color: '#374151'
                    }}
                    onClick={() => setTextSize('large')}
                    disabled={textSize === 'large'}
                  >
                    {lang === 'te' ? 'Large' : 'Large'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bible-reading-content bg-gray-50 rounded-lg p-6" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        {/* Headings above scrollable panes */}
        <div style={{ display: 'flex' }}>
          {(screenMode === 'split' || screenMode === 'telugu') && (
            <div style={{ flex: 1}}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2" style={{textAlign: 'center', fontSize: 13}}>
                {lang === 'te' ? 'తెలుగు' : 'Telugu'}
              </h3>
            </div>
          )}
          {(screenMode === 'split' || screenMode === 'english') && (
            <div style={{ flex: 1 }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2" style={{textAlign: 'center', fontSize: 13}}>
                {lang === 'te' ? 'ఇంగ్లీష్ (KJV)' : 'English (KJV)'}
              </h3>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Telugu Bible */}
          {(screenMode === 'split' || screenMode === 'telugu') && (
            <div
              className="bible-pane"
              style={{ flex: 1, minWidth: 0, maxHeight: screenMode === 'telugu' ? '80vh' : '50vh', overflowY: 'auto', transition: 'max-height 0.3s' }}
              ref={teluguPaneRef}
            >
              
              {currentTeluguChapter && Object.keys(currentTeluguChapter).length > 0 ? (
                Object.entries(currentTeluguChapter).map(([verseNum, teluguText]) => (
                  <div
                    key={`te-${verseNum}`}
                    data-verse={verseNum}
                    className={`p-3 rounded transition-colors verse-text-size ${selectedTeluguVerses && selectedTeluguVerses.has(verseNum) ? 'verse-selected' : (selectedVerse === verseNum ? 'bg-purple-50 border-l-4 border-purple-500' : 'hover:bg-gray-50')}`}
                    onClick={() => handleVerseClick(verseNum)}
                    style={{
                      cursor: 'pointer',
                      ...getBookmarkStyle(`${selectedBook}-${selectedChapter}-${verseNum}`)
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="bible-verse-number text-purple-600 text-sm">{verseNum}</span>
                      <p
                        className="text-purple-800 leading-relaxed"
                        style={{
                          fontFamily: 'Noto Sans Telugu, sans-serif',
                          textAlign: 'left',
                          ...getTextSizeStyle()
                        }}
                      >
                        {teluguText}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {lang === 'te' ? 'తెలుగు అధ్యాయం అందుబాటులో లేదు' : 'Telugu chapter not available'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* English Bible */}
          {(screenMode === 'split' || screenMode === 'english') && (
            <div
              className="bible-pane"
              style={{ flex: 1, minWidth: 0, maxHeight: screenMode === 'english' ? '80vh' : '50vh', overflowY: 'auto', transition: 'max-height 0.3s' }}
              ref={englishPaneRef}
            >
              
              {currentChapter ? (
                Object.entries(currentChapter).map(([verseNum, englishText]) => (
                  <div
                    key={`en-${verseNum}`}
                    data-verse={verseNum}
                    className={`p-3 rounded transition-colors verse-text-size ${selectedEnglishVerses && selectedEnglishVerses.has(verseNum) ? 'verse-selected' : (selectedVerse === verseNum ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50')}`}
                    onClick={() => handleVerseClick(verseNum)}
                    style={{
                      cursor: 'pointer',
                      ...getBookmarkStyle(`${selectedBook}-${selectedChapter}-${verseNum}`)
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="bible-verse-number text-blue-600 text-sm">{verseNum}</span>
                      <p
                        className="text-gray-800 leading-relaxed"
                        style={{
                          textAlign: 'left',
                          ...getTextSizeStyle()
                        }}
                      >
                        {englishText}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {lang === 'te' ? 'ఇంగ్లీష్ అధ్యాయం అందుబాటులో లేదు' : 'English chapter not available'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    {/* Bookmarks Modal */}
    {showBookmarksModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', maxWidth: 800, width: '95%', maxHeight: '80vh', overflowY: 'auto', padding: 32 }}>
          {/* Bookmarks modal header */}
          <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 24 }}>
            Bookmarked Verses
          </div>
          {/* Tabs (assume BookmarkListModal renders them, or add here if not) */}
          {/* 3-dots button under tabs, above verses */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <div style={{ position: 'relative' }} className="dropdown-container">
              <button
                className="control-btn"
                style={{ background: '#f3f4f6', color: '#374151', padding: '0.7rem', minWidth: 'auto', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1.35rem' }}
                onClick={() => {
                  setShowCopyDropdown(prev => {
                    if (!prev) {
                      setShowBookmarkDropdown(false);
                      setShowScreenModeDropdown(false);
                    }
                    return !prev;
                  });
                }}
                title={lang === 'te' ? 'కాపీ ఆప్షన్స్' : 'Copy Options'}
              >
                <FaEllipsisV style={{ fontSize: '1.35rem' }} />
              </button>
              {showCopyDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                  zIndex: 4000,
                  minWidth: '220px',
                  fontSize: '1.5rem',
                  padding: '1.1rem 0.8rem'
                }}>
                  <button
                    className="dropdown-item"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#2563eb'
                    }}
                    onClick={async () => {
                      // Copy all verses in the current tab (chapter or book)
                      let text = '';
                      if (bookmarksTab === 'chapter') {
                        if (currentChapter) {
                          text = Object.entries(currentChapter)
                            .map(([verseNum, verseText]) => `${verseNum}. ${verseText}`)
                            .join('\n');
                        }
                      } else if (bookmarksTab === 'book') {
                        const book = getBook(selectedBook);
                        if (book) {
                          text = Object.entries(book)
                            .map(([chapterNum, chapterObj]) =>
                              Object.entries(chapterObj)
                                .map(([verseNum, verseText]) => `${chapterNum}:${verseNum}. ${verseText}`)
                                .join('\n')
                            )
                            .join('\n');
                        }
                      }
                      if (text) await navigator.clipboard.writeText(text);
                      setShowCopyDropdown(false);
                    }}
                  >
                    {lang === 'te' ? 'వర్సెస్ కాపీ చేయి' : 'Copy Verses'}
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* The rest of the modal (tabs, verses list) */}
          <BookmarkListModal
            key={`bookmark-modal-${readingPaneLang}`}
            show={showBookmarksModal}
            onClose={() => setShowBookmarksModal(false)}
            bookmarks={bookmarks}
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            getBookmarkStyle={getBookmarkStyle}
            lang={readingPaneLang}
            onVerseClick={(book, chapter, verse) => {
              setShowBookmarksModal(false);
              setSelectedBook(book);
              setSelectedChapter(chapter);
              setSelectedVerse(verse);
            }}
          />
        </div>
      </div>
    )}
  </div>
  );
};

export default BibleReading;