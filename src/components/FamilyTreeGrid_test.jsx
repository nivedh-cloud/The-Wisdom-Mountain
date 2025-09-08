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
  const [columnWidths, setColumnWidths] = useState({
    name: 400,
    birth: 200,
    death: 200,
    age: 150,
    spouse: 350
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeColumn, setResizeColumn] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const headerContainerRef = useRef(null);
  const bodyContainerRef = useRef(null);

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

    // Add children if expanded
    if (node.children && node.children.length > 0 && expandedNodes.has(node.name)) {
      node.children.forEach(child => {
        const childRows = convertGenealogyToTableData(child, level + 1, currentPath);
        result.push(...childRows);
      });
    }

    return result;
  };

  // Load genealogy data
  useEffect(() => {
    console.log('Setting genealogy data:', genealogyTreeData);
    setGenealogyData(genealogyTreeData);
  }, []);

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

  // Filter data and expand nodes that contain search results
  const filterAndExpandForSearch = (data, searchText, genealogyData) => {
    if (!searchText.trim()) return data;
    
    const search = searchText.toLowerCase();
    console.log(lang === 'te' ? 'వెతుకుతున్నాము:' : 'Searching for:', search, lang === 'te' ? 'మొత్తం వరుసలు:' : 'in', data.length, lang === 'te' ? 'వరుసలు' : 'rows');
    
    // Enhanced cross-language search - search in both English and Telugu regardless of current language
    const matchingItems = data.filter(row => {
      const matches = (
        // Search in current display language
        row.name?.toLowerCase().includes(search) ||
        row.spouse?.toLowerCase().includes(search) ||
        // Search in both English and Telugu names regardless of current language
        row.nameEn?.toLowerCase().includes(search) ||
        row.nameTe?.toLowerCase().includes(search) ||
        row.spouseEn?.toLowerCase().includes(search) ||
        row.spouseTe?.toLowerCase().includes(search) ||
        // Search in other fields
        row.birth?.toLowerCase().includes(search) ||
        row.death?.toLowerCase().includes(search) ||
        row.age?.toString().toLowerCase().includes(search)
      );
      
      if (matches) {
        console.log(lang === 'te' ? 'మ్యాచ్ కనుగొనబడింది:' : 'Found match:', row.name, 
                   lang === 'te' ? '(మూల పేరు:' : '(Original:', row.originalName + ')');
      }
      return matches;
    });

    console.log('Found', matchingItems.length, 'matching items');

    // Enhanced node expansion for cross-language search
    const expandNodesForSearch = (node, targetSearch, expandedSet = new Set()) => {
      if (!node) return expandedSet;
      
      // Check matches in both languages regardless of current display language
      const nodeMatches = (
        (node.nameEn || node.name)?.toLowerCase().includes(targetSearch) ||
        (node.nameTe || node.name)?.toLowerCase().includes(targetSearch) ||
        (node.spouseEn || node.spouse)?.toLowerCase().includes(targetSearch) ||
        (node.spouseTe || node.spouse)?.toLowerCase().includes(targetSearch) ||
        node.birth?.toLowerCase().includes(targetSearch) ||
        node.death?.toLowerCase().includes(targetSearch) ||
        node.age?.toString().toLowerCase().includes(targetSearch)
      );
      
      // Check if any descendant matches (cross-language)
      const hasMatchingDescendant = (nodeToCheck) => {
        if (!nodeToCheck) return false;
        
        const descendantMatches = (
          (nodeToCheck.nameEn || nodeToCheck.name)?.toLowerCase().includes(targetSearch) ||
          (nodeToCheck.nameTe || nodeToCheck.name)?.toLowerCase().includes(targetSearch) ||
          (nodeToCheck.spouseEn || nodeToCheck.spouse)?.toLowerCase().includes(targetSearch) ||
          (nodeToCheck.spouseTe || nodeToCheck.spouse)?.toLowerCase().includes(targetSearch) ||
          nodeToCheck.birth?.toLowerCase().includes(targetSearch) ||
          nodeToCheck.death?.toLowerCase().includes(targetSearch) ||
          nodeToCheck.age?.toString().toLowerCase().includes(targetSearch)
        );
        
        if (descendantMatches) return true;
        
        if (nodeToCheck.children) {
          return nodeToCheck.children.some(child => hasMatchingDescendant(child));
        }
        return false;
      };

      if (nodeMatches || hasMatchingDescendant(node)) {
        expandedSet.add(node.name);
        
        if (node.children) {
          node.children.forEach(child => {
            expandNodesForSearch(child, targetSearch, expandedSet);
          });
        }
      }
      
      return expandedSet;
    };

    const newExpandedNodes = expandNodesForSearch(genealogyData, search);
    console.log('Nodes to expand:', Array.from(newExpandedNodes));
    
    // Update expanded nodes to include search results
    setExpandedNodes(prev => {
      const combined = new Set([...prev, ...newExpandedNodes]);
      console.log('Combined expanded nodes:', Array.from(combined));
      return combined;
    });
    
    // If we have matches, regenerate table data and filter results with cross-language search
    if (matchingItems.length > 0 || newExpandedNodes.size > 0) {
      // Regenerate table data with expanded nodes
      const tableData = convertGenealogyToTableData(genealogyData);
      const filteredResults = tableData.filter(row => {
        return (
          // Search in current display language
          row.name?.toLowerCase().includes(search) ||
          row.spouse?.toLowerCase().includes(search) ||
          // Search in both English and Telugu regardless of current language
          row.nameEn?.toLowerCase().includes(search) ||
          row.nameTe?.toLowerCase().includes(search) ||
          row.spouseEn?.toLowerCase().includes(search) ||
          row.spouseTe?.toLowerCase().includes(search) ||
          // Search in other fields
          row.birth?.toLowerCase().includes(search) ||
          row.death?.toLowerCase().includes(search) ||
          row.age?.toString().toLowerCase().includes(search)
        );
      });
      
      console.log('Final filtered results:', filteredResults.length);
      return filteredResults;
    }
    
    console.log('No matches found, returning empty array');
    return [];
  };

  useEffect(() => {
    console.log('Processing genealogy data:', genealogyData);
    console.log('Expanded nodes:', Array.from(expandedNodes));
    if (genealogyData) {
      const tableData = convertGenealogyToTableData(genealogyData);
      console.log('Generated table data:', tableData.length, 'rows');
      
      if (searchText.trim()) {
        const filtered = filterAndExpandForSearch(tableData, searchText, genealogyData);
        console.log('Filtered data:', filtered.length, 'rows');
        setFilteredData(filtered);
      } else {
        setFilteredData(tableData);
      }
    } else {
      console.log('No genealogy data available');
    }
  }, [lang, expandedNodes, genealogyData]);

  // Separate effect for search to trigger expansion and filtering
  useEffect(() => {
    console.log('Search effect triggered with:', searchText);
    if (genealogyData && searchText.trim()) {
      const tableData = convertGenealogyToTableData(genealogyData);
      const filtered = filterAndExpandForSearch(tableData, searchText, genealogyData);
      console.log('Search filtered data:', filtered.length, 'rows');
      setFilteredData(filtered);
    } else if (genealogyData) {
      const tableData = convertGenealogyToTableData(genealogyData);
      console.log('No search, showing all data:', tableData.length, 'rows');
      setFilteredData(tableData);
    }
  }, [searchText]);

  // Scroll synchronization between header and body
  useEffect(() => {
    const bodyContainer = bodyContainerRef.current;
    const headerContainer = headerContainerRef.current;
    
    if (!bodyContainer || !headerContainer) return;

    const handleBodyScroll = () => {
      headerContainer.scrollLeft = bodyContainer.scrollLeft;
    };

    const handleHeaderScroll = () => {
      bodyContainer.scrollLeft = headerContainer.scrollLeft;
    };

    bodyContainer.addEventListener('scroll', handleBodyScroll);
    headerContainer.addEventListener('scroll', handleHeaderScroll);

    return () => {
      if (bodyContainer) bodyContainer.removeEventListener('scroll', handleBodyScroll);
      if (headerContainer) headerContainer.removeEventListener('scroll', handleHeaderScroll);
    };
  }, [filteredData]);

  const toggleNode = (nodeName) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeName)) {
      newExpanded.delete(nodeName);
    } else {
      newExpanded.add(nodeName);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    // Get all node names from the genealogy data
    const getAllNodeNames = (node) => {
      const names = [node.name];
      if (node.children) {
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

  // Column resizing handlers
  const handleMouseDown = (e, columnKey) => {
    setIsResizing(true);
    setResizeColumn(columnKey);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnKey]);
    e.preventDefault();
    
    // Add visual feedback
    const headerCell = e.target.closest('th');
    if (headerCell) {
      headerCell.classList.add('resizing');
    }
    
    // Change cursor for entire document during resize
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!isResizing || !resizeColumn) return;
      
      const diff = e.clientX - startX;
      const newWidth = Math.max(80, startWidth + diff); // Minimum width of 80px
      
      setColumnWidths(prev => ({
        ...prev,
        [resizeColumn]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeColumn(null);
      
      // Remove visual feedback
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Remove resizing class from all headers
      const headers = document.querySelectorAll('.genealogy-table th');
      headers.forEach(header => header.classList.remove('resizing'));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeColumn, startX, startWidth]);

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
          {lang === 'te' ? 'కుటుంబ వృక్షం గ్రిడ్' : 'Family Tree Grid'}
        </h2>
        
      </div>

      {/* Controls Row */}
      <div className="controls-row" style={{ marginBottom: '20px', gap: '16px' }}>
        <div className="search-section" style={{ flex: '1', maxWidth: '400px' }}>
          <div className="search-input-container" style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder={lang === 'te' ? 'వెతకండి... (తెలుగు లేదా ఇంగ్లీష్‌లో)' : 'Search... (Telugu or English)'}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="filter-input-compact"
              style={{ 
                width: '100%',
                paddingRight: searchText ? '35px' : '12px'
              }}
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="search-clear-button"
                title={lang === 'te' ? 'శోధనను క్లియర్ చేయండి' : 'Clear search'}
                aria-label={lang === 'te' ? 'శోధనను క్లియర్ చేయండి' : 'Clear search'}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '16px',
                  padding: '4px',
                  zIndex: 10
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <div className="row-count-text">
            {filteredData.length} {lang === 'te' ? 'రికార్డులు' : 'rows'}
            {genealogyData ? (filteredData.length > 0 ? (searchText ? (lang === 'te' ? ' (ద్విభాషా శోధన)' : ' (Bilingual search)') : '') : (searchText ? (lang === 'te' ? ' (శోధన ఫలితాలు లేవు)' : ' (No search results)') : (lang === 'te' ? ' (డేటా చూపబడలేదు)' : ' (No data displayed)'))) : (lang === 'te' ? ' (లోడ్ అవుతోంది...)' : ' (Loading...)')}
          </div>
          <button 
            onClick={expandAll}
            className="action-button print-button"
            title={lang === 'te' ? 'అన్నీ విస్తరించు' : 'Expand All'}
          >
            <span className="action-button-text">
              {lang === 'te' ? 'అన్నీ విస్తరించు' : 'Expand All'}
            </span>
          </button>
          <button 
            onClick={collapseAll}
            className="action-button excel-button"
            title={lang === 'te' ? 'అన్నీ కుదించు' : 'Collapse All'}
          >
            <span className="action-button-text">
              {lang === 'te' ? 'అన్నీ కుదించు' : 'Collapse All'}
            </span>
          </button>
        </div>
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
          <table className="genealogy-table" style={{ 
            marginBottom: 0, 
            minWidth: `${Math.max(1500, Object.values(columnWidths).reduce((sum, width) => sum + width, 0))}px`, 
            width: `${Math.max(1500, Object.values(columnWidths).reduce((sum, width) => sum + width, 0))}px`,
            tableLayout: 'fixed',
            borderCollapse: 'separate',
            borderSpacing: 0,
            position: 'relative'
          }}>
            <colgroup>
              <col style={{ width: `${columnWidths.name}px`, minWidth: `${columnWidths.name}px` }} />
              <col style={{ width: `${columnWidths.birth}px`, minWidth: `${columnWidths.birth}px` }} />
              <col style={{ width: `${columnWidths.death}px`, minWidth: `${columnWidths.death}px` }} />
              <col style={{ width: `${columnWidths.age}px`, minWidth: `${columnWidths.age}px` }} />
              <col style={{ width: `${columnWidths.spouse}px`, minWidth: `${columnWidths.spouse}px` }} />
            </colgroup>
            <thead>
              <tr className="table-header">
                <th className="table-header-cell" style={{ 
                  borderRight: '2px solid rgba(255,255,255,0.3)',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'var(--primary-color)',
                  zIndex: 3,
                  padding: '12px 16px',
                  overflow: 'hidden',
                  userSelect: 'none',
                  cursor: 'pointer',
                  minWidth: `${columnWidths.name}px`,
                  width: `${columnWidths.name}px`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{lang === 'te' ? 'పేరు' : 'Name'}</span>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleMouseDown(e, 'name')}
                      title={lang === 'te' ? 'కాలమ్ పరిమాణం మార్చడానికి లాగండి' : 'Drag to resize column'}
                    />
                  </div>
                </th>
                <th className="table-header-cell" style={{ 
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 16px',
                  overflow: 'hidden',
                  position: 'relative',
                  userSelect: 'none',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{lang === 'te' ? 'జననం' : 'Birth'}</span>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleMouseDown(e, 'birth')}
                      title={lang === 'te' ? 'కాలమ్ పరిమాణం మార్చడానికి లాగండి' : 'Drag to resize column'}
                    />
                  </div>
                </th>
                <th className="table-header-cell" style={{ 
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 16px',
                  overflow: 'hidden',
                  position: 'relative',
                  userSelect: 'none',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{lang === 'te' ? 'మరణం' : 'Death'}</span>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleMouseDown(e, 'death')}
                      title={lang === 'te' ? 'కాలమ్ పరిమాణం మార్చడానికి లాగండి' : 'Drag to resize column'}
                    />
                  </div>
                </th>
                <th className="table-header-cell" style={{ 
                  borderRight: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 16px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  userSelect: 'none',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{lang === 'te' ? 'వయస్సు' : 'Age'}</span>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleMouseDown(e, 'age')}
                      title={lang === 'te' ? 'కాలమ్ పరిమాణం మార్చడానికి లాగండి' : 'Drag to resize column'}
                    />
                  </div>
                </th>
                <th className="table-header-cell" style={{ 
                  padding: '12px 16px',
                  overflow: 'hidden',
                  position: 'relative',
                  userSelect: 'none',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{lang === 'te' ? 'జీవిత భాగస్వామి' : 'Spouse'}</span>
                    <div 
                      className="resize-handle"
                      onMouseDown={(e) => handleMouseDown(e, 'spouse')}
                      title={lang === 'te' ? 'కాలమ్ పరిమాణం మార్చడానికి లాగండి' : 'Drag to resize column'}
                    />
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
          <table className="genealogy-table" style={{ 
            borderRadius: 0, 
            minWidth: `${Math.max(1500, Object.values(columnWidths).reduce((sum, width) => sum + width, 0))}px`, 
            width: `${Math.max(1500, Object.values(columnWidths).reduce((sum, width) => sum + width, 0))}px`,
            tableLayout: 'fixed',
            borderCollapse: 'separate',
            borderSpacing: 0
          }}>
            <colgroup>
              <col style={{ width: `${columnWidths.name}px`, minWidth: `${columnWidths.name}px` }} />
              <col style={{ width: `${columnWidths.birth}px`, minWidth: `${columnWidths.birth}px` }} />
              <col style={{ width: `${columnWidths.death}px`, minWidth: `${columnWidths.death}px` }} />
              <col style={{ width: `${columnWidths.age}px`, minWidth: `${columnWidths.age}px` }} />
              <col style={{ width: `${columnWidths.spouse}px`, minWidth: `${columnWidths.spouse}px` }} />
            </colgroup>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
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
                  console.log('Rendering row:', row);
                  return (
                    <tr 
                      key={row.id} 
                      className={`table-row ${index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}`}
                      style={{ 
                        '--level': row.level 
                      }}
                    >
                      <td className="table-cell" style={{ 
                        borderRight: '2px solid var(--border-color)',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: index % 2 === 0 ? 'var(--row-even-bg)' : 'var(--row-odd-bg)',
                        zIndex: 2,
                        padding: '12px 16px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: `${columnWidths.name}px`,
                        width: `${columnWidths.name}px`,
                        maxWidth: `${columnWidths.name}px`
                      }}>
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
                          <span 
                            className={`person-name ${row.level === 0 ? 'root-name' : ''}`}
                            style={{ 
                              fontWeight: row.level === 0 ? 'bold' : row.level === 1 ? '600' : 'normal',
                              color: row.level === 0 ? 'var(--primary-color)' : 'var(--text-color)',
                              fontSize: row.level === 0 ? '16px' : row.level === 1 ? '15px' : '14px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={row.name}
                          >
                            {row.name || 'No Name'}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell" style={{ 
                        borderRight: '1px solid var(--border-color)',
                        padding: '12px 16px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {row.birth || ''}
                      </td>
                      <td className="table-cell" style={{ 
                        borderRight: '1px solid var(--border-color)',
                        padding: '12px 16px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {row.death || ''}
                      </td>
                      <td className="table-cell" style={{ 
                        borderRight: '1px solid var(--border-color)',
                        padding: '12px 16px',
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {row.age || ''}
                      </td>
                      <td className="table-cell" style={{ 
                        padding: '12px 16px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {row.spouse || ''}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
