import fs from 'fs';

// Load the improved bilingual data
const bilingualData = JSON.parse(fs.readFileSync('./src/assets/data/genealogy-bilingual-improved.json', 'utf8'));

// Function to search for a person in the genealogy tree
function searchPerson(data, searchTerm, language = 'en') {
    const results = [];
    
    function searchInNode(node, path = []) {
        const currentPath = [...path, node.name];
        
        // Check name in both languages
        const nameEn = node.nameEn || node.name || '';
        const nameTe = node.nameTe || '';
        
        const searchLower = searchTerm.toLowerCase();
        if (nameEn.toLowerCase().includes(searchLower) || 
            nameTe.toLowerCase().includes(searchLower)) {
            results.push({
                name: language === 'te' ? nameTe || nameEn : nameEn,
                nameEn: nameEn,
                nameTe: nameTe,
                spouse: language === 'te' ? (node.spouseTe || node.spouse) : (node.spouseEn || node.spouse),
                detail: language === 'te' ? (node.detailTe || node.detail) : (node.detailEn || node.detail),
                path: currentPath
            });
        }
        
        // Search in children
        const children = node.children || node._children || [];
        children.forEach(child => searchInNode(child, currentPath));
    }
    
    searchInNode(data);
    return results;
}

// Test searches
console.log('🔍 Testing bilingual search functionality...\n');

// Test 1: Search for "David" in English mode
console.log('1. Searching for "David" in English mode:');
const davidEnResults = searchPerson(bilingualData, 'David', 'en');
davidEnResults.forEach(result => {
    console.log(`   Found: ${result.name} (English: ${result.nameEn}, Telugu: ${result.nameTe})`);
    console.log(`   Spouse: ${result.spouse}`);
    console.log(`   Detail: ${result.detail?.substring(0, 100)}...`);
});

console.log('\n2. Searching for "David" in Telugu mode:');
const davidTeResults = searchPerson(bilingualData, 'David', 'te');
davidTeResults.forEach(result => {
    console.log(`   Found: ${result.name} (English: ${result.nameEn}, Telugu: ${result.nameTe})`);
    console.log(`   Spouse: ${result.spouse}`);
    console.log(`   Detail: ${result.detail?.substring(0, 100)}...`);
});

console.log('\n3. Searching for "దావీదు" (Telugu David) in English mode:');
const davidTeInEnResults = searchPerson(bilingualData, 'దావీదు', 'en');
davidTeInEnResults.forEach(result => {
    console.log(`   Found: ${result.name} (English: ${result.nameEn}, Telugu: ${result.nameTe})`);
});

console.log('\n4. Searching for "దావీదు" (Telugu David) in Telugu mode:');
const davidTeInTeResults = searchPerson(bilingualData, 'దావీదు', 'te');
davidTeInTeResults.forEach(result => {
    console.log(`   Found: ${result.name} (English: ${result.nameEn}, Telugu: ${result.nameTe})`);
});

console.log('\n5. Testing default display language by checking root person:');
console.log(`   Root name (primary): ${bilingualData.name}`);
console.log(`   Root nameEn: ${bilingualData.nameEn}`);
console.log(`   Root nameTe: ${bilingualData.nameTe}`);
console.log(`   Root spouse (primary): ${bilingualData.spouse}`);
console.log(`   Root spouseEn: ${bilingualData.spouseEn}`);
console.log(`   Root spouseTe: ${bilingualData.spouseTe}`);

console.log('\n✅ All tests completed!');
