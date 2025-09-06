import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import DataGrid from '../components/DataGrid';
import Modal from '../components/Modal';
import prophetsData from '../assets/data/prophetsData.json';
import menuConfig from '../assets/data/menuConfig.json';
import translationsData from '../assets/data/translations.json';

export default function ProphetsGrid({ lang, section = 'list-of-prophets' }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProphet, setSelectedProphet] = useState(null);

  // Load menu config for icon and color
  const prophetsMenu = menuConfig.menus.prophets.find(m => m.key === section) || {};
  const Icon = FaUser;
  const iconColor = '#10b981';

  // Get translations from JSON data
  const translations = translationsData[lang] || translationsData.en;
  
  // Transform prophets data for DataGrid
  const data = prophetsData.prophets.map((prophet, index) => {
    const booksWrittenArr = lang === 'te' 
      ? prophet.booksWrittenTelugu 
      : prophet.booksWritten;

    // Calculate number of books for chart (numeric value)
    const booksCount = Array.isArray(prophet.booksWritten) 
      ? prophet.booksWritten.length 
      : (prophet.booksWritten && prophet.booksWritten !== 'None' ? 1 : 0);

    // Extract numeric years from ministry field for chart
    const ministryYears = (() => {
      const ministryStr = Array.isArray(prophet.ministry) ? prophet.ministry.join(', ') : prophet.ministry;
      const match = ministryStr.match(/(\d+)\+?\s*years?/i);
      return match ? parseInt(match[1], 10) : 0;
    })();

    return {
      prophet: lang === 'te' ? prophet.nameTelugu : prophet.name,
      period: prophet.period,
      ministry: Array.isArray(prophet.ministry) ? prophet.ministry.join(', ') : prophet.ministry,
      type: lang === 'te' ? prophet.ministryTypeTelugu : (prophet.category || prophet.type || 'Prophet'),
      nation: lang === 'te' ? prophet.nationTelugu : prophet.nation,
      booksWritten: Array.isArray(booksWrittenArr) 
        ? booksWrittenArr.join(', ') 
        : booksWrittenArr,
      
      // Add numeric fields for chart
      booksWrittenCount: booksCount,
      ministryYears: ministryYears,
      
      // Keep original data for detailed view
      _original: prophet
    };
  });

  // Define columns for the prophets grid
  const columns = [
    {
      header: translations.prophets.prophet,
      dataKey: 'prophet'
    },
    {
      header: translations.common.period,
      dataKey: 'period'
    },
    {
      header: translations.prophets.ministry,
      dataKey: 'ministry'
    },
    {
      header: translations.prophets.type,
      dataKey: 'type'
    },
    {
      header: translations.prophets.nation,
      dataKey: 'nation'
    },
    {
      header: translations.common.booksWritten,
      dataKey: 'booksWritten'
    }
  ];

  // Chart configuration
  const chartConfig = {
    dataKey: 'ministryYears', // Use ministry years for chart
    xDataKey: 'prophet',
    label: translations.prophets.ministryYears || 'Ministry Years',
    xLabel: translations.prophets.prophet,
    yLabel: translations.prophets.ministryYears || 'Ministry Years'
  };

  // Icon configuration
  const iconConfig = {
    Icon: Icon,
    color: iconColor
  };

  // Custom row renderer for prophets with clickable names
  const customRowRenderer = (row, index, tooltipHandlers = {}) => {
    const { handleMouseEnter, handleMouseLeave, handleMouseMove } = tooltipHandlers;
    return (
      <tr
        key={index}
        className={`table-row ${index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}`}
      >
        {columns.map((column, colIndex) => {
          const value = row[column.dataKey];
          
          // Special handling for prophet column to make it clickable
          if (column.dataKey === 'prophet') {
            return (
              <td 
                key={colIndex} 
                className="table-cell"
                onMouseEnter={handleMouseEnter ? (e) => handleMouseEnter(e, value) : undefined}
                onMouseLeave={handleMouseLeave || undefined}
                onMouseMove={handleMouseMove || undefined}
              >
                <span 
                  onClick={(e) => {
                    if (handleMouseLeave) handleMouseLeave(); // Hide tooltip
                    handleDetailsClick(row);
                  }}
                  style={{ 
                    color: '#6366f1', 
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#4f46e5';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#6366f1';
                  }}
                >
                  {value}
                </span>
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

  // Function to handle details icon click
  const handleDetailsClick = (rowData) => {
    if (rowData._original) {
      setSelectedProphet(rowData._original);
      setShowDetailsModal(true);
    }
  };

  // Custom bilingual filter function
  const bilingualFilter = (row, filterText) => {
    if (!filterText) return true;
    const searchText = filterText.toLowerCase();
    
    // Get the original prophet data to access both English and Telugu fields
    const originalProphet = row._original;
    if (!originalProphet) return false;
    
    // Search in both English and Telugu fields
    const searchFields = [
      // Prophet name (multiple variations)
      originalProphet.name,
      originalProphet.nameTelugu,
      originalProphet.nameHebrew,
      // Alternative names
      originalProphet.alternativeNames?.en,
      originalProphet.alternativeNames?.te,
      // Period and category
      originalProphet.period,
      originalProphet.category,
      // Ministry and location info
      originalProphet.ministry,
      originalProphet.birthPlace,
      originalProphet.deathPlace,
      // Books written (both languages)
      ...(Array.isArray(originalProphet.booksWritten) ? originalProphet.booksWritten : []),
      ...(Array.isArray(originalProphet.booksWrittenTelugu) ? originalProphet.booksWrittenTelugu : []),
      // Description fields
      originalProphet.description?.en,
      originalProphet.description?.te
    ];
    
    // Check if search text matches any of the fields
    return searchFields.some(field => 
      field && field.toString().toLowerCase().includes(searchText)
    );
  };

  return (
    <div style={{ 
      height: '100%', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <DataGrid
        data={data}
        columns={columns}
        translations={translations}
        lang={lang}
        title={translations.prophets.title}
        icon={iconConfig}
        chartConfig={chartConfig}
        customFilter={bilingualFilter}
        customRowRenderer={customRowRenderer}
      />

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedProphet ? (lang === 'te' ? selectedProphet.nameTelugu : selectedProphet.name) : ''}
        closeLabel={translations.common.close}
      >
        {selectedProphet && (
          <div>
            <div className="mb-20">
              <div className="details-modal-grid">
                <div className="details-modal-field">
                  <div className="details-modal-label">{translations.common.period}:</div>
                  <div className="details-modal-value">{selectedProphet.period}</div>
                </div>
                <div className="details-modal-field">
                  <div className="details-modal-label">{translations.prophets.ministry}:</div>
                  <div className="details-modal-value">{selectedProphet.ministry}</div>
                </div>
                <div className="details-modal-field">
                  <div className="details-modal-label">{translations.common.category}:</div>
                  <div className="details-modal-value">{selectedProphet.category}</div>
                </div>
                <div className="details-modal-field">
                  <div className="details-modal-label">{translations.common.booksWritten}:</div>
                  <div className="details-modal-value">
                    {(() => {
                      const booksArray = lang === 'te' && selectedProphet.booksWrittenTelugu
                        ? selectedProphet.booksWrittenTelugu
                        : selectedProphet.booksWritten;
                      
                      return Array.isArray(booksArray) 
                        ? booksArray.join(', ') 
                        : (booksArray || translations.common.none);
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {selectedProphet.description && (
              <div className="details-modal-section">
                <h3>{translations.common.biography}</h3>
                <p className="details-modal-text">
                  {lang === 'te' ? selectedProphet.description?.te : selectedProphet.description?.en}
                </p>
              </div>
            )}

            {selectedProphet.significance && (
              <div className="details-modal-section">
                <h3>{translations.common.significance}</h3>
                <p className="details-modal-text">
                  {lang === 'te' ? selectedProphet.significance?.te : selectedProphet.significance?.en}
                </p>
              </div>
            )}

            {selectedProphet.keyProphecies && (
              <div className="details-modal-section">
                <h3>{translations.common.keyProphecies}</h3>
                <ul className="details-modal-list">
                  {(lang === 'te' && selectedProphet.keyPropheciesTelugu 
                    ? selectedProphet.keyPropheciesTelugu 
                    : selectedProphet.keyProphecies
                  ).map((prophecy, index) => (
                    <li key={index}>{prophecy}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedProphet.keyVerse && (
              <div className="details-modal-scripture">
                <div className="details-modal-scripture-label">{translations.scripture}:</div>
                <div className="details-modal-scripture-text">
                  "{selectedProphet.keyVerse}"
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
