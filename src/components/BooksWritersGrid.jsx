import React, { useState } from 'react';
import { FaBook, FaBookOpen, FaUser, FaList, FaInfoCircle } from 'react-icons/fa';
import { localized } from '../utils/i18n';
import DataGrid from './DataGrid';
import Modal from './Modal';
import biblicalBooksData from '../assets/data/biblicalBooksData.json';
import oldTestamentBookDetails from '../assets/data/book-details.json';
import newTestamentBookDetails from '../assets/data/new-testament-book-details.json';

const BooksWritersGrid = ({ lang, page }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedBookDetails, setSelectedBookDetails] = useState(null);

  // Determine category and subcategory from page
  const getCategoryFromPage = () => {
    if (page === 'biblical-authors') {
      return { category: 'biblical-authors', subCategory: null };
    } else if (page === 'old-testament-books') {
      // Show all Old Testament books (all subcategories combined)
      return { category: 'old-testament-books', subCategory: 'all' };
    } else if (page === 'new-testament-books') {
      // Show all New Testament books (all subcategories combined)
      return { category: 'new-testament-books', subCategory: 'all' };
    } else if (page.startsWith('old-testament-')) {
      const subCategory = page.replace('old-testament-', '');
      return { category: 'old-testament-books', subCategory };
    } else if (page.startsWith('new-testament-')) {
      const subCategory = page.replace('new-testament-', '');
      return { category: 'new-testament-books', subCategory };
    }
    // Default fallback
    return { category: 'old-testament-books', subCategory: 'all' };
  };

  const { category: selectedCategory, subCategory: selectedSubCategory } = getCategoryFromPage();

  // Function to translate category names
  const getCategoryTranslation = (category, lang) => {
    if (lang !== 'te') return category;
    
    const categoryTranslations = {
      'Law/Torah': 'ధర్మశాస్త్రం/తోరా',
      'History': 'చరిత్ర',
      'Wisdom': 'జ్ఞానోపదేశ గ్రంథాలు',
      'Wisdom/Poetry': 'జ్ఞానోపదేశ/కవిత్వ గ్రంథాలు',
      'Major Prophet': 'ప్రధాన ప్రవక్త',
      'Minor Prophet': 'చిన్న ప్రవక్త',
      'Gospel': 'సువార్త',
      'Pauline Epistle': 'పౌలు లేఖలు',
      'General Epistle': 'సాధారణ లేఖలు',
      'Prophecy': 'ప్రవచనం'
    };
    
    return categoryTranslations[category] || category;
  };

  // Get page title based on current page
  const getPageTitle = () => {
    if (selectedCategory === 'biblical-authors') {
      return t.biblicalAuthors;
    } else if (selectedCategory === 'old-testament-books') {
      if (selectedSubCategory === 'all') {
        return t.oldTestamentBooks;
      }
      const categoryLabels = {
        torah: t.torah,
        historical: t.historical,
        wisdom: t.wisdom,
        majorProphets: t.majorProphets,
        minorProphets: t.minorProphets
      };
      return categoryLabels[selectedSubCategory] || t.oldTestamentBooks;
    } else if (selectedCategory === 'new-testament-books') {
      if (selectedSubCategory === 'all') {
        return t.newTestamentBooks;
      }
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
      title: 'Biblical Books',
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
      writtenDate: 'Written Time'
      ,
      mainPersons: 'Main Persons'
      ,
      mainVerses: 'Main Verses'
    },
    te: {
      title: 'బైబిల్ పుస్తకాలు',
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
    ,
    mainPersons: 'ప్రధాన వ్యక్తులు'
    ,
    mainVerses: 'ప్రధాన వచనాలు'
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
      name: localized(author, 'name', lang),
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
      let books = [];
      if (selectedSubCategory === 'all') {
        // Combine all Old Testament books from all subcategories
        books = [
          ...biblicalBooksData.oldTestament.torah,
          ...biblicalBooksData.oldTestament.historical,
          ...biblicalBooksData.oldTestament.wisdom,
          ...biblicalBooksData.oldTestament.majorProphets,
          ...biblicalBooksData.oldTestament.minorProphets
        ];
      } else {
        books = biblicalBooksData.oldTestament[selectedSubCategory] || [];
      }
      return books.map((book, index) => ({
        name: localized(book, 'name', lang),
        nameOriginal: book.nameHebrew || '',
        author: localized(book, 'author', lang),
        writtenDate: book.writtenDate,
        chapters: book.chapters,
        verses: book.verses,
        category: getCategoryTranslation(book.category, lang),
        theme: book.theme ? book.theme[lang] : '',
        details: 'VIEW_DETAILS',
        _original: book,
        _type: 'book'
      }));
    } else if (selectedCategory === 'new-testament-books') {
      let books = [];
      if (selectedSubCategory === 'all') {
        // Combine all New Testament books from all subcategories
        books = [
          ...biblicalBooksData.newTestament.gospels,
          ...biblicalBooksData.newTestament.history,
          ...biblicalBooksData.newTestament.paulineEpistles,
          ...biblicalBooksData.newTestament.generalEpistles,
          ...biblicalBooksData.newTestament.prophecy
        ];
      } else {
        books = biblicalBooksData.newTestament[selectedSubCategory] || [];
      }
      return books.map((book, index) => ({
        name: localized(book, 'name', lang),
        nameOriginal: book.nameGreek || '',
        author: localized(book, 'author', lang),
        writtenDate: book.writtenDate,
        chapters: book.chapters,
        verses: book.verses,
        category: getCategoryTranslation(book.category, lang),
        theme: book.theme ? book.theme[lang] : '',
        details: 'VIEW_DETAILS',
        _original: book,
        _type: 'book'
      }));
    }
    return [];
  };

    // ...existing code...

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
  const customRowRenderer = (row, index, tooltipHandlers = {}) => {
    const { handleMouseEnter, handleMouseLeave, handleMouseMove } = tooltipHandlers;
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
          // If this is the book name column, make it clickable
          if (column.dataKey === 'name' && row._type === 'book') {
            return (
              <td key={colIndex} className="table-cell book-name-cell" style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 500 }}
                onClick={() => handleBookNameClick(row._original.name)}>
                {value}
              </td>
            );
          }
          
          return (
            <td 
              key={colIndex} 
              className="table-cell"
              onMouseEnter={handleMouseEnter ? (e) => handleMouseEnter(e, value) : undefined}
              onMouseLeave={handleMouseLeave || undefined}
              onMouseMove={handleMouseMove || undefined}
            >
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
      // Find book details by name
      const details = (page.startsWith('new-testament-')
        ? newTestamentBookDetails
        : oldTestamentBookDetails
      ).find(
        b => b.book.toLowerCase() === rowData._original.name.toLowerCase()
      );
      setSelectedBookDetails(details || null);
      setShowDetailsModal(true);
    }
  };

  const handleBookNameClick = (bookName) => {
    // Find book details by name
    const details = (page.startsWith('new-testament-')
      ? newTestamentBookDetails
      : oldTestamentBookDetails
    ).find(
      b => b.book.toLowerCase() === bookName.toLowerCase()
    );
    setSelectedBookDetails(details || null);
    setShowDetailsModal(true);
  };

  // Custom bilingual filter function
  const bilingualFilter = (row, filterText) => {
    if (!filterText) return true;
    const searchText = filterText.toLowerCase();
    
    // Get the original item data to access both English and Telugu fields
    const originalItem = row._original;
    if (!originalItem) return false;
    
    // Search in both English and Telugu fields
    const searchFields = [
      // Book/Author name (multiple variations)
      originalItem.name,
      originalItem.nameTelugu,
      originalItem.nameHebrew,
      originalItem.nameGreek,
      // Author information
      originalItem.author,
      originalItem.authorTelugu,
      originalItem.authorHebrew,
      // Category and theme
      originalItem.category,
      originalItem.writtenDate,
      originalItem.theme?.en,
      originalItem.theme?.te,
      // Books written (for authors)
      ...(Array.isArray(originalItem.booksWritten) ? originalItem.booksWritten : []),
      ...(Array.isArray(originalItem.booksWrittenTelugu) ? originalItem.booksWrittenTelugu : []),
      // Numeric fields as strings
      originalItem.chapters?.toString(),
      originalItem.verses?.toString(),
      originalItem.totalBooks?.toString()
    ];
    
    // Check if search text matches any of the fields
    return searchFields.some(field => 
      field && field.toString().toLowerCase().includes(searchText)
    );
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
          customFilter={bilingualFilter}
          customRowRenderer={customRowRenderer}
        />
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedItem ? localized(selectedItem, 'name', lang) : ''}
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
            {/* Book extra details from book-details.json */}
            {selectedBookDetails && (
              <div style={{ marginTop: '20px' }}>
                {selectedBookDetails.mainEvents && (
                  <div style={{ marginBottom: '18px', background: 'rgba(99,102,241,0.06)', border: '1px solid #e0e7ff', borderRadius: '8px', padding: '16px' }}>
            {selectedBookDetails.mainEvents.map((event, idx) => {
              const title = localized(event, 'title', lang);
              const reference = localized(event, 'reference', lang);
              const text = localized(event, 'text', lang);
                      return (
                        <div key={idx} style={{ marginBottom: '12px' }}>
                          <strong>{title} :</strong><br />
                          <span style={{ fontWeight: 'bold' }}>{reference}:</span> {text}
                        </div>
                      );
                    })}
                  </div>
                )}
                {selectedBookDetails.mainPersons && (
                  <div style={{ marginBottom: '18px', background: 'rgba(99,102,241,0.06)', border: '1px solid #e0e7ff', borderRadius: '8px', padding: '16px' }}>
                    <strong>{t.mainPersons}:</strong><br />
                    <span>{(lang === 'te' && Array.isArray(selectedBookDetails.mainPersonsTe) && selectedBookDetails.mainPersonsTe.length > 0) ? selectedBookDetails.mainPersonsTe.join(', ') : (selectedBookDetails.mainPersons || []).join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Book Name Modal Preview */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedBookDetails ? (localized(selectedBookDetails, 'book', lang) || selectedBookDetails.book) : ''}
        closeLabel={t.close}
      >
        {selectedBookDetails ? (
          <div style={{
            textAlign: 'left'
          }}>
            {/* Main Events section with title, reference, and text */}
                {selectedBookDetails.mainEvents && (
              <div style={{ marginBottom: '18px', background: 'rgba(99,102,241,0.06)', border: '1px solid #e0e7ff', borderRadius: '8px', padding: '16px' }}>
                <h4>{t.mainVerses}:</h4><br />
                {selectedBookDetails.mainEvents.map((event, idx) => {
                  const title = localized(event, 'title', lang);
                  const reference = localized(event, 'reference', lang);
                  const text = localized(event, 'text', lang);
                  return (
                    <div key={idx} style={{ marginBottom: '12px' }}>
                      <strong>{title} :</strong><br />
                      <span style={{ fontWeight: 'bold' }}>{reference}:</span> {text}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Main Persons as comma separated inline list */}
            {selectedBookDetails.mainPersons && (
              <div style={{ marginBottom: '18px', background: 'rgba(99,102,241,0.06)', border: '1px solid #e0e7ff', borderRadius: '8px', padding: '16px' }}>
                <h4>{t.mainPersons}:</h4><br />
                <span>{(lang === 'te' && Array.isArray(selectedBookDetails.mainPersonsTe) && selectedBookDetails.mainPersonsTe.length > 0) ? selectedBookDetails.mainPersonsTe.join(', ') : (selectedBookDetails.mainPersons || []).join(', ')}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'left', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>No details available for this book.</div>
        )}
      </Modal>
    </div>
  );
};

export default BooksWritersGrid;
