import './DataGrid.css';
import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { FaChartBar, FaTimes, FaPrint, FaFileExcel } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Reusable DataGrid component with filtering, charts, and responsive design
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Array of column definitions
 * @param {Object} props.translations - Translations object for the current language
 * @param {string} props.lang - Current language ('en' or 'te')
 * @param {string} props.title - Grid title
 * @param {Object} props.icon - Icon configuration {Icon: ReactComponent, color: string}
 * @param {Object} props.chartConfig - Chart configuration {dataKey: string, label: string}
 * @param {Function} props.customFilter - Custom filter function (optional)
 * @param {Function} props.customRowRenderer - Custom row renderer (optional)
 */
export default function DataGrid({
  data = [],
  columns = [],
  translations = {},
  lang = 'en',
  title = '',
  icon = null,
  chartConfig = null,
  customFilter = null,
  customRowRenderer = null,
  onCellClick = null // New prop for cell click handling
}) {
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState('duration'); // 'duration' or 'count'
  const [filterText, setFilterText] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });
  const { isDarkMode } = useTheme();

  // Theme-aware colors
  const colors = {
    primary: isDarkMode ? '#818cf8' : '#6366f1',
    background: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#e2e8f0' : '#334155',
    border: isDarkMode ? '#334155' : '#e5e7eb'
  };

  // Tooltip handlers
  const handleMouseEnter = (event, content) => {
    if (!content || content === '') return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    setTooltip({
      show: true,
      content: String(content),
      x: rect.left + scrollLeft + rect.width / 2,
      y: rect.top + scrollTop - 10
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  };

  // Refs for scroll synchronization
  const headerContainerRef = useRef(null);
  const bodyContainerRef = useRef(null);

  // Synchronize header and body horizontal scrolling
  useEffect(() => {
    const headerContainer = headerContainerRef.current;
    const bodyContainer = bodyContainerRef.current;

    if (!headerContainer || !bodyContainer) return;

    const syncHeaderScroll = () => {
      if (headerContainer && bodyContainer) {
        bodyContainer.scrollLeft = headerContainer.scrollLeft;
      }
    };

    const syncBodyScroll = () => {
      if (headerContainer && bodyContainer) {
        headerContainer.scrollLeft = bodyContainer.scrollLeft;
      }
    };

    headerContainer.addEventListener('scroll', syncHeaderScroll);
    bodyContainer.addEventListener('scroll', syncBodyScroll);

    return () => {
      headerContainer.removeEventListener('scroll', syncHeaderScroll);
      bodyContainer.removeEventListener('scroll', syncBodyScroll);
    };
  }, []);

  const handleMouseMove = (event) => {
    if (tooltip.show) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setTooltip(prev => ({
        ...prev,
        x: event.clientX + scrollLeft,
        y: event.clientY + scrollTop - 10
      }));
    }
  };

  // Print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Print</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #6366f1; text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #6366f1; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .print-info { text-align: center; margin-bottom: 20px; font-size: 12px; color: #666; }
            @media print { 
              body { margin: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="print-info">
            Generated on: ${new Date().toLocaleString(lang === 'te' ? 'te-IN' : 'en-US')}
            | Total Records: ${filteredData.length}
          </div>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  // Generate print content
  const generatePrintContent = () => {
    let tableHTML = '<table><thead><tr>';
    
    // Add headers
    columns.forEach(column => {
      tableHTML += `<th>${column.header}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';
    
    // Add data rows
    filteredData.forEach(row => {
      tableHTML += '<tr>';
      columns.forEach(column => {
        let value = row[column.dataKey];
        
        // Handle language-specific fields
        if (column.langKey && lang === 'te' && row[column.langKey]) {
          value = row[column.langKey];
        }
        
        // Apply custom formatter if provided
        if (column.formatter) {
          value = column.formatter(value, row, lang);
        }
        
        tableHTML += `<td>${value || ''}</td>`;
      });
      tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    return tableHTML;
  };

  // Export to Excel function
  const handleExportExcel = () => {
    // Prepare data for Excel
    const excelData = filteredData.map(row => {
      const excelRow = {};
      columns.forEach(column => {
        let value = row[column.dataKey];
        
        // Handle language-specific fields
        if (column.langKey && lang === 'te' && row[column.langKey]) {
          value = row[column.langKey];
        }
        
        // Apply custom formatter if provided
        if (column.formatter) {
          value = column.formatter(value, row, lang);
        }
        
        excelRow[column.header] = value || '';
      });
      return excelRow;
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = columns.map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31)); // Excel sheet name limit
    
    // Generate Excel file and download
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(data, fileName);
  };

  // Default filter function
  const defaultFilter = (row) => {
    if (!filterText) return true;
    const searchText = filterText.toLowerCase();
    
    return columns.some(column => {
      let value = row[column.dataKey];
      
      // Handle language-specific fields
      if (column.langKey && lang === 'te' && row[column.langKey]) {
        value = row[column.langKey];
      }
      
      return value?.toString().toLowerCase().includes(searchText);
    });
  };

  // Use custom filter if provided, otherwise use default
  const filterFunction = customFilter 
    ? (row) => customFilter(row, filterText)  // Pass filterText to customFilter
    : defaultFilter;
  const filteredData = data.filter(filterFunction);

  // Default translations
  const defaultTranslations = {
    filter: lang === 'te' ? 'వెతకండి...' : 'Filter...',
    results: lang === 'te' ? 'ఫలితాలు' : 'results',
    chart: lang === 'te' ? 'చార్ట్' : 'Chart',
    showChart: lang === 'te' ? 'చార్ట్ చూపించు' : 'Show Chart',
    close: lang === 'te' ? 'మూసివేయి' : 'Close',
    mapNotFound: lang === 'te' ? 'మ్యాప్ చిత్రం లేదు' : 'Map image not found',
    clickToView: lang === 'te' ? 'చూడటానికి క్లిక్ చేయండి' : 'Click to view map'
  };

  const t = { ...defaultTranslations, ...translations };

  // Function to get map image path from JSON data
  const getMapImagePath = (mapName, originalData) => {
    // Check if we have the original map data with imageFile
    if (originalData && originalData._original && originalData._original.imageFile) {
      return `/${originalData._original.imageFile}`;
    }
    
    // Fallback: try to find in the data array by matching map name
    if (data && data.length > 0) {
      const foundMap = data.find(item => {
        const mapTitle = item.map;
        const originalMap = item._original;
        
        // Check if map name matches and has imageFile
        if (mapTitle === mapName && originalMap && originalMap.imageFile) {
          return true;
        }
        
        return false;
      });
      
      if (foundMap && foundMap._original && foundMap._original.imageFile) {
        return `/${foundMap._original.imageFile}`;
      }
    }

    // Return null if no image found
    return null;
  };

  // Function to handle map name click
  const handleMapClick = (mapName, rowData) => {
    const imagePath = getMapImagePath(mapName, rowData);
    if (imagePath) {
      setSelectedImage({
        path: imagePath,
        title: mapName,
        description: rowData.significance || ''
      });
      setShowImageModal(true);
    }
  };

  // Render table header
  const renderTableHeader = () => (
    <thead>
      <tr className="table-header">
        {columns.map((column, index) => (
          <th key={index} className="table-header-cell">
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  );

  // Default row renderer
  const defaultRowRenderer = (row, index) => (
    <tr
      key={index}
      className={`table-row ${index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}`}
    >
      {columns.map((column, colIndex) => {
        let value = row[column.dataKey];
        
        // Handle language-specific fields
        if (column.langKey && lang === 'te' && row[column.langKey]) {
          value = row[column.langKey];
        }
        
        // Apply custom formatter if provided
        if (column.formatter) {
          value = column.formatter(value, row, lang);
        }

        // Note: Map name clickability is now handled by custom row renderers in specific grids
        return (
          <td 
            key={colIndex} 
            className="table-cell"
            onMouseEnter={(e) => handleMouseEnter(e, value)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            {value}
          </td>
        );
      })}
    </tr>
  );

  // Use custom row renderer if provided
  const rowRenderer = customRowRenderer ? 
    (row, index) => customRowRenderer(row, index, { handleMouseEnter, handleMouseLeave, handleMouseMove }) :
    defaultRowRenderer;

  // Render chart if chart configuration is provided
  const renderChart = () => {
    if (!chartConfig) return null;

    // Check if there's a custom chart renderer
    if (chartConfig.customRenderer) {
      return chartConfig.customRenderer();
    }

    // Process data for chart based on data type
    let chartData = filteredData;
    
    // Special handling for After Babylonian Exile data (empire-based chart)
    if (filteredData.length > 0 && filteredData[0].year && filteredData[0].year.includes('BCE')) {
      // Group by empire based on famous field
      const empireData = {};
      filteredData.forEach(row => {
        let empire = 'Unknown';
        const famous = row.famous || '';
        
        if (famous.includes('Babylonian Empire')) {
          empire = 'Babylonian Empire';
        } else if (famous.includes('Persian Empire')) {
          empire = 'Persian Empire';
        } else if (famous.includes('Macedonian Empire')) {
          empire = 'Macedonian Empire';
        } else if (famous.includes('Ptolemaic Empire')) {
          empire = 'Ptolemaic Empire';
        } else if (famous.includes('Seleucid Empire')) {
          empire = 'Seleucid Empire';
        } else if (famous.includes('Roman Empire')) {
          empire = 'Roman Empire';
        }
        
        if (!empireData[empire]) {
          empireData[empire] = { 
            empire, 
            rulers: 0, 
            totalYears: 0,
            rulersList: [],
            rulerDetails: []
          };
        }
        
        empireData[empire].rulers += 1;
        
        // Extract years from age field
        const ageStr = row.age || '0';
        const years = parseInt(ageStr.replace(/[^0-9]/g, '')) || 1;
        empireData[empire].totalYears += years;
        
        // Add ruler to the list
        const rulerName = lang === 'te' && row.person_te ? row.person_te : row.person;
        empireData[empire].rulersList.push(rulerName);
        empireData[empire].rulerDetails.push({
          name: rulerName,
          period: row.year,
          years: years
        });
      });
      
      chartData = Object.values(empireData);
      
      const dataKey = chartType === 'duration' ? 'totalYears' : 'rulers';
      const yLabel = chartType === 'duration' 
        ? (lang === 'te' ? 'పాలనా కాలం (సంవత్సరాలు)' : 'Rule Duration (Years)')
        : (lang === 'te' ? 'పాలకుల సంఖ్య' : 'Number of Rulers');
      const tooltipLabel = chartType === 'duration'
        ? (lang === 'te' ? 'మొత్తం సంవత్సరాలు' : 'Total Years')
        : (lang === 'te' ? 'పాలకులు' : 'Rulers');
      
      return (
        <div className="chart-container">
          <div className="chart-controls" style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
              onClick={() => setChartType('duration')}
              className={`chart-type-button ${chartType === 'duration' ? 'active' : ''}`}
              style={{
                padding: '8px 16px',
                margin: '0 8px',
                backgroundColor: chartType === 'duration' ? colors.primary : colors.background,
                color: chartType === 'duration' ? 'white' : colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {lang === 'te' ? 'పాలనా కాలం' : 'Rule Duration'}
            </button>
            <button
              onClick={() => setChartType('count')}
              className={`chart-type-button ${chartType === 'count' ? 'active' : ''}`}
              style={{
                padding: '8px 16px',
                margin: '0 8px',
                backgroundColor: chartType === 'count' ? colors.primary : colors.background,
                color: chartType === 'count' ? 'white' : colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {lang === 'te' ? 'పాలకుల సంఖ్య' : 'Ruler Count'}
            </button>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <XAxis 
                dataKey="empire"
                angle={-30} 
                textAnchor="end" 
                interval={0} 
                height={100}
                tick={{ fill: colors.text, fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: yLabel, 
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
                    const value = payload[0].value;
                    
                    return (
                      <div style={{
                        backgroundColor: colors.background,
                        border: `2px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '16px',
                        color: colors.text,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        maxWidth: '300px',
                        fontSize: '14px'
                      }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          fontSize: '16px', 
                          marginBottom: '12px',
                          color: colors.primary,
                          borderBottom: `1px solid ${colors.border}`,
                          paddingBottom: '8px'
                        }}>
                          {label}
                        </div>
                        
                        <div style={{ marginBottom: '12px' }}>
                          <strong>
                            {chartType === 'duration' 
                              ? (lang === 'te' ? 'మొత్తం పాలనా కాలం: ' : 'Total Rule Duration: ')
                              : (lang === 'te' ? 'పాలకుల సంఖ్య: ' : 'Number of Rulers: ')
                            }
                          </strong>
                          <span style={{ color: colors.primary, fontWeight: 'bold' }}>
                            {chartType === 'duration' 
                              ? `${value} ${lang === 'te' ? 'సంవత్సరాలు' : 'years'}`
                              : value
                            }
                          </span>
                        </div>
                        
                        <div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            marginBottom: '8px',
                            color: colors.text
                          }}>
                            {lang === 'te' ? 'పాలకుల జాబితా:' : 'List of Rulers:'}
                          </div>
                          <div style={{ 
                            maxHeight: '200px', 
                            overflowY: 'auto',
                            fontSize: '13px'
                          }}>
                            {data.rulerDetails && data.rulerDetails.map((ruler, index) => (
                              <div key={index} style={{ 
                                marginBottom: '6px',
                                padding: '4px 8px',
                                backgroundColor: index % 2 === 0 ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontWeight: '500' }}>{ruler.name}</span>
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: colors.primary,
                                  marginLeft: '8px'
                                }}>
                                  ({ruler.period})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div style={{ 
                          marginTop: '12px', 
                          paddingTop: '8px',
                          borderTop: `1px solid ${colors.border}`,
                          fontSize: '12px',
                          color: colors.text,
                          opacity: 0.7
                        }}>
                          {lang === 'te' ? 'వివరాలకు క్లిక్ చేయండి' : 'Click for more details'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                contentStyle={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '12px'
                }}
              />
              <Bar dataKey={dataKey} fill={colors.primary} name={dataKey}>
                <LabelList dataKey={dataKey} position="top" fill={colors.text} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Default chart for other data types
    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
            <XAxis 
              dataKey={chartConfig.xDataKey || columns[0]?.dataKey} 
              angle={-30} 
              textAnchor="end" 
              interval={0} 
              height={70}
              tick={{ fill: colors.text }}
            />
            <YAxis 
              label={{ 
                value: chartConfig.yLabel || chartConfig.label, 
                angle: -90, 
                position: 'insideLeft', 
                fill: colors.primary, 
                fontWeight: 'bold' 
              }}
              tick={{ fill: colors.text }}
            />
            <Tooltip 
              formatter={(value, name) => [value, chartConfig.label]} 
              labelFormatter={label => `${chartConfig.xLabel || columns[0]?.header}: ${label}`}
              contentStyle={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.text
              }}
            />
            <Bar dataKey={chartConfig.dataKey} fill={colors.primary}>
              <LabelList dataKey={chartConfig.dataKey} position="top" fill={colors.text} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div 
      className="data-grid-container" 
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'hidden'
      }}
    >
      {/* Header Section */}
      <div className="section-header">
        <h2 className={icon ? "section-title-with-icon" : "section-title"} >
          {icon && <icon.Icon className="section-icon" />}
          {title}
        </h2>
      </div>

      {/* Controls Row - Search, Row Count, and Action Buttons */}
      <div className="controls-row">
        <div className="search-section">
          <div className="search-input-container">
            <input
              type="text"
              placeholder={t.filter}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="filter-input-compact"
            />
            {filterText && (
              <button
                onClick={() => setFilterText('')}
                className="search-clear-button"
                title={lang === 'te' ? 'శోధనను క్లియర్ చేయండి' : 'Clear search'}
                aria-label={lang === 'te' ? 'శోధనను క్లియర్ చేయండి' : 'Clear search'}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <button className='action-button print-button'>
          <span className="">
            {filteredData.length} {lang === 'te' ? 'రికార్డులు' : 'rows'}
          </span>
          </button>
          <button
            onClick={handlePrint}
            className="action-button print-button"
            title={lang === 'te' ? 'ప్రింట్ చేయండి' : 'Print'}
          >
            <FaPrint />
            <span className="action-button-text">{lang === 'te' ? 'ప్రింట్' : 'Print'}</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="action-button excel-button"
            title={lang === 'te' ? 'ఎక్సెల్‌లో ఎగుమతి చేయండి' : 'Export to Excel'}
          >
            <FaFileExcel />
            <span className="action-button-text">{lang === 'te' ? 'ఎక్సెల్' : 'Excel'}</span>
          </button>
          {chartConfig && (
            <button
              onClick={() => setShowChart(true)}
              className="action-button print-button"
              title={t.showChart}
            >
              <FaChartBar />
              <span className="action-button-text">{t.chart}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Section with Fixed Header */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Fixed Table Header */}
        <div 
          ref={headerContainerRef}
          className="table-header-container" 
          style={{ 
            flexShrink: 0,
            background: 'var(--card-bg)',
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 4px 12px var(--shadow-medium)',
            overflow: 'hidden'
          }}
        >
          <table className="genealogy-table" style={{ marginBottom: 0 }}>
            {renderTableHeader()}
          </table>
        </div>
        
        {/* Scrollable Table Body */}
        <div 
          ref={bodyContainerRef}
          className="table-body-container" 
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'auto',
            background: 'var(--card-bg)',
            borderRadius: '0 0 12px 12px',
            boxShadow: '0 4px 12px var(--shadow-medium)',
            maxHeight: 'calc(100vh - 320px)'
          }}
        >
          <table className="genealogy-table" style={{ borderRadius: 0 }}>
            <tbody>
              {filteredData.map((row, index) => rowRenderer(row, index))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Modal */}
      {showChart && chartConfig && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowChart(false)}
              className="modal-close"
              title={t.close}
              aria-label={t.close}
            >
              ×
            </button>
            <h3 className="chart-title">
              {title} {t.chart}
            </h3>
            {renderChart()}
          </div>
        </div>
      )}

      {/* Image Modal for Maps */}
      {showImageModal && selectedImage && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div 
            className="modal-content image-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              width: 'auto',
              height: 'auto',
              padding: '20px',
              overflow: 'auto'
            }}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="map-modal-close"
              title={t.close}
              aria-label={t.close}
            >
              ×
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                marginBottom: '16px', 
                color: colors.primary,
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {selectedImage.title}
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <img
                  src={selectedImage.path}
                  alt={selectedImage.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div 
                  style={{ 
                    display: 'none', 
                    padding: '40px',
                    color: colors.text,
                    fontSize: '18px'
                  }}
                >
                  {t.mapNotFound}
                </div>
              </div>
              
              {selectedImage.description && (
                <p style={{ 
                  color: colors.text,
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: '16px 0 0 0',
                  maxWidth: '600px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  {selectedImage.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="data-grid-tooltip"
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%) translateY(-100%)',
            background: isDarkMode 
              ? 'rgba(30, 41, 59, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            color: colors.text,
            fontSize: '16px',
            fontWeight: '500',
            maxWidth: '300px',
            wordWrap: 'break-word',
            zIndex: 10000,
            pointerEvents: 'none',
            lineHeight: '1.4'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
