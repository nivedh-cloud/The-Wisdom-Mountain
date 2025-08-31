import React, { useState } from 'react';
import { FaUser, FaInfoCircle } from 'react-icons/fa';
import DataGrid from '../components/DataGrid';
import Modal from '../components/Modal';
import judgesData from '../assets/data/judgesData.json';
import menuConfig from '../assets/data/menuConfig.json';
import translationsData from '../assets/data/translations.json';

export default function JudgesGrid({ lang, section = 'list-of-judges' }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState(null);

  // Load menu config for icon and color
  const judgesMenu = menuConfig.menus.judges.find(m => m.key === section) || {};
  const Icon = FaUser;
  const iconColor = '#8b5cf6';

  // Get translations from JSON data
  const translations = translationsData[lang] || translationsData.en;
  
  // Transform judges data for DataGrid
  const data = judgesData.judges.map(judge => ({
    judge: lang === 'te' ? judge.nameTelugu : judge.name,
    tribe: judge.tribe,
    period: judge.period,
    yearsOfJudgeship: judge.yearsOfJudgeship,
    oppressor: judge.oppressor,
    details: 'VIEW_DETAILS', // Special value for details icon
    // Keep original data for detailed view
    _original: judge
  }));

  // Define columns for the judges grid
  const columns = [
    {
      header: translations.judges.judge,
      dataKey: 'judge'
    },
    {
      header: translations.judges.tribe,
      dataKey: 'tribe'
    },
    {
      header: translations.common.period,
      dataKey: 'period'
    },
    {
      header: translations.judges.yearsOfJudgeship,
      dataKey: 'yearsOfJudgeship'
    },
    {
      header: translations.judges.oppressor,
      dataKey: 'oppressor'
    },
    {
      header: translations.common.details,
      dataKey: 'details',
      formatter: (value, row, lang) => {
        if (value === 'VIEW_DETAILS') {
          return 'DETAILS_ICON'; // Special value to render details icon
        }
        return '';
      }
    }
  ];

  // Chart configuration
  const chartConfig = {
    dataKey: 'yearsOfJudgeship',
    xDataKey: 'judge',
    label: translations.judges.chartLabel,
    xLabel: translations.judges.judge,
    yLabel: translations.judges.chartLabel
  };

  // Icon configuration
  const iconConfig = {
    Icon: Icon,
    color: iconColor
  };

  // Custom row renderer for judges with details icon
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
      setSelectedJudge(rowData._original);
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
        title={translations.judges.title}
        icon={iconConfig}
        chartConfig={chartConfig}
        customRowRenderer={customRowRenderer}
      />

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedJudge ? (lang === 'te' ? selectedJudge.nameTelugu : selectedJudge.name) : ''}
        closeLabel={translations.common.close}
      >
        {selectedJudge && (
          <div>
            <div className="mb-20">
              <div className="details-modal-grid">
                <div className="details-modal-field">
                  <div className="details-modal-label">{translations.judges.tribe}:</div>
                  <div className="details-modal-value">{selectedJudge.tribe}</div>
                </div>
                <div className="details-modal-field">
                  <div className="details-modal-label">{translations.common.period}:</div>
                  <div className="details-modal-value">{selectedJudge.period}</div>
                </div>
                <div className="details-modal-field">
                  <div className="details-modal-label">{translations.judges.yearsOfJudgeship}:</div>
                  <div className="details-modal-value">{selectedJudge.yearsOfJudgeship}</div>
                </div>
                <div className="details-modal-field">
                  <div className="details-modal-label">{translations.judges.oppressor}:</div>
                  <div className="details-modal-value">{selectedJudge.oppressor}</div>
                </div>
              </div>
            </div>

            {selectedJudge.description && (
              <div className="details-modal-section">
                <h3>{translations.common.biography}</h3>
                <p className="details-modal-text">
                  {lang === 'te' ? selectedJudge.description?.te : selectedJudge.description?.en}
                </p>
              </div>
            )}

            {selectedJudge.significance && (
              <div className="details-modal-section">
                <h3>{translations.common.achievements}</h3>
                <p className="details-modal-text">
                  {lang === 'te' ? selectedJudge.significance?.te : selectedJudge.significance?.en}
                </p>
              </div>
            )}

            {selectedJudge.scripture && (
              <div className="details-modal-scripture">
                <div className="details-modal-scripture-label">{translations.scripture}:</div>
                <div className="details-modal-scripture-text">
                  {selectedJudge.scripture}
                </div>
                {selectedJudge.keyVerse && (
                  <div className="details-modal-scripture-text mt-8">
                    "{selectedJudge.keyVerse}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
