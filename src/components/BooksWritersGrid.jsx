import React, { useState } from 'react';
import { FaBook, FaBookOpen, FaUser, FaList, FaInfoCircle } from 'react-icons/fa';
import DataGrid from './DataGrid';
import Modal from './Modal';
import biblicalBooksData from '../assets/data/biblicalBooksData.json';

const BooksWritersGrid = ({ lang, page }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Determine category and subcategory from page
  const getCategoryFromPage = () => {
    if (page === 'biblical-authors') {
      return { category: 'biblical-authors', subCategory: null };
    } else if (page.startsWith('old-testament-')) {
      const subCategory = page.replace('old-testament-', '');
      return { category: 'old-testament-books', subCategory };
    } else if (page.startsWith('new-testament-')) {
      const subCategory = page.replace('new-testament-', '');
      return { category: 'new-testament-books', subCategory };
    }
    // Default fallback
    return { category: 'old-testament-books', subCategory: 'torah' };
  };

  const { category: selectedCategory, subCategory: selectedSubCategory } = getCategoryFromPage();

  // Get page title based on current page
  const getPageTitle = () => {
    if (selectedCategory === 'biblical-authors') {
      return t.biblicalAuthors;
    } else if (selectedCategory === 'old-testament-books') {
      const categoryLabels = {
        torah: t.torah,
        historical: t.historical,
        wisdom: t.wisdom,
        majorProphets: t.majorProphets,
        minorProphets: t.minorProphets
      };
      return categoryLabels[selectedSubCategory] || t.oldTestamentBooks;
    } else if (selectedCategory === 'new-testament-books') {
      const categoryLabels = {
        gospels: t.gospels,
        history: t.history,
        paulineEpistles: t.paulineEpistles,
        generalEpistles: t.generalEpistles,
        prophecy: t.prophecy
      };
      return categoryLabels[selectedSubCategory] || t.newTestamentBooks;
    }
    return t.title;
  };

  const translations = {
    en: {
      title: 'Biblical Books & Writers',
      book: 'Book',
      author: 'Author',
      period: 'Period',
      chapters: 'Chapters',
      verses: 'Verses',
      category: 'Category',
      theme: 'Theme',
      significance: 'Significance',
      details: 'Details',
      viewDetails: 'View Details',
      close: 'Close',
      oldTestamentBooks: 'Old Testament Books',
      newTestamentBooks: 'New Testament Books',
      biblicalAuthors: 'Biblical Authors',
      booksByCategory: 'Books by Category',
      torah: 'Torah/Law',
      historical: 'Historical',
      wisdom: 'Wisdom',
      majorProphets: 'Major Prophets',
      minorProphets: 'Minor Prophets',
      gospels: 'Gospels',
      history: 'History',
      paulineEpistles: 'Pauline Epistles',
      generalEpistles: 'General Epistles',
      prophecy: 'Prophecy',
      role: 'Role',
      booksWritten: 'Books Written',
      totalBooks: 'Total Books',
      keyVerse: 'Key Verse',
      writtenDate: 'Written Date'
    },
    te: {
      title: 'బైబిల్ పుస్తకాలు మరియు రచయితలు',
      book: 'పుస్తకం',
      author: 'రచయిత',
      period: 'కాలం',
      chapters: 'అధ్యాయాలు',
      verses: 'శ్లోకాలు',
      category: 'వర్గం',
      theme: 'అంశం',
      significance: 'ప్రాముఖ్యత',
      details: 'వివరాలు',
      viewDetails: 'వివరాలు చూడండి',
      close: 'మూసివేయి',
      oldTestamentBooks: 'పాత నిబంధన పుస్తకాలు',
      newTestamentBooks: 'కొత్త నిబంధన పుస్తకాలు',
      biblicalAuthors: 'బైబిల్ రచయితలు',
      booksByCategory: 'వర్గం వారీగా పుస్తకాలు',
      torah: 'తోరా/ధర్మశాస్త్రం',
      historical: 'చారిత్రక',
      wisdom: 'జ్ఞాన',
      majorProphets: 'ప్రధాన ప్రవక్తలు',
      minorProphets: 'చిన్న ప్రవక్తలు',
      gospels: 'సువార్తలు',
      history: 'చరిత్ర',
      paulineEpistles: 'పౌలు పత్రికలు',
      generalEpistles: 'సాధారణ పత్రికలు',
      prophecy: 'ప్రవచనం',
      role: 'పాత్ర',
      booksWritten: 'రచించిన పుస్తకాలు',
      totalBooks: 'మొత్తం పుస్తకాలు',
      keyVerse: 'ముఖ్య వచనం',
      writtenDate: 'రచించబడిన తేదీ'
    }
  };

  const t = translations[lang] || translations.en;

  const categories = {
    'old-testament-books': t.oldTestamentBooks,
    'new-testament-books': t.newTestamentBooks,
    'biblical-authors': t.biblicalAuthors,
    'books-by-category': t.booksByCategory
  };

  const oldTestamentCategories = {
    torah: t.torah,
    historical: t.historical,
    wisdom: t.wisdom,
    majorProphets: t.majorProphets,
    minorProphets: t.minorProphets
  };

  const newTestamentCategories = {
    gospels: t.gospels,
    history: t.history,
    paulineEpistles: t.paulineEpistles
  };

  // Get data based on selected category
  const getData = () => {
    if (selectedCategory === 'biblical-authors') {
      return biblicalBooksData.biblicalAuthors.map((author, index) => ({
        name: lang === 'te' ? author.nameTelugu : author.name,
        nameOriginal: author.nameHebrew || author.nameGreek || '',
        period: author.period,
        role: author.role,
        totalBooks: author.totalBooks,
        booksWritten: Array.isArray(author.booksWritten) ? author.booksWritten.join(', ') : author.booksWritten,
        significance: author.significance[lang],
        details: 'VIEW_DETAILS',
        _original: author,
        _type: 'author'
      }));
    } else if (selectedCategory === 'old-testament-books') {
      const books = biblicalBooksData.oldTestament[selectedSubCategory] || [];
      return books.map((book, index) => ({
        name: lang === 'te' ? book.nameTelugu : book.name,
        nameOriginal: book.nameHebrew || '',
        author: book.author,
        writtenDate: book.writtenDate,
        chapters: book.chapters,
        verses: book.verses,
        category: book.category,
  theme: book.theme ? book.theme[lang] : '',
        details: 'VIEW_DETAILS',
        _original: book,
        _type: 'book'
      }));
    } else if (selectedCategory === 'new-testament-books') {
      const books = biblicalBooksData.newTestament[selectedSubCategory] || [];
      return books.map((book, index) => ({
        name: lang === 'te' ? book.nameTelugu : book.name,
        nameOriginal: book.nameGreek || '',
        author: book.author,
        writtenDate: book.writtenDate,
        chapters: book.chapters,
        verses: book.verses,
        category: book.category,
  theme: book.theme ? book.theme[lang] : '',
        details: 'VIEW_DETAILS',
        _original: book,
        _type: 'book'
      }));
    }
    return [];
  };

  // Get columns based on data type
  const getColumns = () => {
    if (selectedCategory === 'biblical-authors') {
      return [
        { header: t.author, dataKey: 'name' },
        { header: lang === 'en' ? 'Original' : 'మూలం', dataKey: 'nameOriginal' },
        { header: t.period, dataKey: 'period' },
        { header: t.role, dataKey: 'role' },
        { header: t.totalBooks, dataKey: 'totalBooks' },
        { header: t.booksWritten, dataKey: 'booksWritten' },
        { 
          header: t.details, 
          dataKey: 'details',
          formatter: (value) => value === 'VIEW_DETAILS' ? 'DETAILS_ICON' : value
        }
      ];
    } else {
      return [
        { header: t.book, dataKey: 'name' },
        { header: lang === 'en' ? 'Original' : 'మూలం', dataKey: 'nameOriginal' },
        { header: t.author, dataKey: 'author' },
        { header: t.writtenDate, dataKey: 'writtenDate' },
        { header: t.chapters, dataKey: 'chapters' },
        { header: t.verses, dataKey: 'verses' },
        { header: t.category, dataKey: 'category' },
        { 
          header: t.details, 
          dataKey: 'details',
          formatter: (value) => value === 'VIEW_DETAILS' ? 'DETAILS_ICON' : value
        }
      ];
    }
  };

  // Custom row renderer with details icon
  const customRowRenderer = (row, index) => {
    const columns = getColumns();
    return (
      <tr
        key={index}
        className={`table-row ${index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}`}
      >
        {columns.map((column, colIndex) => {
          let value = row[column.dataKey];
          
          if (column.formatter) {
            value = column.formatter(value, row, lang);
          }

          if (value === 'DETAILS_ICON') {
            return (
              <td key={colIndex} className="table-cell text-center">
                <FaInfoCircle
                  onClick={() => handleDetailsClick(row)}
                  className="details-icon"
                  title={t.viewDetails}
                  style={{ cursor: 'pointer', color: '#6366f1' }}
                />
              </td>
            );
          }
          
          return (
            <td key={colIndex} className="table-cell">
              {value}
            </td>
          );
        })}
      </tr>
    );
  };

  const handleDetailsClick = (rowData) => {
    if (rowData._original) {
      setSelectedItem(rowData._original);
      setShowDetailsModal(true);
    }
  };

  const data = getData();
  const columns = getColumns();

  const iconConfig = {
    Icon: selectedCategory === 'biblical-authors' ? FaUser : FaBook,
    color: '#6366f1'
  };

  const chartConfig = {
    dataKey: selectedCategory === 'biblical-authors' ? 'totalBooks' : 'chapters',
    xDataKey: 'name',
    label: selectedCategory === 'biblical-authors' ? t.totalBooks : t.chapters,
    xLabel: selectedCategory === 'biblical-authors' ? t.author : t.book,
    yLabel: selectedCategory === 'biblical-authors' ? t.totalBooks : t.chapters
  };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* DataGrid - Full Width */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid
          data={data}
          columns={columns}
          translations={translations[lang]}
          lang={lang}
          title={getPageTitle()}
          icon={iconConfig}
          chartConfig={chartConfig}
          customRowRenderer={customRowRenderer}
        />
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedItem ? (lang === 'te' ? selectedItem.nameTelugu : selectedItem.name) : ''}
        closeLabel={t.close}
      >
        {selectedItem && (
          <div style={{ padding: '20px' }}>
            {selectedItem.nameHebrew && (
              <p><strong>{lang === 'en' ? 'Hebrew:' : 'హెబ్రూ:'}</strong> {selectedItem.nameHebrew}</p>
            )}
            {selectedItem.nameGreek && (
              <p><strong>{lang === 'en' ? 'Greek:' : 'గ్రీకు:'}</strong> {selectedItem.nameGreek}</p>
            )}
            {selectedItem.period && (
              <p><strong>{t.period}:</strong> {selectedItem.period}</p>
            )}
            {selectedItem.author && (
              <p><strong>{t.author}:</strong> {selectedItem.author}</p>
            )}
            {selectedItem.role && (
              <p><strong>{t.role}:</strong> {selectedItem.role}</p>
            )}
            {selectedItem.theme && (
              <p><strong>{t.theme}:</strong> {selectedItem.theme[lang]}</p>
            )}
            {selectedItem.keyVerse && (
              <div>
                <p><strong>{t.keyVerse}:</strong></p>
                <p style={{ fontStyle: 'italic', marginLeft: '10px' }}>{selectedItem.keyVerse}</p>
              </div>
            )}
            {selectedItem.significance && (
              <div>
                <p><strong>{t.significance}:</strong></p>
                <p style={{ marginLeft: '10px' }}>{selectedItem.significance[lang]}</p>
              </div>
            )}
            {selectedItem.booksWritten && (
              <div>
                <p><strong>{t.booksWritten}:</strong></p>
                <p style={{ marginLeft: '10px' }}>{
                  Array.isArray(selectedItem.booksWritten) 
                    ? selectedItem.booksWritten.join(', ') 
                    : selectedItem.booksWritten
                }</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BooksWritersGrid;
