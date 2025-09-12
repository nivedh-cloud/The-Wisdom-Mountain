import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the genealogy data
const genealogyPath = path.join(__dirname, 'src/assets/data/genealogy-bilingual-improved.json');
const genealogyData = JSON.parse(fs.readFileSync(genealogyPath, 'utf8'));

let currentId = 1;

// Function to add unique IDs to each person
function addUniqueIds(node, parentId = null) {
  if (!node) return;
  
  // Add unique ID to current node
  node.id = `person_${currentId++}`;
  
  // Add parent reference if provided
  if (parentId) {
    node.parentId = parentId;
  }
  
  // Process children array
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => {
      addUniqueIds(child, node.id);
    });
  }
  
  // Process _children array
  if (node._children && Array.isArray(node._children)) {
    node._children.forEach(child => {
      addUniqueIds(child, node.id);
    });
  }
}

// Add IDs starting from root
addUniqueIds(genealogyData);

// Create backup of original file
const backupPath = path.join(__dirname, 'src/assets/data/genealogy-bilingual-improved-backup.json');
fs.writeFileSync(backupPath, fs.readFileSync(genealogyPath, 'utf8'));

// Write updated data back to file
fs.writeFileSync(genealogyPath, JSON.stringify(genealogyData, null, 2));

console.log(`✅ Added unique IDs to genealogy data. Total persons processed: ${currentId - 1}`);
console.log(`📁 Backup created at: genealogy-bilingual-improved-backup.json`);
console.log(`🔧 Updated file: genealogy-bilingual-improved.json`);
