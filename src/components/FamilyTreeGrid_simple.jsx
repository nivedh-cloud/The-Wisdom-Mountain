import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FaSitemap } from 'react-icons/fa';
import './DataGrid.css';
import genealogyTreeData from '../assets/data/genealogy-bilingual-improved.json';

export default function FamilyTreeGrid() {
  const { lang } = useLanguage();
  const [genealogyData, setGenealogyData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set(['Adam', 'Seth', 'Enosh', 'Kenan', 'Mahalalel', 'Jared', 'Enoch']));
  
  const headerContainerRef = useRef(null);
  const bodyContainerRef = useRef(null);
  
  // Tooltip state
  const [tooltip, setTooltip] = useState({
    show: false,
    content: '',
    x: 0,
    y: 0
  });

  // Tooltip functions
  const showTooltip = (e, row) => {
    const rect = e.target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const tooltipContent = lang === 'te' ? 
      `పేరు: ${row.name || 'తెలియదు'}\nజననం: ${row.birth || 'తెలియదు'}\nమరణం: ${row.death || 'తెలియదు'}\nవయస్సు: ${row.age || 'తెలియదు'}\nజీవిత భాగస్వామి: ${row.spouse || 'తెలియదు'}` :
      `Name: ${row.name || 'Unknown'}\nBirth: ${row.birth || 'Unknown'}\nDeath: ${row.death || 'Unknown'}\nAge: ${row.age || 'Unknown'}\nSpouse: ${row.spouse || 'Unknown'}`;
    
    setTooltip({
      show: true,
      content: tooltipContent,
      x: rect.left + scrollLeft + rect.width / 2,
      y: rect.top + scrollTop - 10
    });
  };

  const hideTooltip = () => {
    setTooltip({ show: false, content: '', x: 0, y: 0 });
  };

  // Converter function to flatten the genealogy tree for table display
  const convertGenealogyToTableData = (node, level = 0, parentPath = '') => {
    const result = [];
    
    if (!node) return result;

    const currentPath = parentPath ? `${parentPath}.${node.name}` : node.name;
    const displayName = lang === 'te' ? (node.nameTe || node.name) : (node.nameEn || node.name);
    const displaySpouse = lang === 'te' ? (node.spouseTe || node.spouse) : (node.spouseEn || node.spouse);
    
    const tableRow = {
      id: currentPath,
      name: displayName,
      birth: node.birth || '',
      death: node.death || '',
      age: node.age || '',
      spouse: displaySpouse || '',
      level: level,
      hasChildren: node.children && node.children.length > 0,
      isExpanded: expandedNodes.has(node.name),
      originalName: node.name,
      // Store both language versions for cross-language search
      nameEn: node.nameEn || node.name,
      nameTe: node.nameTe || node.name,
      spouseEn: node.spouseEn || node.spouse,
      spouseTe: node.spouseTe || node.spouse
    };

    result.push(tableRow);

    // If node is expanded and has children, add them recursively
    if (expandedNodes.has(node.name) && node.children && node.children.length > 0) {
      node.children.forEach(child => {
        const childRows = convertGenealogyToTableData(child, level + 1, currentPath);
        result.push(...childRows);
      });
    }

    return result;
  };

  // Synchronize header and body horizontal scrolling
  useEffect(() => {
    const headerContainer = headerContainerRef.current;
    const bodyContainer = bodyContainerRef.current;
    
    if (!headerContainer || !bodyContainer) return;

    const syncHeaderScroll = () => {
      if (bodyContainer.scrollLeft !== headerContainer.scrollLeft) {
        bodyContainer.scrollLeft = headerContainer.scrollLeft;
      }
    };

    const syncBodyScroll = () => {
      if (headerContainer.scrollLeft !== bodyContainer.scrollLeft) {
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

  // Advanced search function that supports both English and Telugu
  const advancedSearchFilter = (data, searchText) => {
    if (!searchText.trim()) return data;
    
    const searchTerms = searchText.toLowerCase().trim().split(/\s+/);
    
    // Find exact matches first
    const exactMatches = data.filter(item => {
      return searchTerms.every(term => {
        const nameEn = (item.nameEn || '').toLowerCase();
        const nameTe = (item.nameTe || '').toLowerCase();
        const spouseEn = (item.spouseEn || '').toLowerCase();
        const spouseTe = (item.spouseTe || '').toLowerCase();
        const birth = (item.birth || '').toLowerCase();
        const death = (item.death || '').toLowerCase();
        const age = (item.age || '').toString().toLowerCase();
        
        return nameEn.includes(term) || nameTe.includes(term) || 
               spouseEn.includes(term) || spouseTe.includes(term) ||
               birth.includes(term) || death.includes(term) || age.includes(term);
      });
    });

    if (exactMatches.length > 0) {
      console.log('Found exact matches:', exactMatches.length);
      return exactMatches;
    }

    console.log('No matches found, returning empty array');
    return [];
  };

  // Load genealogy data
  useEffect(() => {
    if (genealogyTreeData && genealogyTreeData.length > 0) {
      setGenealogyData(genealogyTreeData[0]);
    }
  }, []);

  // Convert tree to table data whenever genealogy data or expanded nodes change
  useEffect(() => {
    if (genealogyData) {
      const tableData = convertGenealogyToTableData(genealogyData);
      console.log('Converted table data:', tableData);
      setFilteredData(tableData);
    }
  }, [genealogyData, expandedNodes, lang]);

  // Filter data when search text changes
  useEffect(() => {
    if (genealogyData) {
      const tableData = convertGenealogyToTableData(genealogyData);
      const filtered = advancedSearchFilter(tableData, searchText);
      setFilteredData(filtered);
    }
  }, [searchText, genealogyData, expandedNodes, lang]);

  const toggleNode = (nodeName) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeName)) {
        newSet.delete(nodeName);
      } else {
        newSet.add(nodeName);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const getAllNodeNames = (node) => {
      const names = [node.name];
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          names.push(...getAllNodeNames(child));
        });
      }
      return names;
    };
    
    const allNames = getAllNodeNames(genealogyData);
    setExpandedNodes(new Set(allNames));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['Adam']));
  };

  return (
    <div 
      className="data-grid-container" 
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'hidden',
        width: '100%',
        margin: 0,
        padding: 0
      }}
    >
      {/* Header Section */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 className="section-title-with-icon">
          <FaSitemap className="section-icon" style={{ marginRight: '12px', color: 'var(--primary-color)' }} />
          {lang === 'te' ? 'వంశపారంపర్య వృక్షం' : 'Family Tree'}
        </h2>
      </div>

      {/* Controls Section */}
      <div className="header-actions" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            placeholder={lang === 'te' ? 'పేరు లేదా వివరాలతో వెతకండి...' : 'Search by name or details...'}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'var(--input-bg)',
              color: 'var(--text-color)',
              transition: 'all 0.2s ease'
            }}
          />
        </div>

        {/* Row Count */}
        <span className="row-count-text" style={{
          padding: '12px 16px',
          background: 'var(--card-bg)',
          borderRadius: '8px',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)',
          minWidth: 'max-content'
        }}>
          {lang === 'te' ? 
            `${filteredData.length} వ్యక్తులు` : 
            `${filteredData.length} persons`
          }
        </span>

        {/* Expand/Collapse Controls */}
        <button
          onClick={expandAll}
          className="action-button"
          style={{
            padding: '12px 16px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: 'max-content'
          }}
        >
          {lang === 'te' ? 'అన్నీ విస్తరించు' : 'Expand All'}
        </button>

        <button
          onClick={collapseAll}
          className="action-button"
          style={{
            padding: '12px 16px',
            background: 'var(--secondary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: 'max-content'
          }}
        >
          {lang === 'te' ? 'అన్నీ కుదించు' : 'Collapse All'}
        </button>
      </div>

      {/* Table Section with Fixed Header */}
      <div style={{ 
        flex: 1, 
        minHeight: 0, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Fixed Table Header */}
        <div 
          ref={headerContainerRef}
          className="table-header-container" 
          style={{ 
            flexShrink: 0,
            background: 'var(--card-bg)',
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 4px 12px var(--shadow-medium)',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'thin',
            msOverflowStyle: 'auto',
            position: 'relative',
            zIndex: 10,
            width: '100%',
            margin: 0,
            padding: 0
          }}
        >
          <table className="genealogy-table family-tree-grid-table" style={{ 
            marginBottom: 0, 
            minWidth: '100%',
            width: '100%',
            tableLayout: 'auto',
            borderCollapse: 'separate',
            borderSpacing: 0,
            position: 'relative'
          }}>
            <colgroup>
              <col style={{ width: '100%' }} />
            </colgroup>
            <thead>
              <tr className="table-header">
                <th className="table-header-cell" style={{ 
                  borderRight: 'none',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'var(--primary-color)',
                  zIndex: 3,
                  padding: '12px 16px',
                  overflow: 'hidden',
                  userSelect: 'none',
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <span>{lang === 'te' ? 'వంశపారంపర్య వృక్షం - వ్యక్తి వివరాలు' : 'Family Tree - Person Details'}</span>
                  </div>
                </th>
              </tr>
            </thead>
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
            maxHeight: 'calc(100vh - 320px)',
            position: 'relative',
            width: '100%',
            scrollbarWidth: 'thin',
            margin: 0,
            padding: 0
          }}
        >
          <table className="genealogy-table family-tree-grid-table" style={{ 
            borderRadius: 0, 
            minWidth: '100%',
            width: '100%',
            tableLayout: 'auto',
            borderCollapse: 'separate',
            borderSpacing: 0
          }}>
            <colgroup>
              <col style={{ width: '100%' }} />
            </colgroup>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    {genealogyData ? 
                      (searchText ? 
                        (lang === 'te' ? 'శోధన ఫలితాలు లేవు' : 'No search results found') :
                        (lang === 'te' ? 'డేటా లేదు' : 'No data available')
                      ) :
                      (lang === 'te' ? 'డేటా లోడ్ చేస్తున్నాము...' : 'Loading data...')
                    }
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => {
                  return (
                    <tr 
                      key={row.id} 
                      className={`table-row ${index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}`}
                      style={{ 
                        '--level': row.level 
                      }}
                    >
                      <td 
                        className="table-cell" 
                        style={{ 
                          borderRight: 'none',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: index % 2 === 0 ? 'var(--row-even-bg)' : 'var(--row-odd-bg)',
                          zIndex: 2,
                          padding: '12px 16px',
                          overflow: 'visible',
                          width: '100%',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => showTooltip(e, row)}
                        onMouseLeave={hideTooltip}
                      >
                        <div 
                          className="name-content"
                          style={{ 
                            paddingLeft: `${20 + (row.level * 25)}px`,
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%'
                          }}
                        >
                          {row.hasChildren && (
                            <button
                              className="expand-button"
                              onClick={() => toggleNode(row.originalName)}
                              title={row.isExpanded ? 
                                (lang === 'te' ? 'కుదించు' : 'Collapse') : 
                                (lang === 'te' ? 'విస్తరించు' : 'Expand')
                              }
                              style={{ 
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                marginRight: '8px',
                                fontSize: '14px',
                                color: 'var(--primary-color)',
                                fontWeight: 'bold',
                                padding: '4px 6px',
                                borderRadius: '4px',
                                transition: 'all 0.2s ease',
                                minWidth: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'var(--hover-bg)';
                                e.target.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.transform = 'scale(1)';
                              }}
                            >
                              {row.isExpanded ? '▼' : '▶'}
                            </button>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                            <span 
                              className={`person-name ${row.level === 0 ? 'root-name' : ''}`}
                              style={{ 
                                fontWeight: row.level === 0 ? 'bold' : row.level === 1 ? '600' : 'normal',
                                color: row.level === 0 ? 'var(--primary-color)' : 'var(--text-color)',
                                fontSize: row.level === 0 ? '16px' : row.level === 1 ? '15px' : '14px',
                                whiteSpace: 'nowrap'
                              }}
                              title={lang === 'te' ? 'వివరాలకు హోవర్ చేయండి' : 'Hover for details'}
                            >
                              {row.name || 'No Name'}
                            </span>
                            <span 
                              style={{ 
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                fontStyle: 'italic',
                                marginTop: '2px'
                              }}
                            >
                              {lang === 'te' ? 'వివరాలకు హోవర్ చేయండి' : 'Hover for details'}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Tooltip */}
      {tooltip.show && (
        <div
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: tooltip.x,
            transform: 'translateX(-50%)',
            background: 'var(--tooltip-bg, rgba(0, 0, 0, 0.9))',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            whiteSpace: 'pre-line',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            maxWidth: '300px',
            wordWrap: 'break-word',
            pointerEvents: 'none',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
