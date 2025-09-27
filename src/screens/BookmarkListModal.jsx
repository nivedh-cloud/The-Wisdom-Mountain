
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getVerse } from '../utils/bibleUtils.js';
import { getTeluguVerse, getBookNameMapping } from '../utils/teluguBibleUtils.js';
import { FaEllipsisV } from 'react-icons/fa';

const BookmarkListModal = ({
  show, onClose, bookmarks, selectedBook, selectedChapter, getBookmarkStyle, onVerseClick, lang: langProp
}) => {
  // Always get language from context if not provided as prop
  let lang = langProp;
  try {
    if (!lang) {
      lang = useLanguage().language;
    }
  } catch {}
  const [tab, setTab] = useState('chapter');
  const [showCopyDropdown, setShowCopyDropdown] = useState(false);


  // Helper to sort by chapter, verse numerically
  function sortByChapterVerse(a, b) {
    const [bookA, chapterA, verseA] = a[0].split('-');
    const [bookB, chapterB, verseB] = b[0].split('-');
    if (Number(chapterA) !== Number(chapterB)) return Number(chapterA) - Number(chapterB);
    return Number(verseA) - Number(verseB);
  }

  // Filter and sort bookmarks for this chapter and this book
  const chapterBookmarks = Object.entries(bookmarks)
    .filter(([key]) => {
      const [book, chapter] = key.split('-');
      return book === selectedBook && chapter === selectedChapter;
    })
    .sort(sortByChapterVerse);

  const bookBookmarks = Object.entries(bookmarks)
    .filter(([key]) => {
      const [book] = key.split('-');
      return book === selectedBook;
    })
    .sort(sortByChapterVerse);

  // Book name mapping for Telugu
  const bookNameMapping = getBookNameMapping();

  const renderList = (list) => (
    <div style={{ maxHeight: 400, overflowY: 'auto', minWidth: 320 }}>
      {list.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 24 }}>No bookmarks found.</div>
      ) : (
        list.map(([key, color]) => {
          const [book, chapter, verse] = key.split('-');
          let verseText = '';
          try {
            if (lang === 'te') {
              // Telugu: map to Telugu book name and use getTeluguVerse
              const teluguBook = bookNameMapping[book] || book;
              verseText = getTeluguVerse(teluguBook, chapter, verse) || '';
            } else {
              // English: use getVerse with the original book name (no mapping)
              verseText = getVerse(book, chapter, verse) || '';
            }
          } catch {}
          // Color border for the left side
          let borderColor = '#e5e7eb';
          switch (color) {
            case 'red': borderColor = '#ef4444'; break;
            case 'blue': borderColor = '#2563eb'; break;
            case 'green': borderColor = '#22c55e'; break;
            case 'yellow': borderColor = '#eab308'; break;
            case 'purple': borderColor = '#a21caf'; break;
            case 'orange': borderColor = '#f97316'; break;
            default: borderColor = '#e5e7eb';
          }
          return (
            <div
              key={key}
              style={{
                margin: '10px 0',
                padding: '12px 18px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
                transition: 'background 0.2s',
                borderLeft: `8px solid ${borderColor}`,
                textAlign: 'left',
              }}
              onClick={() => onVerseClick && onVerseClick(book, chapter, verse)}
              title={`Go to ${book} ${chapter}:${verse}`}
            >
              <span style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{book} {chapter}:{verse}</span>
              <span style={{ fontSize: 15, color: '#222', fontWeight: 400, textAlign: 'left' }}>{verseText}</span>
            </div>
          );
        })
      )}
    </div>
  );

  if (!show) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 24px rgba(0,0,0,0.18)',
          minWidth: 420,
          maxWidth: '900px',
          width: '90vw',
          maxHeight: '85vh',
          padding: 32,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* DEBUG: Show current lang prop */}
        <div style={{ position: 'absolute', top: 8, left: 16, fontSize: 12, color: '#888' }}>
          [lang: {String(lang)}]
        </div>
        <button style={{ position: 'absolute', top: 16, right: 24, fontSize: 26, background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}>&times;</button>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Bookmarked Verses</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => setTab('chapter')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 7,
              border: tab === 'chapter' ? '2px solid #4f46e5' : '1px solid #e5e7eb',
              background: tab === 'chapter' ? '#edeaff' : '#f9fafb',
              color: tab === 'chapter' ? '#4f46e5' : '#374151',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            This Chapter
          </button>
          <button
            onClick={() => setTab('book')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 7,
              border: tab === 'book' ? '2px solid #4f46e5' : '1px solid #e5e7eb',
              background: tab === 'book' ? '#edeaff' : '#f9fafb',
              color: tab === 'book' ? '#4f46e5' : '#374151',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            This Book
          </button>
        </div>
        {/* 3-dots button under tabs, above verses */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <div style={{ position: 'relative' }} className="dropdown-container">
            <button
              className="control-btn"
              style={{ background: '#f3f4f6', color: '#374151', padding: '0.7rem', minWidth: 'auto', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '1.35rem' }}
              onClick={() => setShowCopyDropdown(v => !v)}
              title="Copy Options"
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
                    let text = '';
                    const getText = ([key]) => {
                      const [book, chapter, verse] = key.split('-');
                      let verseText = '';
                      try {
                        if (lang === 'te') {
                          const teluguBook = bookNameMapping[book] || book;
                          verseText = getTeluguVerse(teluguBook, chapter, verse) || '';
                        } else {
                          // English: use getVerse with the original book name (no mapping)
                          verseText = getVerse(book, chapter, verse) || '';
                        }
                      } catch {}
                      return `${book} ${chapter}:${verse} - ${verseText}`;
                    };
                    if (tab === 'chapter') {
                      text = chapterBookmarks.map(getText).join('\n');
                    } else {
                      text = bookBookmarks.map(getText).join('\n');
                    }
                    if (text) await navigator.clipboard.writeText(text);
                    setShowCopyDropdown(false);
                  }}
                >
                  Copy Verses
                </button>
              </div>
            )}
          </div>
        </div>
        {tab === 'chapter' ? renderList(chapterBookmarks) : renderList(bookBookmarks)}
      </div>
    </div>
  );
};

export default BookmarkListModal;
