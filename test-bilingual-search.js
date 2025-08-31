// Test script to verify bilingual search functionality
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the bilingual data
const bilingualDataPath = path.join(__dirname, 'src/assets/data/genealogy-bilingual.json');
const bilingualData = JSON.parse(fs.readFileSync(bilingualDataPath, 'utf8'));

console.log('🔍 Testing Bilingual Search Functionality\n');

// Search function (simplified version of the one in D3Chart)
function searchInBilingualData(searchTerm, language = 'en') {
  const results = [];
  const maxResults = 5;
  const term = searchTerm.toLowerCase();
  
  const searchInNode = (node) => {
    if (results.length >= maxResults) return;
    
    const name = (node.name || '').toLowerCase();
    const nameEn = (node.nameEn || '').toLowerCase();
    const nameTe = (node.nameTe || '').toLowerCase();
    
    // Search in all name fields
    if (name.includes(term) || nameEn.includes(term) || nameTe.includes(term)) {
      const displayName = language === 'te' 
        ? (node.nameTe || node.name) 
        : (node.nameEn || node.name);
      
      results.push({
        name: displayName,
        nameEn: node.nameEn,
        nameTe: node.nameTe,
        originalName: node.name
      });
    }
    
    // Search in children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => searchInNode(child));
    }
    
    // Search in _children
    if (node._children && Array.isArray(node._children)) {
      node._children.forEach(child => searchInNode(child));
    }
  };
  
  searchInNode(bilingualData);
  return results;
}

// Test cases
const testCases = [
  { term: 'David', lang: 'en', description: 'Search "David" in English mode' },
  { term: 'David', lang: 'te', description: 'Search "David" in Telugu mode' },
  { term: 'దావీదు', lang: 'en', description: 'Search "దావీదు" in English mode' },
  { term: 'దావీదు', lang: 'te', description: 'Search "దావీదు" in Telugu mode' },
  { term: 'Abraham', lang: 'en', description: 'Search "Abraham" in English mode' },
  { term: 'Abraham', lang: 'te', description: 'Search "Abraham" in Telugu mode' },
  { term: 'Moses', lang: 'en', description: 'Search "Moses" in English mode' },
  { term: 'Moses', lang: 'te', description: 'Search "Moses" in Telugu mode' }
];

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.description}`);
  console.log(`Search term: "${testCase.term}" | Language: ${testCase.lang}`);
  
  const results = searchInBilingualData(testCase.term, testCase.lang);
  
  if (results.length > 0) {
    console.log('✅ Results found:');
    results.forEach((result, i) => {
      console.log(`  ${i + 1}. Display: "${result.name}" | EN: "${result.nameEn}" | TE: "${result.nameTe}"`);
    });
  } else {
    console.log('❌ No results found');
  }
  
  console.log(''); // Empty line for readability
});

console.log('🎉 Bilingual search test completed!');
