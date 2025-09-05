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
    'adam-to-noah': 'ఆదాం నుండి నోవహు',
    'noah-to-abraham': 'నోవహు నుండి అబ్రాము',
    'abraham-to-moses': 'అబ్రాము నుండి మోషే',
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

function convertGenealogyToFlatArray(genealogyData, lang = 'en') {
  const flatArray = [];
  
  function traverseNode(node) {
    if (!node) return;
    
    if (node.name) {
      const record = {
        person: lang === 'te' ? (node.nameTe || node.nameEn || node.name) : (node.nameEn || node.name),
        age: node.age || '',
        birth: node.birth || '',
        death: node.death || '',
        spouse: lang === 'te' ? (node.spouseTe || node.spouseEn || node.spouse) : (node.spouseEn || node.spouse),
        detail: lang === 'te' ? (node.detailTe || node.detailEn || node.detail) : (node.detailEn || node.detail),
        // Keep original bilingual data for search purposes
        originalNode: node
      };
      flatArray.push(record);
      
      // Debug first few records for Telugu
      if (flatArray.length <= 5 && lang === 'te') {
        console.log(`Record ${flatArray.length}:`, record);
      }
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

function filterGenealogyBySection(flatData, section, lang = 'en') {
  // Define name mappings for key biblical figures in both languages
  const nameMap = {
    adam: { en: 'adam', te: 'ఆదాము' },
    noah: { en: 'noah', te: 'నోవహు' },
    abraham: { en: 'abraham', te: 'అబ్రాము' },
    moses: { en: 'moses', te: 'మోషే' },
    david: { en: 'david', te: 'దావీదు' },
    hezekiah: { en: 'hezekiah', te: 'హిజ్కియా' }
  };

  const findPersonIndex = (data, keyName) => {
    const nameToFind = nameMap[keyName] ? nameMap[keyName][lang] : keyName;
    
    // Try multiple search patterns for better matching
    const index = data.findIndex(person => {
      const personName = person.person.toLowerCase();
      const searchNameEn = nameMap[keyName]?.en?.toLowerCase();
      const searchNameTe = nameMap[keyName]?.te;
      
      // Search by English name (always available)
      if (searchNameEn && personName.includes(searchNameEn)) return true;
      
      // Search by Telugu name if available
      if (searchNameTe && person.person.includes(searchNameTe)) return true;
      
      // Handle compound names like "Abram/Abraham"
      if (keyName === 'abraham' && (personName.includes('abram') || personName.includes('abraham'))) return true;
      
      // Fallback to exact name match
      if (personName.includes(keyName.toLowerCase())) return true;
      
      return false;
    });
    
    // Debug search results
    if (lang === 'te') {
      console.log(`Looking for ${keyName} (${nameToFind}):`, index);
      if (index >= 0) {
        console.log(`Found at index ${index}:`, data[index]);
      } else {
        console.log(`Not found. First 10 person names:`, data.slice(0, 10).map(p => p.person));
      }
    }
    
    return index;
  };

  const sectionFilters = {
    'adam-to-jesus': () => flatData, // Show all 1050+ records
    'adam-to-noah': (data) => {
      const startIndex = findPersonIndex(data, 'adam');
      const endIndex = findPersonIndex(data, 'noah');
      return endIndex >= 0 ? data.slice(startIndex, endIndex + 1) : data.slice(startIndex, startIndex + 10);
    },
    'noah-to-abraham': (data) => {
      const startIndex = findPersonIndex(data, 'noah');
      const endIndex = findPersonIndex(data, 'abraham');
      return endIndex >= 0 ? data.slice(startIndex, endIndex + 1) : data.slice(startIndex, startIndex + 15);
    },
    'abraham-to-moses': (data) => {
      const startIndex = findPersonIndex(data, 'abraham');
      const endIndex = findPersonIndex(data, 'moses');
      return endIndex >= 0 ? data.slice(startIndex, endIndex + 1) : data.slice(startIndex, startIndex + 15);
    },
    'moses-to-david': (data) => {
      const startIndex = findPersonIndex(data, 'moses');
      const endIndex = findPersonIndex(data, 'david');
      return endIndex >= 0 ? data.slice(startIndex, endIndex + 1) : data.slice(startIndex, startIndex + 20);
    },
    'david-to-hezekiah': (data) => {
      const startIndex = findPersonIndex(data, 'david');
      const endIndex = findPersonIndex(data, 'hezekiah');
      return endIndex >= 0 ? data.slice(startIndex, endIndex + 1) : data.slice(startIndex, startIndex + 25);
    },
    'before-babylonian-exile': (data) => {
      const startIndex = findPersonIndex(data, 'hezekiah');
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
  
  console.log('GenealogyGrid rendered with:', { lang, section });
  
  const flatGenealogyData = convertGenealogyToFlatArray(genealogyBilingualData, lang);
  console.log('Flat genealogy data length:', flatGenealogyData.length);
  
  const data = filterGenealogyBySection(flatGenealogyData, section, lang);
  console.log(`Filtered data for ${section}:`, data.length, 'records');
  
  if (data.length > 0) {
    console.log('Sample filtered record:', data[0]);
  } else {
    console.log('No records found for section:', section);
  }
  
  console.log(`Showing ${data.length} records for ${section}`);

  // Custom bilingual filter function for genealogy
  const bilingualFilter = (row, filterText) => {
    if (!filterText) return true;
    const searchText = filterText.toLowerCase();
    
    // Get original node data for bilingual search
    const original = row.originalNode || {};
    
    // Search in displayed fields
    const displayFields = [
      row.person,  // Current display name
      row.spouse,  // Current display spouse
      row.detail,  // Current display detail
      row.age?.toString(),
      row.birth,
      row.death
    ];
    
    // Search in both English and Telugu fields from original data
    const bilingualFields = [
      original.name,
      original.nameEn,
      original.nameTe,
      original.spouse,
      original.spouseEn,
      original.spouseTe,
      original.detail,
      original.detailEn,
      original.detailTe
    ];
    
    // Combine all searchable fields
    const allFields = [...displayFields, ...bilingualFields];
    
    return allFields.some(field => 
      field && field.toString().toLowerCase().includes(searchText)
    );
  };

  const columns = [
    {
      header: t.person,
      dataKey: 'person'
    },
    {
      header: t.spouse,
      dataKey: 'spouse'
    },
    {
      header: t.detail,
      dataKey: 'detail'
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
        customFilter={bilingualFilter}
        chartConfig={{
          dataKey: 'age',
          label: t.chartLabel,
          xLabel: t.person
        }}
      />
    </div>
  );
}
