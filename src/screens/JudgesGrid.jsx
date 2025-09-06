import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
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
    tribe: lang === 'te' ? judge.tribeTelugu : judge.tribe,
    period: judge.period,
    yearsOfJudgeship: lang === 'te' ? judge.yearsOfJudgeshipTelugu : judge.yearsOfJudgeship,
    oppressor: lang === 'te' ? judge.oppressorTelugu : judge.oppressor,
    // Keep original numeric values for chart regardless of language
    yearsOfJudgeshipNumeric: judge.yearsOfJudgeship,
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
    }
  ];

  // Chart configuration
  const chartConfig = {
    dataKey: 'yearsOfJudgeshipNumeric', // Use numeric value for chart
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

  // Custom row renderer for judges with clickable names
  const customRowRenderer = (row, index, tooltipHandlers = {}) => {
    const { handleMouseEnter, handleMouseLeave, handleMouseMove } = tooltipHandlers;
    return (
      <tr
        key={index}
        className={`table-row ${index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}`}
      >
        {columns.map((column, colIndex) => {
          const value = row[column.dataKey];
          
          // Special handling for judge column to make it clickable
          if (column.dataKey === 'judge') {
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

  // Function to handle judge name click
  const handleDetailsClick = (rowData) => {
    if (rowData._original) {
      setSelectedJudge(rowData._original);
      setShowDetailsModal(true);
    }
  };

  // Custom bilingual filter function
  const bilingualFilter = (row, filterText) => {
    if (!filterText) return true;
    const searchText = filterText.toLowerCase();
    
    // Get the original judge data to access both English and Telugu fields
    const originalJudge = row._original;
    if (!originalJudge) return false;
    
    // Search in both English and Telugu fields
    const searchFields = [
      // Judge name (multiple variations)
      originalJudge.name,
      originalJudge.nameTelugu,
      originalJudge.nameHebrew,
      // Tribe information
      originalJudge.tribe,
      originalJudge.tribeTelugu,
      // Period and oppressor
      originalJudge.period,
      originalJudge.oppressor,
      originalJudge.oppressorTelugu,
      // Years information
      originalJudge.yearsOfJudgeship?.toString(),
      originalJudge.yearsOfJudgeshipTelugu,
      originalJudge.yearsOfOppression?.toString(),
      originalJudge.yearsOfOppressionTelugu,
      // Description and significance
      originalJudge.description?.en,
      originalJudge.description?.te,
      originalJudge.significance?.en,
      originalJudge.significance?.te,
      // Scripture reference
      originalJudge.scripture
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
        title={translations.judges.title}
        icon={iconConfig}
        chartConfig={chartConfig}
        customFilter={bilingualFilter}
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
