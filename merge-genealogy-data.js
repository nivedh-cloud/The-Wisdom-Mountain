// Script to merge English and Telugu genealogy data into a single bilingual file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read both data files
const englishDataPath = path.join(__dirname, 'src/assets/data/genealogy-min.json');
const teluguDataPath = path.join(__dirname, 'src/assets/data/genealogy_telu-min.json');

console.log('Reading data files...');
const englishData = JSON.parse(fs.readFileSync(englishDataPath, 'utf8'));
const teluguData = JSON.parse(fs.readFileSync(teluguDataPath, 'utf8'));

// Function to merge person objects
function mergePerson(englishPerson, teluguPerson) {
  if (!englishPerson || !teluguPerson) {
    console.warn('Missing person data:', { english: !!englishPerson, telugu: !!teluguPerson });
    return englishPerson || teluguPerson;
  }

  const merged = {
    name: teluguPerson.name, // Default display name (Telugu)
    nameEn: englishPerson.name,
    nameTe: teluguPerson.name,
    age: englishPerson.age || teluguPerson.age,
    class: englishPerson.class || teluguPerson.class,
    birth: englishPerson.birth || teluguPerson.birth,
    death: englishPerson.death || teluguPerson.death,
    spouse: teluguPerson.spouse || englishPerson.spouse,
    detail: teluguPerson.detail || englishPerson.detail
  };

  // Handle children recursively
  if (englishPerson.children || teluguPerson.children) {
    const englishChildren = Array.isArray(englishPerson.children) ? englishPerson.children : 
                           englishPerson._children || [];
    const teluguChildren = Array.isArray(teluguPerson.children) ? teluguPerson.children : 
                          teluguPerson._children || [];
    
    merged.children = [];
    
    // Create a map for easier matching
    const teluguChildrenMap = new Map();
    teluguChildren.forEach((child, index) => {
      teluguChildrenMap.set(index, child);
    });

    // Merge children by position/index (assuming they're in the same order)
    const maxChildren = Math.max(englishChildren.length, teluguChildren.length);
    for (let i = 0; i < maxChildren; i++) {
      const englishChild = englishChildren[i];
      const teluguChild = teluguChildren[i];
      const mergedChild = mergePerson(englishChild, teluguChild);
      if (mergedChild) {
        merged.children.push(mergedChild);
      }
    }

    // If no children, remove the property
    if (merged.children.length === 0) {
      delete merged.children;
    }
  }

  // Handle _children (collapsed children)
  if (englishPerson._children || teluguPerson._children) {
    const englishHiddenChildren = englishPerson._children || [];
    const teluguHiddenChildren = teluguPerson._children || [];
    
    merged._children = [];
    
    const maxHiddenChildren = Math.max(englishHiddenChildren.length, teluguHiddenChildren.length);
    for (let i = 0; i < maxHiddenChildren; i++) {
      const englishChild = englishHiddenChildren[i];
      const teluguChild = teluguHiddenChildren[i];
      const mergedChild = mergePerson(englishChild, teluguChild);
      if (mergedChild) {
        merged._children.push(mergedChild);
      }
    }

    if (merged._children.length === 0) {
      delete merged._children;
    }
  }

  return merged;
}

console.log('Merging genealogy data...');
const mergedData = mergePerson(englishData, teluguData);

// Write the merged data to a new file
const outputPath = path.join(__dirname, 'src/assets/data/genealogy-bilingual.json');
fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), 'utf8');

console.log('✅ Successfully created bilingual genealogy data file:');
console.log(`   ${outputPath}`);
console.log(`   File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

// Create a backup of the original files
const backupDir = path.join(__dirname, 'src/assets/data/backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

fs.copyFileSync(englishDataPath, path.join(backupDir, 'genealogy-min.json'));
fs.copyFileSync(teluguDataPath, path.join(backupDir, 'genealogy_telu-min.json'));

console.log('✅ Original files backed up to:', backupDir);
console.log('\nNext steps:');
console.log('1. Update D3Chart component to use the new bilingual data file');
console.log('2. Modify search functionality to search both nameEn and nameTe');
console.log('3. Update display logic based on language selection');
