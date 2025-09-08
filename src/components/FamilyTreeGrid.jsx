import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import genealogyTreeData from '../assets/data/genealogy-bilingual-improved.json';

const FamilyTreeGrid = () => {
  const { lang } = useLanguage();
  const [rowData, setRowData] = useState([]);

  // Convert genealogy tree data to flat array for AgGrid
  const convertTreeToFlatData = (node, level = 0) => {
    const result = [];
    
    if (!node) return result;

    const displayName = lang === 'te' ? (node.nameTe || node.name) : (node.nameEn || node.name);
    const displaySpouse = lang === 'te' ? (node.spouseTe || node.spouse) : (node.spouseEn || node.spouse);
    
    const flatRow = {
      name: displayName,
      birth: node.birth || '',
      death: node.death || '',
      age: node.age || '',
      spouse: displaySpouse || '',
      level: level
    };

    result.push(flatRow);

    // Add children
    if (node.children) {
      node.children.forEach(child => {
        const childRows = convertTreeToFlatData(child, level + 1);
        result.push(...childRows);
      });
    }

    return result;
  };

  useEffect(() => {
    console.log('Loading genealogy data for AgGrid, language:', lang);
    if (genealogyTreeData) {
      const flatData = convertTreeToFlatData(genealogyTreeData);
      console.log('Converted flat data:', flatData.length, 'rows');
      setRowData(flatData);
    }
  }, [lang, genealogyTreeData]);

  const columnDefs = [
    { 
      field: 'name', 
      headerName: lang === 'te' ? 'పేరు' : 'Name', 
      width: 200,
      cellStyle: params => ({
        paddingLeft: `${(params.data.level || 0) * 20 + 10}px`
      })
    },
    { 
      field: 'birth', 
      headerName: lang === 'te' ? 'జననం' : 'Birth', 
      width: 120 
    },
    { 
      field: 'death', 
      headerName: lang === 'te' ? 'మరణం' : 'Death', 
      width: 120 
    },
    { 
      field: 'age', 
      headerName: lang === 'te' ? 'వయస్సు' : 'Age', 
      width: 100 
    },
    { 
      field: 'spouse', 
      headerName: lang === 'te' ? 'జీవిత భాగస్వామి' : 'Spouse', 
      width: 250 
    }
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ margin: 0 }}>{lang === 'te' ? 'కుటుంబ వృక్షం గ్రిడ్' : 'Family Tree Grid'}</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>{lang === 'te' ? 'డేటా వరుసలు:' : 'Data Rows:'}</strong> {rowData.length}</p>
        <p><strong>{lang === 'te' ? 'AG గ్రిడ్ కాంపోనెంట్ టెస్ట్' : 'AG Grid Component Test'}</strong></p>
      </div>

      <div 
        className="ag-theme-alpine" 
        style={{ 
          height: '400px', 
          width: '100%',
          border: '2px solid var(--primary-color)' // Use theme color instead of red
        }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={(params) => {
            console.log('AG Grid is ready!');
            params.api.sizeColumnsToFit();
          }}
        />
      </div>

      <div style={{ marginTop: '20px', backgroundColor: '#f0f0f0', padding: '10px' }}>
        <strong>Debug - Raw Row Data:</strong>
        <pre>{JSON.stringify(rowData, null, 2)}</pre>
      </div>
    </div>
  );
};

  const columnDefs = [
    {
      field: 'name',
      headerName: lang === 'te' ? 'పేరు' : 'Name',
      width: 250,
    },
    {
      field: 'title',
      headerName: lang === 'te' ? 'బిరుదు' : 'Title',
      width: 200,
    },
    {
      field: 'birth',
      headerName: lang === 'te' ? 'జననం' : 'Birth',
      width: 100,
    },
    {
      field: 'death',
      headerName: lang === 'te' ? 'మరణం' : 'Death',
      width: 100,
    },
    {
      field: 'age',
      headerName: lang === 'te' ? 'వయస్సు' : 'Age',
      width: 100,
    },
    {
      field: 'spouse',
      headerName: lang === 'te' ? 'జీవిత భాగస్వామీ' : 'Spouse',
      width: 300,
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true,
  };

  const autoGroupColumnDef = {
    headerName: lang === 'te' ? 'వంశావళి' : 'Family Tree',
    width: 250,
    cellRendererParams: {
      suppressCount: true,
    },
  };

  const getDataPath = (data) => {
    return data.orgHierarchy;
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const expandAll = () => {
    if (gridApi) {
      gridApi.expandAll();
    }
  };

  const collapseAll = () => {
    if (gridApi) {
      gridApi.collapseAll();
    }
  };

  return (
    <div className="family-tree-grid-container" style={{ padding: '20px' }}>
      <div className="grid-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{lang === 'te' ? 'కుటుంబ వృక్షం గ్రిడ్' : 'Family Tree Grid'}</h2>
        <div className="grid-controls">
          <button 
            onClick={expandAll} 
            style={{ 
              marginRight: '10px', 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            {lang === 'te' ? 'అన్నీ విస్తరించు' : 'Expand All'}
          </button>
          <button 
            onClick={collapseAll}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            {lang === 'te' ? 'అన్నీ కుదించు' : 'Collapse All'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <strong>Debug Info:</strong>
        <p>Row Data Length: {rowData.length}</p>
        <p>Has Genealogy Data: {genealogyData ? 'Yes' : 'No'}</p>
        <p>Root Name: {genealogyData?.name || 'Not found'}</p>
        {rowData.length > 0 && (
          <p>First Row: {JSON.stringify(rowData[0], null, 2)}</p>
        )}
      </div>
      
      <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          animateRows={true}
        />
      </div>
    </div>
  );
};

export default FamilyTreeGrid;
