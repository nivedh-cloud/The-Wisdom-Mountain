import React, { useState } from 'react';
import { FaUser, FaInfoCircle } from 'react-icons/fa';
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
  const data = prophetsData.prophets.map((prophet, index) => ({
    prophet: lang === 'te' ? prophet.nameTelugu : prophet.name,
    period: prophet.period,
    ministry: Array.isArray(prophet.ministry) ? prophet.ministry.join(', ') : prophet.ministry,
    type: prophet.category || prophet.type || 'Prophet',
    booksWritten: Array.isArray(prophet.booksWritten) 
      ? prophet.booksWritten.length 
      : (prophet.booksWritten ? 1 : 0),
    booksWrittenText: Array.isArray(prophet.booksWritten) 
      ? prophet.booksWritten.join(', ') 
      : prophet.booksWritten || 'None',
    details: 'VIEW_DETAILS',
    // Keep original data for detailed view
    _original: prophet
  }));

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
      header: translations.common.booksWritten,
      dataKey: 'booksWrittenText'
    },
    {
      header: translations.common.details,
      dataKey: 'details',
      formatter: (value, row, lang) => value === 'VIEW_DETAILS' ? 'DETAILS_ICON' : value
    }
  ];

  // Chart configuration
  const chartConfig = {
    dataKey: 'booksWritten',
    xDataKey: 'prophet',
    label: translations.prophets.chartLabel,
    xLabel: translations.prophets.prophet,
    yLabel: translations.prophets.chartLabel
  };

  // Icon configuration
  const iconConfig = {
    Icon: Icon,
    color: iconColor
  };

  // Custom row renderer for prophets with details icon
  const customRowRenderer = (row, index) => (
    <tr
      key={index}
      className={`table-row ${index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}`}
    >
      {columns.map((column, colIndex) => {
        let value = row[column.dataKey];
        
        // Apply custom formatter if provided
        if (column.formatter) {
          value = column.formatter(value, row, lang);
        }

        // Special handling for details icon column
        if (value === 'DETAILS_ICON') {
          return (
            <td key={colIndex} className="table-cell text-center">
              <FaInfoCircle
                onClick={() => handleDetailsClick(row)}
                className="details-icon"
                title={translations.common.viewDetails}
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

  // Function to handle details icon click
  const handleDetailsClick = (rowData) => {
    if (rowData._original) {
      setSelectedProphet(rowData._original);
      setShowDetailsModal(true);
    }
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
                    {Array.isArray(selectedProphet.booksWritten) 
                      ? selectedProphet.booksWritten.join(', ') 
                      : (selectedProphet.booksWritten || translations.common.none)}
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
                  {selectedProphet.keyProphecies.map((prophecy, index) => (
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
