import fs from 'fs';

// Load the data files
const englishData = JSON.parse(fs.readFileSync('./src/assets/data/genealogy-min.json', 'utf8'));
const teluguData = JSON.parse(fs.readFileSync('./src/assets/data/genealogy_telu-min.json', 'utf8'));

console.log('🔍 Looking for David entries...\n');

function findDavidEntries(data, label) {
    console.log(`📋 ${label}:`);
    const davids = [];
    
    function searchRecursive(person) {
        if (person.name && (person.name.toLowerCase().includes('david') || person.name.includes('దావీదు'))) {
            davids.push({
                name: person.name,
                spouse: person.spouse,
                detail: person.detail
            });
        }
        if (person.children) {
            person.children.forEach(child => searchRecursive(child));
        }
    }
    
    searchRecursive(data);
    
    davids.forEach((david, index) => {
        console.log(`   ${index + 1}. Name: "${david.name}"`);
        console.log(`      Spouse: "${david.spouse || 'No spouse'}"`);
        console.log(`      Detail: "${(david.detail || 'No detail').substring(0, 100)}..."`);
        console.log('');
    });
    
    return davids;
}

const englishDavids = findDavidEntries(englishData, 'English Data');
const teluguDavids = findDavidEntries(teluguData, 'Telugu Data');

console.log(`\n📊 Summary:`);
console.log(`   English entries: ${englishDavids.length}`);
console.log(`   Telugu entries: ${teluguDavids.length}`);
