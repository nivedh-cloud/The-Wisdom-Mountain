import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import DataGrid from '../components/DataGrid';
import Modal from '../components/Modal';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, Cell } from 'recharts';
import namesOfGodData from '../assets/data/namesOfGodData.json';
import menuConfig from '../assets/data/menuConfig.json';
import { FaCrown } from 'react-icons/fa';
import { GiHolyGrail } from 'react-icons/gi';

export default function NamesOfGodGrid({ lang }) {
  const { isDarkMode } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedName, setSelectedName] = useState(null);
  
  // Load menu config for icon and color
  const namesOfGodMenu = menuConfig.menus.bookswriters?.find(m => m.key === 'names-of-god') || {};
  const Icon = namesOfGodMenu.icon === 'GiHolyGrail' ? GiHolyGrail : FaCrown;
  const iconColor = namesOfGodMenu.iconColor || '#8b5cf6';

  const t = namesOfGodData.tableHeaders[lang] || namesOfGodData.tableHeaders.en;
  const data = namesOfGodData.namesOfGod.map(name => ({
    name: lang === 'te' ? name.nameTelugu : name.name,
    meaning: lang === 'te' ? name.meaning.te : name.meaning.en,
    reference: lang === 'te' ? name.reference.te : name.reference.en,
    description: lang === 'te' ? name.description.te : name.description.en,
    testament: lang === 'te' ? name.testamentTelugu : name.testament,
    category: lang === 'te' ? name.categoryTelugu : name.category,
    // Keep original data for modal
    _originalData: name
  }));

  // Function to handle name click
  const handleNameClick = (rowData) => {
    setSelectedName(rowData._originalData);
    setShowModal(true);
  };

  // Color categorization based on Testament
  const getTestamentColor = (testament) => {
    const testamentColors = {
      'Old Testament': '#8b5cf6',
      'New Testament': '#06b6d4',
      'Both Testaments': '#f59e0b',
      'పాత నిబంధన': '#8b5cf6',
      'కొత్త నిబంధన': '#06b6d4',
      'రెండు నిబంధనలు': '#f59e0b'
    };
    return testamentColors[testament] || '#6b7280';
  };

  // Prepare chart data by testament
  const chartData = data.reduce((acc, name) => {
    const existing = acc.find(item => item.testament === name.testament);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        testament: name.testament,
        count: 1,
        color: getTestamentColor(name.testament)
      });
    }
    return acc;
  }, []);

  // Custom chart renderer
  const renderNamesChart = () => {
    const colors = {
      background: isDarkMode ? '#1e293b' : '#ffffff',
      text: isDarkMode ? '#e2e8f0' : '#334155',
      border: isDarkMode ? '#334155' : '#e5e7eb'
    };

    return (
      <div className="chart-container" style={{ height: '400px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <XAxis 
              dataKey="testament"
              angle={-45} 
              textAnchor="end" 
              interval={0} 
              height={100}
              tick={{ fill: colors.text, fontSize: 12 }}
            />
            <YAxis 
              label={{ 
                value: lang === 'te' ? 'నామాల సంఖ్య' : 'Number of Names', 
                angle: -90, 
                position: 'insideLeft', 
                fill: iconColor, 
                fontWeight: 'bold' 
              }}
              tick={{ fill: colors.text }}
            />
            <Bar dataKey="count">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList 
                dataKey="count" 
                position="top" 
                fill={colors.text}
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Define columns for the names grid
  const columns = [
    {
      header: t.name,
      dataKey: 'name'
    },
    {
      header: t.meaning,
      dataKey: 'meaning'
    },
    {
      header: t.reference,
      dataKey: 'reference'
    },
    {
      header: t.description,
      dataKey: 'description'
    }
  ];

  // Custom row renderer to show color indicators and make names clickable
  const customRowRenderer = (row, rowIndex, tooltipHandlers = {}) => {
    const { handleMouseEnter, handleMouseLeave, handleMouseMove } = tooltipHandlers;
    const testamentColor = getTestamentColor(row.testament);
    
    return (
      <tr 
        key={rowIndex} 
        className={`table-row ${rowIndex % 2 === 0 ? 'table-row-even' : 'table-row-odd'}`}
      >
        {columns.map((column, colIndex) => {
          const value = row[column.dataKey];
          
          // Special handling for name column to make it clickable
          if (column.dataKey === 'name') {
            return (
              <td 
                key={colIndex} 
                className="table-cell"
                onMouseEnter={handleMouseEnter ? (e) => handleMouseEnter(e, value) : undefined}
                onMouseLeave={handleMouseLeave || undefined}
                onMouseMove={handleMouseMove || undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div 
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: testamentColor,
                      flexShrink: 0
                    }}
                  />
                  <span 
                    onClick={() => handleNameClick(row)}
                    style={{
                      color: iconColor,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = isDarkMode ? '#a855f7' : '#7c3aed';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = iconColor;
                    }}
                  >
                    {value}
                  </span>
                </div>
              </td>
            );
          }
          
          // Regular cell rendering with word wrapping for longer content
          return (
            <td 
              key={colIndex} 
              className="table-cell"
              onMouseEnter={handleMouseEnter ? (e) => handleMouseEnter(e, value) : undefined}
              onMouseLeave={handleMouseLeave || undefined}
              onMouseMove={handleMouseMove || undefined}
              style={{
                maxWidth: column.dataKey === 'description' ? '300px' : 'auto',
                whiteSpace: column.dataKey === 'description' ? 'normal' : 'nowrap',
                wordWrap: 'break-word'
              }}
            >
              {value}
            </td>
          );
        })}
      </tr>
    );
  };

  // Chart configuration
  const chartConfig = {
    customRenderer: renderNamesChart
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
        title={t.title}
        icon={iconConfig}
        chartConfig={chartConfig}
        customRowRenderer={customRowRenderer}
      />

      {/* Name Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedName ? (lang === 'te' ? selectedName.nameTelugu : selectedName.name) : ''}
        closeLabel={lang === 'te' ? 'మూసివేయండి' : 'Close'}
        maxWidth="700px"
      >
        {selectedName && (
          <div style={{ 
            maxHeight: '70vh', 
            overflowY: 'auto',
            lineHeight: '1.6'
          }}>
            {/* Name Title and Basic Info */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '20px',
              padding: '20px',
              backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
              borderRadius: '12px',
              border: `2px solid ${isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`
            }}>
              <h2 style={{ 
                margin: '0 0 10px 0',
                color: iconColor,
                fontSize: '1.8em'
              }}>
                {lang === 'te' ? selectedName.nameTelugu : selectedName.name}
              </h2>
              <p style={{ 
                margin: '0 0 10px 0',
                fontSize: '1.2em',
                fontWeight: '600',
                color: isDarkMode ? '#e2e8f0' : '#334155'
              }}>
                {lang === 'te' ? selectedName.meaning.te : selectedName.meaning.en}
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                flexWrap: 'wrap',
                marginTop: '15px'
              }}>
                <span style={{
                  backgroundColor: getTestamentColor(lang === 'te' ? selectedName.testamentTelugu : selectedName.testament),
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.9em',
                  fontWeight: '500'
                }}>
                  {lang === 'te' ? selectedName.testamentTelugu : selectedName.testament}
                </span>
                <span style={{
                  backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.9em',
                  fontWeight: '500'
                }}>
                  {lang === 'te' ? selectedName.categoryTelugu : selectedName.category}
                </span>
              </div>
            </div>

            {/* Reference Verse */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                color: '#06b6d4',
                borderBottom: `2px solid ${isDarkMode ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.2)'}`,
                paddingBottom: '8px',
                marginBottom: '15px',
                fontSize: '1.2em'
              }}>
                {lang === 'te' ? 'సూत్రధార వచనం' : 'Reference Verse'}
              </h3>
              <div style={{
                backgroundColor: isDarkMode ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)',
                padding: '15px',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.1)'}`,
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontWeight: '600',
                  color: '#06b6d4',
                  fontSize: '1.1em'
                }}>
                  {lang === 'te' ? selectedName.reference.te : selectedName.reference.en}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                color: '#f59e0b',
                borderBottom: `2px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`,
                paddingBottom: '8px',
                marginBottom: '15px',
                fontSize: '1.2em'
              }}>
                {lang === 'te' ? 'వివరణ' : 'Description'}
              </h3>
              <p style={{ 
                color: isDarkMode ? '#e2e8f0' : '#334155',
                textAlign: 'justify',
                lineHeight: '1.7',
                fontSize: '1.05em'
              }}>
                {lang === 'te' ? selectedName.description.te : selectedName.description.en}
              </p>
            </div>

            {/* Additional Scripture Context */}
            <div style={{
              backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.03)',
              padding: '15px',
              borderRadius: '8px',
              border: `1px solid ${isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'}`,
              textAlign: 'center'
            }}>
              <p style={{
                margin: 0,
                color: isDarkMode ? '#c4b5fd' : '#7c3aed',
                fontSize: '0.95em',
                fontStyle: 'italic'
              }}>
                {lang === 'te' 
                  ? 'ఈ నామం దేవుని స్వభావం మరియు లక్షణాలను వెల్లడిస్తుంది' 
                  : 'This name reveals God\'s nature and character'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
