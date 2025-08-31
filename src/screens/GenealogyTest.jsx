import React from 'react';
import DataGrid from '../components/DataGrid';
import genealogyBilingualData from '../assets/data/genealogy-bilingual-improved.json';

const translations = {
  en: {
    'adam-to-jesus': "Adam to Jesus (Complete Genealogy)",
    'adam-to-noah': "Adam to Noah",
    'noah-to-abraham': "Noah to Abraham",
    'abraham-to-moses': "Abraham to Moses",
    'moses-to-david': "Moses to David",
    'david-to-hezekiah': "David to Hezekiah",
    'before-babylonian-exile': "Before Babylonian Exile",
    'after-babylonian-exile': "After Babylonian Exile",
    'complete-genealogy': "Complete Biblical Genealogy",
    person: 'Person',
    age: 'Age',
    birth: 'Birth Year',
    death: 'Death Year',
    spouse: 'Spouse',
    detail: 'Details',
    chartLabel: 'Age (years)'
  },
  te: {
    'adam-to-jesus': 'ఆదాం నుండి యేసు (పూర్తి వంశావళి)',
    'adam-to-noah': 'ఆదాం నుండి నోహు',
    'noah-to-abraham': 'నోహు నుండి అబ్రాహాము',
    'abraham-to-moses': 'అబ్రాహాము నుండి మోషే',
    'moses-to-david': 'మోషే నుండి దావీదు', 
    'david-to-hezekiah': 'దావీదు నుండి హిజ్కియా',
    'before-babylonian-exile': 'బబులోనియన్కు ముందు',
    'after-babylonian-exile': 'బబులోనియన్ తర్వాత',
    'complete-genealogy': "పూర్తి బైబిల్ వంశావళి",
    person: 'పేరు',
    age: 'వయస్సు',
    birth: 'జన్మ సంవత్సరం',
    death: 'మృత్యు సంవత్సరం',
    spouse: 'జీవిత భాగస్వామి',
    detail: 'వివరాలు',
    chartLabel: 'వయస్సు (సంవత్సరాలు)'
  }
};

function convertGenealogyToFlatArray(genealogyData) {
  const flatArray = [];
  
  function traverseNode(node) {
    if (!node) return;
    
    if (node.name) {
      flatArray.push({
        person: node.name,
        age: node.age || '',
        birth: node.birth || '',
        death: node.death || '',
        spouse: node.spouse || '',
        detail: node.detail || ''
      });
    }
    
    // Check for both 'children' and '_children' properties
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        traverseNode(child);
      });
    }
    
    if (node._children && Array.isArray(node._children)) {
      node._children.forEach(child => {
        traverseNode(child);
      });
    }
  }
  
  traverseNode(genealogyData);
  return flatArray;
}

function filterGenealogyBySection(flatData, section) {
  const sectionFilters = {
    'adam-to-jesus': () => flatData, // Show all 1050+ records
    'adam-to-noah': (data) => {
      const startIndex = data.findIndex(person => person.person.toLowerCase().includes('adam'));
      const endIndex = data.findIndex(person => person.person.toLowerCase().includes('noah'));
      return endIndex >= 0 ? data.slice(startIndex, endIndex + 1) : data.slice(startIndex, startIndex + 10);
    },
    'noah-to-abraham': (data) => {
      const startIndex = data.findIndex(person => person.person.toLowerCase().includes('noah'));
      const endIndex = data.findIndex(person => person.person.toLowerCase().includes('abraham'));
      return endIndex >= 0 ? data.slice(startIndex, endIndex + 1) : data.slice(startIndex, startIndex + 15);
    },
    'abraham-to-moses': (data) => {
      const startIndex = data.findIndex(person => person.person.toLowerCase().includes('abraham'));
      const endIndex = data.findIndex(person => person.person.toLowerCase().includes('moses'));
      return endIndex >= 0 ? data.slice(startIndex, endIndex + 1) : data.slice(startIndex, startIndex + 15);
    },
    'moses-to-david': (data) => {
      const startIndex = data.findIndex(person => person.person.toLowerCase().includes('moses'));
      const endIndex = data.findIndex(person => person.person.toLowerCase().includes('david'));
      return endIndex >= 0 ? data.slice(startIndex, endIndex + 1) : data.slice(startIndex, startIndex + 20);
    },
    'david-to-hezekiah': (data) => {
      const startIndex = data.findIndex(person => person.person.toLowerCase().includes('david'));
      const endIndex = data.findIndex(person => person.person.toLowerCase().includes('hezekiah'));
      return endIndex >= 0 ? data.slice(startIndex, endIndex + 1) : data.slice(startIndex, startIndex + 25);
    },
    'before-babylonian-exile': (data) => {
      const startIndex = data.findIndex(person => person.person.toLowerCase().includes('hezekiah'));
      return data.slice(startIndex, startIndex + 18);
    },
    'after-babylonian-exile': (data) => {
      // Get the last portion of records
      return data.slice(-12);
    }
  };
  
  const filterFunction = sectionFilters[section];
  return filterFunction ? filterFunction(flatData) : flatData;
}

export default function GenealogyGrid({ lang, section = 'adam-to-jesus' }) {
  const t = translations[lang] || translations.en;
  
  const flatGenealogyData = convertGenealogyToFlatArray(genealogyBilingualData);
  const data = filterGenealogyBySection(flatGenealogyData, section);
  
  console.log(`Showing ${data.length} records for ${section}`);

  const columns = [
    {
      header: t.person,
      dataKey: 'person'
    },
    {
      header: t.age,
      dataKey: 'age'
    },
    {
      header: t.birth,
      dataKey: 'birth'
    },
    {
      header: t.death,
      dataKey: 'death'
    },
    {
      header: t.spouse,
      dataKey: 'spouse'
    },
    {
      header: t.detail,
      dataKey: 'detail'
    }
  ];

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
        title={t[section] || t['complete-genealogy']}
        chartConfig={{
          dataKey: 'age',
          label: t.chartLabel,
          xLabel: t.person
        }}
      />
    </div>
  );
}
