import React from 'react';
import { FaBookmark } from 'react-icons/fa';

const COLORS = [
  { key: 'red', bg: '#fee2e2', color: '#dc2626', border: '#fecaca', icon: '#dc2626', title: 'Red' },
  { key: 'blue', bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe', icon: '#2563eb', title: 'Blue' },
  { key: 'green', bg: '#d1fae5', color: '#059669', border: '#a7f3d0', icon: '#059669', title: 'Green' },
  { key: 'yellow', bg: '#fff9c4', color: '#fbc02d', border: '#ffe082', icon: '#fbc02d', title: 'Yellow' },
  { key: 'purple', bg: '#ede9fe', color: '#7c3aed', border: '#c4b5fd', icon: '#7c3aed', title: 'Purple' },
  { key: 'orange', bg: '#ffe0b2', color: '#fb8c00', border: '#ffb74d', icon: '#fb8c00', title: 'Orange' },
];

const BookmarkColorDropdown = ({
  addBookmarkToSelectedVerses,
  setSelectedTeluguVerses,
  setSelectedEnglishVerses,
  setShowBookmarkDropdown,
  selectedTeluguVerses,
  selectedEnglishVerses,
}) => {
  const allSelectedVerses = new Set([
    ...Array.from(selectedTeluguVerses),
    ...Array.from(selectedEnglishVerses),
  ]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
      {COLORS.map((c) => (
        <button
          key={c.key}
          className="control-btn"
          style={{
            padding: '0.5rem',
            fontSize: '1.1rem',
            background: c.bg,
            color: c.color,
            border: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={c.title}
          onClick={() => {
            if (allSelectedVerses.size > 0) {
              addBookmarkToSelectedVerses(c.key);
              setSelectedTeluguVerses(new Set());
              setSelectedEnglishVerses(new Set());
              setShowBookmarkDropdown(false);
            }
          }}
        >
          <FaBookmark style={{ color: c.icon, fontSize: '1.3rem' }} />
        </button>
      ))}
    </div>
  );
};

export default BookmarkColorDropdown;
