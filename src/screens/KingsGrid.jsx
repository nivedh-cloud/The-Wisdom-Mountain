import React, { useState } from 'react';
import { FaCrown } from 'react-icons/fa';
import { GiCrownCoin } from 'react-icons/gi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend, Cell } from 'recharts';
import DataGrid from '../components/DataGrid';
import Modal from '../components/Modal';
import kingsData from '../assets/data/kingsData.json';
import judahKingsDetails from '../assets/data/kingsDetails.json';
import israelKingsDetails from '../assets/data/israelKingsDetails.json';
import prophetsDetails from '../assets/data/prophetsDetails.json';
import menuConfig from '../assets/data/menuConfig.json';
import { useTheme } from '../contexts/ThemeContext';

export default function KingsGrid({ lang, section = 'judah-kings' }) {
  const { isDarkMode } = useTheme();
  const [showKingModal, setShowKingModal] = useState(false);
  const [selectedKing, setSelectedKing] = useState(null);
  const [showProphetModal, setShowProphetModal] = useState(false);
  const [selectedProphet, setSelectedProphet] = useState(null);
  
  // Choose the correct details file based on the section
  const kingsDetails = section === 'israel-kings' ? israelKingsDetails.israelKingsDetails : judahKingsDetails.kingsDetails;

  // Load menu config for icon and color
  const kingsMenu = menuConfig.menus.kings.find(m => m.key === section) || {};
  const Icon = kingsMenu.icon === 'GiCrownCoin' ? GiCrownCoin : FaCrown;
  const iconColor = kingsMenu.iconColor || '#6366f1';

  const t = (kingsData.tableHeaders && kingsData.tableHeaders[lang]) || kingsData.tableHeaders.en;
  const data = kingsData[section].map(king => ({
    king: lang === 'te' ? king.kingTelugu : king.king,
    year: lang === 'te' ? king.yearTelugu : king.year,
    yearsRuled: lang === 'te' ? king.yearsRuledTelugu : king.yearsRuled,
    goodBad: lang === 'te' ? king.goodBadTelugu : king.goodBad,
    prophet: lang === 'te' ? king.prophetTelugu : king.prophet,
    // Keep original numeric values for chart regardless of language
    yearsRuledNumeric: king.yearsRuled,
    // Use unique ID for lookup instead of name
    _kingId: king.id,
    // Keep alternative names for display
    _alternativeNames: king.alternativeNames
  }));

  // Function to handle king name click
  const handleKingClick = (kingId) => {
    // Find king details using ID mapping
    let kingDetail = null;
    
    // Map IDs to original names used in details files
    const idToNameMapping = {
      // Judah Kings
      'saul': 'Saul',
      'david': 'David', 
      'solomon': 'Solomon',
      'rehoboam': 'Rehoboam',
      'abijah': 'Abijah',
      'asa': 'Asa',
      'jehoshaphat': 'Jehoshaphat',
      'jehoram': 'Jehoram',
      'ahaziah': 'Ahaziah',
      'athaliah': 'Athaliah',
      'joash': 'Joash',
      'amaziah': 'Amaziah',
      'uzziah': 'Uzziah',
      'jotham': 'Jotham',
      'ahaz': 'Ahaz',
      'hezekiah': 'Hezekiah',
      'manasseh': 'Manasseh',
      'amon': 'Amon',
      'josiah': 'Josiah',
      'jehoahaz': 'Jehoahaz',
      'jehoiakim': 'Jehoiakim',
      'jehoiachin': 'Jehoiachin',
      'zedekiah': 'Zedekiah',
      
      // Israel Kings
      'jeroboam1': 'Jeroboam I',
      'nadab': 'Nadab',
      'baasha': 'Baasha',
      'elah': 'Elah',
      'zimri': 'Zimri',
      'omri': 'Omri',
      'ahab': 'Ahab',
      'ahaziah-israel': 'Ahaziah (Israel)',
      'joram-israel': 'Joram',
      'jehu': 'Jehu',
      'jehoahaz-israel': 'Jehoahaz (Israel)',
      'jehoash-israel': 'Jehoash',
      'jeroboam2': 'Jeroboam II',
      'zechariah-israel': 'Zechariah',
      'shallum-israel': 'Shallum',
      'menahem': 'Menahem',
      'pekahiah': 'Pekahiah',
      'pekah': 'Pekah',
      'hoshea': 'Hoshea'
    };
    
    const originalName = idToNameMapping[kingId];
    if (originalName) {
      kingDetail = kingsDetails[originalName];
    }
    
    if (kingDetail) {
      setSelectedKing(kingDetail);
      setShowKingModal(true);
    }
  };

  // Function to handle prophet name click
  const handleProphetClick = (prophetName) => {
    console.log('Prophet clicked:', prophetName);
    console.log('Available prophets:', prophetsDetails.map(p => p.name));
    
    if (!prophetName || prophetName.trim() === '') {
      console.log('Empty prophet name, returning');
      return;
    }
    
    // Handle multiple prophets (e.g., "Nathan, Gad") - take the first one
    const firstProphetName = prophetName.split(',')[0].trim();
    console.log('First prophet name after split:', firstProphetName);
    
    // Find prophet details in the prophetsDetails array
    const prophetDetail = prophetsDetails.find(prophet => {
      const nameMatch = prophet.name === firstProphetName;
      const nameTeMatch = prophet.name_te === firstProphetName;
      const nameLowerMatch = prophet.name.toLowerCase() === firstProphetName.toLowerCase();
      
      console.log(`Checking prophet ${prophet.name}:`, {
        nameMatch,
        nameTeMatch,
        nameLowerMatch,
        prophetName: prophet.name,
        prophetNameTe: prophet.name_te,
        searchName: firstProphetName
      });
      
      return nameMatch || nameTeMatch || nameLowerMatch;
    });
    
    console.log('Found prophet detail:', prophetDetail);
    
    if (prophetDetail) {
      console.log('Setting prophet modal state...');
      setSelectedProphet(prophetDetail);
      setShowProphetModal(true);
      console.log('Prophet modal should be showing now');
    } else {
      console.log('Prophet not found, showing alert');
      // If prophet not found, show a simple alert or you could create a basic info modal
      alert(lang === 'te' 
        ? `${firstProphetName} గురించి వివరాలు అందుబాటులో లేవు` 
        : `Details for ${firstProphetName} are not available`
      );
    }
  };

  // Color categorization for kings based on Good/Bad/Repented status
  const getKingCategoryColor = (goodBad) => {
    const goodBadMapped = lang === 'te' ? {
      'మంచి': '#22c55e',
      'చెడు': '#ef4444',
      'మిశ్రమ': '#f59e0b',
      'పశ్చాత్తాపపడిన': '#8b5cf6'
    } : {
      'Good': '#22c55e',
      'Bad': '#ef4444',
      'Good/Bad': '#f59e0b',
      'Bad/Repented': '#8b5cf6'
    };
    return goodBadMapped[goodBad] || '#6b7280';
  };

  // Get category label
  const getCategoryLabel = (goodBad) => {
    const labels = {
      'Good': lang === 'te' ? 'మంచి రాజులు' : 'Good Kings',
      'Bad': lang === 'te' ? 'చెడ్డ రాజులు' : 'Bad Kings',
      'Good/Bad': lang === 'te' ? 'మిశ్రమ రాజులు' : 'Mixed Kings',
      'Bad/Repented': lang === 'te' ? 'పశ్చాత్తాపపడిన రాజులు' : 'Repented Kings'
    };
    return labels[goodBad] || goodBad;
  };

  // Prepare chart data with colors
  const chartData = data.map(king => ({
    ...king,
    color: getKingCategoryColor(king.goodBad),
    category: getCategoryLabel(king.goodBad)
  }));

  // Custom chart renderer for kings with color categorization
  const renderKingsChart = () => {
    const colors = {
      primary: isDarkMode ? '#818cf8' : '#6366f1',
      background: isDarkMode ? '#1e293b' : '#ffffff',
      text: isDarkMode ? '#e2e8f0' : '#334155',
      border: isDarkMode ? '#334155' : '#e5e7eb'
    };

    // Create legend data
    const legendData = [
      { value: lang === 'te' ? 'మంచి రాజులు' : 'Good Kings', color: '#22c55e' },
      { value: lang === 'te' ? 'చెడ్డ రాజులు' : 'Bad Kings', color: '#ef4444' },
      { value: lang === 'te' ? 'మిశ్రమ రాజులు' : 'Mixed Kings', color: '#f59e0b' },
      { value: lang === 'te' ? 'పశ్చాత్తాపపడిన రాజులు' : 'Repented Kings', color: '#8b5cf6' }
    ];

    return (
      <div className="chart-container" style={{ height: '500px', width: '100%' }}>
        {/* Custom Legend */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          {legendData.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: item.color,
                borderRadius: '4px'
              }}></div>
              <span style={{ 
                color: colors.text, 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <XAxis 
              dataKey="king"
              angle={-45} 
              textAnchor="end" 
              interval={0} 
              height={100}
              tick={{ fill: colors.text, fontSize: 11 }}
            />
            <YAxis 
              label={{ 
                value: lang === 'te' ? 'పాలించిన సంవత్సరాలు' : 'Years Ruled', 
                angle: -90, 
                position: 'insideLeft', 
                fill: colors.primary, 
                fontWeight: 'bold' 
              }}
              tick={{ fill: colors.text }}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{
                      backgroundColor: colors.background,
                      border: `2px solid ${colors.border}`,
                      borderRadius: '12px',
                      padding: '16px',
                      color: colors.text,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      minWidth: '200px'
                    }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '16px', 
                        marginBottom: '8px',
                        color: data.color
                      }}>
                        {data.king}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>{lang === 'te' ? 'సంవత్సరం: ' : 'Year: '}</strong>
                        {data.year}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>{lang === 'te' ? 'పాలించిన సంవత్సరాలు: ' : 'Years Ruled: '}</strong>
                        {data.yearsRuled}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>{lang === 'te' ? 'వర్గం: ' : 'Category: '}</strong>
                        <span style={{ color: data.color, fontWeight: 'bold' }}>
                          {data.category}
                        </span>
                      </div>
                      <div>
                        <strong>{lang === 'te' ? 'ప్రవక్త: ' : 'Prophet: '}</strong>
                        {data.prophet}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="yearsRuledNumeric">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList 
                dataKey="yearsRuledNumeric" 
                position="top" 
                fill={colors.text}
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Define columns for the kings grid
  const columns = [
    {
      header: t.king,
      dataKey: 'king'
    },
    {
      header: t.year,
      dataKey: 'year'
    },
    {
      header: t.yearsRuled,
      dataKey: 'yearsRuled'
    },
    {
      header: t.goodBad,
      dataKey: 'goodBad'
    },
    {
      header: t.prophet,
      dataKey: 'prophet'
    }
  ];

  // Custom row renderer to show color indicators
  const customRowRenderer = (row, rowIndex, tooltipHandlers = {}) => {
    const { handleMouseEnter, handleMouseLeave, handleMouseMove } = tooltipHandlers;
    const categoryColor = getKingCategoryColor(row.goodBad);
    
    return (
      <tr 
        key={rowIndex} 
        className={`table-row ${rowIndex % 2 === 0 ? 'table-row-even' : 'table-row-odd'}`}
      >
        {columns.map((column, colIndex) => {
          const value = row[column.dataKey];
          
          // Special handling for king column to make it clickable
          if (column.dataKey === 'king') {
            return (
              <td 
                key={colIndex} 
                className="table-cell"
                onMouseEnter={handleMouseEnter ? (e) => handleMouseEnter(e, value) : undefined}
                onMouseLeave={handleMouseLeave || undefined}
                onMouseMove={handleMouseMove || undefined}
              >
                <span 
                  onClick={() => handleKingClick(row._kingId)}
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
          
          // Special handling for goodBad column to show color indicator
          if (column.dataKey === 'goodBad') {
            return (
              <td 
                key={colIndex} 
                className="table-cell"
                onMouseEnter={handleMouseEnter ? (e) => handleMouseEnter(e, value) : undefined}
                onMouseLeave={handleMouseLeave || undefined}
                onMouseMove={handleMouseMove || undefined}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: categoryColor,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}></div>
                  <span style={{ 
                    color: categoryColor, 
                    fontWeight: '600' 
                  }}>
                    {value}
                  </span>
                </div>
              </td>
            );
          }
          
          // Special handling for prophet column to make each prophet name individually clickable
          if (column.dataKey === 'prophet' && value && value.trim() !== '') {
            // Don't make "Unknown" clickable
            if (value.toLowerCase().includes('unknown') || value.toLowerCase().includes('తెలియదు')) {
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
            }

            // Split multiple prophets and create individual clickable links
            const prophets = value.split(',').map(prophet => prophet.trim()).filter(prophet => prophet);
            
            return (
              <td 
                key={colIndex} 
                className="table-cell"
                onMouseEnter={handleMouseEnter ? (e) => handleMouseEnter(e, value) : undefined}
                onMouseLeave={handleMouseLeave || undefined}
                onMouseMove={handleMouseMove || undefined}
              >
                {prophets.map((prophet, index) => (
                  <span key={index}>
                    <span 
                      onClick={() => handleProphetClick(prophet)}
                      style={{
                        color: '#059669',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#047857';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#059669';
                      }}
                    >
                      {prophet}
                    </span>
                    {index < prophets.length - 1 && ', '}
                  </span>
                ))}
              </td>
            );
          }
          
          // Regular cell rendering
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

  // Enhanced chart configuration with custom renderer
  const chartConfig = {
    dataKey: 'yearsRuledNumeric', // Use numeric value for chart
    xDataKey: 'king',
    label: t.chartLabel,
    xLabel: t.king,
    yLabel: t.chartLabel,
    customRenderer: renderKingsChart
  };

  // Get the appropriate title based on section
  const getTitle = () => {
    if (section === 'judah-kings') {
      return t.judahTitle || 'Judah Kings';
    } else if (section === 'israel-kings') {
      return t.israelTitle || 'Israel Kings';
    }
    return t.title || 'Kings';
  };

  // Icon configuration
  const iconConfig = {
    Icon: Icon,
    color: iconColor
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
        translations={t}
        lang={lang}
        title={getTitle()}
        icon={iconConfig}
        chartConfig={chartConfig}
        customRowRenderer={customRowRenderer}
      />

      {/* King Details Modal */}
      <Modal
        isOpen={showKingModal}
        onClose={() => setShowKingModal(false)}
        title={selectedKing ? (lang === 'te' ? selectedKing.nameTelugu : selectedKing.name) : ''}
        closeLabel={lang === 'te' ? 'మూసివేయండి' : 'Close'}
      >
        {selectedKing && (
          <div style={{ 
            maxHeight: '70vh', 
            overflowY: 'auto',
            lineHeight: '1.6'
          }}>
            {/* King Title and Basic Info */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '15px',
              padding: '15px',
              backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
              borderRadius: '12px',
              border: `2px solid ${isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`
            }}>
              <h2 style={{ 
                margin: '0 0 10px 0',
                color: '#6366f1',
                fontSize: '1.6em'
              }}>
                {lang === 'te' ? selectedKing.nameTelugu : selectedKing.name}
              </h2>
              <p style={{ 
                margin: '0 0 10px 0',
                fontSize: '1.1em',
                fontWeight: '600',
                color: isDarkMode ? '#e2e8f0' : '#334155'
              }}>
                {lang === 'te' ? selectedKing.titleTelugu : selectedKing.title}
              </p>
              <p style={{ 
                margin: '0',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                {lang === 'te' ? selectedKing.periodTelugu : selectedKing.period}
              </p>
            </div>

            {/* Biography */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                color: '#6366f1',
                borderBottom: `2px solid ${isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
                paddingBottom: '6px',
                marginBottom: '12px',
                textAlign: 'left',
                fontSize: '1.1em'
              }}>
                {lang === 'te' ? 'జీవిత చరిత్ర' : 'Biography'}
              </h3>
              <p style={{ 
                color: isDarkMode ? '#e2e8f0' : '#334155',
                textAlign: 'justify'
              }}>
                {lang === 'te' ? selectedKing.biography.te : selectedKing.biography.en}
              </p>
            </div>

            {/* Achievements */}
            {selectedKing.achievements && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  color: '#22c55e',
                  borderBottom: `2px solid ${isDarkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'}`,
                  paddingBottom: '6px',
                  textAlign: 'left',
                  marginBottom: '12px',
                  fontSize: '1.1em'
                }}>
                  {lang === 'te' ? 'విజయాలు' : 'Achievements'}
                </h3>
                <ul style={{ 
                  color: isDarkMode ? '#e2e8f0' : '#334155',
                  paddingLeft: '20px',
                  textAlign: 'left'
                }}>
                  {(lang === 'te' ? selectedKing.achievements.te : selectedKing.achievements.en).map((achievement, index) => (
                    <li key={index} style={{ marginBottom: '6px', textAlign: 'left' }}>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Failures */}
            {selectedKing.failures && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  color: '#ef4444',
                  borderBottom: `2px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                  paddingBottom: '6px',
                  marginBottom: '12px',
                  fontSize: '1.1em'
                }}>
                  {lang === 'te' ? 'వైఫల్యాలు' : 'Failures'}
                </h3>
                <ul style={{ 
                  color: isDarkMode ? '#e2e8f0' : '#334155',
                  paddingLeft: '20px',
                  textAlign: 'left'
                }}>
                  {(lang === 'te' ? selectedKing.failures.te : selectedKing.failures.en).map((failure, index) => (
                    <li key={index} style={{ marginBottom: '6px', textAlign: 'left' }}>
                      {failure}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bible References */}
            {selectedKing.bibleReferences && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  color: '#8b5cf6',
                  borderBottom: `2px solid ${isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                  paddingBottom: '6px',
                  textAlign: 'left',
                  marginBottom: '12px',
                  fontSize: '2.1em'
                }}>
                  {lang === 'te' ? 'బైబిల్ సూత్రాలు' : 'Bible References'}
                </h3>
                
                {/* Primary References */}
                {selectedKing.bibleReferences.primary && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                      color: isDarkMode ? '#e2e8f0' : '#334155',
                      marginBottom: '10px',
                      fontSize: '1.0em'
                    }}>
                      {lang === 'te' ? 'ప్రధాన గ్రంథాలు:' : 'Primary References:'}
                    </h4>
                    <div style={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {selectedKing.bibleReferences.primary.map((ref, index) => (
                        <span key={index} style={{
                          backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                          color: '#8b5cf6',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.9em',
                          fontWeight: '500'
                        }}>
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Chapters */}
                {selectedKing.bibleReferences.keyChapters && (
                  <div>
                    <h4 style={{ 
                      color: isDarkMode ? '#e2e8f0' : '#334155',
                      marginBottom: '15px',
                      fontSize: '1.0em'
                    }}>
                      {lang === 'te' ? 'ముఖ్య అధ్యాయాలు:' : 'Key Chapters:'}
                    </h4>
                    <div style={{ 
                      display: 'grid',
                      gap: '12px'
                    }}>
                      {selectedKing.bibleReferences.keyChapters.map((chapter, index) => (
                        <div key={index} style={{
                          backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                          padding: '12px',
                          borderRadius: '8px',
                          border: `1px solid ${isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'}`
                        }}>
                          <div style={{ 
                            fontWeight: '600',
                            color: '#8b5cf6',
                            marginBottom: '5px'
                          }}>
                            {chapter.reference}
                          </div>
                          <div style={{ 
                            color: isDarkMode ? '#e2e8f0' : '#334155',
                            fontSize: '0.95em'
                          }}>
                            {lang === 'te' ? chapter.descriptionTelugu : chapter.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Key Verses */}
            {selectedKing.keyVerses && selectedKing.keyVerses.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ 
                  color: '#f59e0b',
                  borderBottom: `2px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`,
                  paddingBottom: '8px',
                  textAlign: 'left',
                  marginBottom: '15px'
                }}>
                  {lang === 'te' ? 'ముఖ్య వచనాలు' : 'Key Verses'}
                </h3>
                {selectedKing.keyVerses.map((verse, index) => (
                  <div key={index} style={{
                    backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: `1px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)'}`,
                    marginBottom: '10px'
                  }}>
                    <div style={{ 
                      fontWeight: '600',
                      color: '#f59e0b',
                      marginBottom: '8px'
                    }}>
                      {verse.reference}
                    </div>
                    <div style={{ 
                      color: isDarkMode ? '#e2e8f0' : '#334155',
                      fontStyle: 'italic',
                      lineHeight: '1.5'
                    }}>
                      "{lang === 'te' ? verse.textTelugu : verse.text}"
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Prophets */}
            {selectedKing.prophets && (
              <div>
                <h3 style={{ 
                  color: '#06b6d4',
                  borderBottom: `2px solid ${isDarkMode ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.2)'}`,
                  paddingBottom: '6px',
                  textAlign: 'left',
                  marginBottom: '12px',
                  fontSize: '1.1em'
                }}>
                  {lang === 'te' ? 'సమకాలీన ప్రవక్తలు' : 'Contemporary Prophets'}
                </h3>
                <div style={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {(lang === 'te' ? selectedKing.prophetsTelugu : selectedKing.prophets).map((prophet, index) => (
                    <span key={index} style={{
                      backgroundColor: isDarkMode ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)',
                      color: '#06b6d4',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9em',
                      fontWeight: '500'
                    }}>
                      {prophet}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Prophet Details Modal */}
      <Modal
        isOpen={showProphetModal}
        onClose={() => setShowProphetModal(false)}
        title={selectedProphet ? (lang === 'te' ? selectedProphet.name_te : selectedProphet.name) : ''}
        closeLabel={lang === 'te' ? 'మూసివేయండి' : 'Close'}
      >
        {selectedProphet && (
          <div style={{ 
            maxHeight: '70vh', 
            overflowY: 'auto',
            lineHeight: '1.6'
          }}>
            {/* Prophet Title and Basic Info */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '15px',
              padding: '15px',
              backgroundColor: isDarkMode ? 'rgba(5, 150, 105, 0.1)' : 'rgba(5, 150, 105, 0.05)',
              borderRadius: '12px',
              border: `2px solid ${isDarkMode ? 'rgba(5, 150, 105, 0.3)' : 'rgba(5, 150, 105, 0.2)'}`
            }}>
              <h2 style={{ 
                margin: '0 0 10px 0',
                color: '#059669',
                fontSize: '1.6em'
              }}>
                {lang === 'te' ? selectedProphet.name_te : selectedProphet.name}
              </h2>
              <p style={{ 
                margin: '0 0 10px 0',
                fontSize: '1.1em',
                fontWeight: '600',
                color: isDarkMode ? '#e2e8f0' : '#334155'
              }}>
                {lang === 'te' ? 'ప్రవక్త' : 'Prophet'}
              </p>
              <p style={{ 
                margin: '0',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                {lang === 'te' ? selectedProphet.timeline.te : selectedProphet.timeline.en}
              </p>
            </div>

            {/* Introduction */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                color: '#059669',
                borderBottom: `2px solid ${isDarkMode ? 'rgba(5, 150, 105, 0.3)' : 'rgba(5, 150, 105, 0.2)'}`,
                paddingBottom: '6px',
                marginBottom: '12px',
                fontSize: '1.1em'
              }}>
                {lang === 'te' ? 'పరిచయం' : 'Introduction'}
              </h3>
              <p style={{ 
                color: isDarkMode ? '#e2e8f0' : '#334155',
                textAlign: 'justify'
              }}>
                {lang === 'te' ? selectedProphet.introduction.te : selectedProphet.introduction.en}
              </p>
            </div>

            {/* Key Events */}
            {selectedProphet.keyEvents && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  color: '#0891b2',
                  borderBottom: `2px solid ${isDarkMode ? 'rgba(8, 145, 178, 0.3)' : 'rgba(8, 145, 178, 0.2)'}`,
                  paddingBottom: '6px',
                  marginBottom: '12px',
                  fontSize: '1.1em'
                }}>
                  {lang === 'te' ? 'ముఖ్య సంఘటనలు' : 'Key Events'}
                </h3>
                <ul style={{ 
                  color: isDarkMode ? '#e2e8f0' : '#334155',
                  paddingLeft: '20px',
                  textAlign: 'left'
                }}>
                  {(lang === 'te' ? selectedProphet.keyEvents.te : selectedProphet.keyEvents.en).map((event, index) => (
                    <li key={index} style={{ marginBottom: '6px', textAlign: 'left' }}>
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Books Written */}
            {selectedProphet.booksWritten && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  color: '#7c3aed',
                  borderBottom: `2px solid ${isDarkMode ? 'rgba(124, 58, 237, 0.3)' : 'rgba(124, 58, 237, 0.2)'}`,
                  paddingBottom: '6px',
                  marginBottom: '12px',
                  fontSize: '1.1em'
                }}>
                  {lang === 'te' ? 'రచించిన గ్రంథాలు' : 'Books Written'}
                </h3>
                <p style={{ 
                  color: isDarkMode ? '#e2e8f0' : '#334155',
                  backgroundColor: isDarkMode ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)',
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1px solid ${isDarkMode ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)'}`
                }}>
                  {lang === 'te' ? selectedProphet.booksWritten.te : selectedProphet.booksWritten.en}
                </p>
              </div>
            )}

            {/* Bible References */}
            {selectedProphet.references && (
              <div>
                <h3 style={{ 
                  color: '#dc2626',
                  borderBottom: `2px solid ${isDarkMode ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.2)'}`,
                  paddingBottom: '6px',
                  marginBottom: '12px',
                  fontSize: '1.1em'
                }}>
                  {lang === 'te' ? 'బైబిల్ సూత్రాలు' : 'Bible References'}
                </h3>
                <p style={{ 
                  color: isDarkMode ? '#e2e8f0' : '#334155',
                  backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.05)',
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1px solid ${isDarkMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)'}`
                }}>
                  {lang === 'te' ? selectedProphet.references.te : selectedProphet.references.en}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
