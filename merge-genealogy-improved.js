import fs from 'fs';
import path from 'path';

// Load the English and Telugu data files
const englishData = JSON.parse(fs.readFileSync('./src/assets/data/backup/genealogy-min.json', 'utf8'));
const teluguData = JSON.parse(fs.readFileSync('./src/assets/data/backup/genealogy_telu-min.json', 'utf8'));

function createBilingualObject(englishPerson, teluguPerson) {
    const bilingualPerson = {
        // Use English as the primary name for default display
        name: englishPerson.name,
        nameEn: englishPerson.name,
        nameTe: teluguPerson.name
    };

    // Copy properties that are common to both languages
    ['age', 'class', 'birth', 'death'].forEach(prop => {
        if (englishPerson[prop]) {
            bilingualPerson[prop] = englishPerson[prop];
        }
    });

    // Handle bilingual spouse fields
    if (englishPerson.spouse || teluguPerson.spouse) {
        bilingualPerson.spouseEn = englishPerson.spouse || '';
        bilingualPerson.spouseTe = teluguPerson.spouse || '';
        // Set primary spouse to English for default display
        bilingualPerson.spouse = englishPerson.spouse || teluguPerson.spouse || '';
    }

    // Handle bilingual detail fields
    if (englishPerson.detail || teluguPerson.detail) {
        bilingualPerson.detailEn = englishPerson.detail || '';
        bilingualPerson.detailTe = teluguPerson.detail || '';
        // Set primary detail to English for default display
        bilingualPerson.detail = englishPerson.detail || teluguPerson.detail || '';
    }

    // Handle children recursively
    if (englishPerson.children || teluguPerson.children) {
        const englishChildren = englishPerson.children || [];
        const teluguChildren = teluguPerson.children || [];
        
        bilingualPerson.children = mergeChildren(englishChildren, teluguChildren);
    }

    // Handle _children (collapsed children)
    if (englishPerson._children || teluguPerson._children) {
        const englishChildren = englishPerson._children || [];
        const teluguChildren = teluguPerson._children || [];
        
        bilingualPerson._children = mergeChildren(englishChildren, teluguChildren);
    }

    return bilingualPerson;
}

function mergeChildren(englishChildren, teluguChildren) {
    const mergedChildren = [];

    // Create a map for Telugu children for quick lookup
    const teluguChildrenMap = new Map();
    teluguChildren.forEach(child => {
        // Use a simple name-based matching (you might need to improve this)
        const key = child.name.toLowerCase().trim();
        teluguChildrenMap.set(key, child);
    });

    // Process English children first (to maintain English as primary)
    englishChildren.forEach(englishChild => {
        let teluguChild = null;
        
        // Try to find matching Telugu child
        // This is a simple matching strategy - you might need to improve it
        for (const [key, child] of teluguChildrenMap.entries()) {
            if (areNamesMatching(englishChild.name, child.name)) {
                teluguChild = child;
                teluguChildrenMap.delete(key); // Remove to avoid duplicates
                break;
            }
        }

        const bilingualChild = createBilingualObject(
            englishChild,
            teluguChild || { name: '', detail: '', spouse: '' }
        );
        mergedChildren.push(bilingualChild);
    });

    // Add remaining Telugu children that didn't have English matches
    teluguChildrenMap.forEach(teluguChild => {
        const bilingualChild = createBilingualObject(
            { name: '', detail: '', spouse: '' },
            teluguChild
        );
        mergedChildren.push(bilingualChild);
    });

    return mergedChildren;
}

function areNamesMatching(englishName, teluguName) {
    // Expanded name mapping for better accuracy
    const nameMapping = {
        'Adam': 'ఆదాము',
        'Seth': 'షేతు', 
        'Enosh': 'ఎనోషు',
        'Kenan': 'కేయినాను',
        'Mahalalel': 'మహలలేలు',
        'Jared': 'యెరెదు',
        'Enoch': 'హనోకు',
        'Methuselah': 'మెతూషెల',
        'Lamech': 'లెమెకు',
        'Noah': 'నోవహు',
        'Shem': 'షేము',
        'Ham': 'హాము',
        'Japheth': 'యాపెతు',
        'Abraham': 'అబ్రాహాము',
        'Abram': 'అబ్రాము',
        'Isaac': 'ఇస్సాకు',
        'Jacob': 'యాకోబు',
        'Israel': 'ఇశ్రాయేలు',
        'Judah': 'యూదా',
        'Perez': 'పెరెసు',
        'Hezron': 'హెస్రోను',
        'Ram': 'రాము',
        'Amminadab': 'అమ్మినాదాబు',
        'Nahshon': 'నయస్సోను',
        'Salmon': 'శల్మా',
        'Salma': 'శల్మా',
        'Boaz': 'బోయజు',
        'Obed': 'ఓబేదు',
        'Jesse': 'యెష్షయి',
        'David': 'దావీదు',
        'Solomon': 'సొలొమోను',
        'Rehoboam': 'రెహబాము',
        'Joseph': 'యోసేపు',
        'Jesus': 'యేసు',
        'Mary': 'మరియ',
        'Moses': 'మోషే',
        'Aaron': 'అహరోను',
        'Miriam': 'మిర్యాము',
        'Joshua': 'యెహోషువ',
        'Benjamin': 'బెన్యామీను',
        'Levi': 'లేవి',
        'Reuben': 'రూబేను',
        'Simeon': 'షిమ్యోను',
        'Ephraim': 'ఎప్రాయీము',
        'Manasseh': 'మనష్షే',
        'Gad': 'గాదు',
        'Asher': 'ఆషేరు',
        'Issachar': 'ఇశ్శాఖారు',
        'Zebulun': 'జెబూలూను',
        'Dan': 'దాను',
        'Naphtali': 'నఫ్తాలి'
    };

    // Direct mapping check
    if (nameMapping[englishName] === teluguName) {
        return true;
    }

    // Check reverse mapping
    const reverseMapping = Object.fromEntries(
        Object.entries(nameMapping).map(([en, te]) => [te, en])
    );
    if (reverseMapping[teluguName] === englishName) {
        return true;
    }

    // Handle name variations
    const englishNormalized = englishName.toLowerCase().replace(/[^a-z]/g, '');
    
    // Check for partial matches for longer names
    if (englishNormalized.length > 4) {
        for (const [en, te] of Object.entries(nameMapping)) {
            if (en.toLowerCase().replace(/[^a-z]/g, '').includes(englishNormalized) ||
                englishNormalized.includes(en.toLowerCase().replace(/[^a-z]/g, ''))) {
                return te === teluguName;
            }
        }
    }

    return false;
}

// Create the bilingual genealogy data
console.log('Creating improved bilingual genealogy data...');
const bilingualData = createBilingualObject(englishData, teluguData);

// Write the merged data to a new file
const outputPath = './src/assets/data/genealogy-bilingual-improved.json';
fs.writeFileSync(outputPath, JSON.stringify(bilingualData, null, 2));

console.log(`✅ Improved bilingual genealogy data created: ${outputPath}`);
console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

// Log a sample to verify the structure
console.log('\n📋 Sample structure:');
console.log('Root person:', {
    name: bilingualData.name,
    nameEn: bilingualData.nameEn,
    nameTe: bilingualData.nameTe,
    spouseEn: bilingualData.spouseEn,
    spouseTe: bilingualData.spouseTe,
    detailEn: bilingualData.detailEn?.substring(0, 100) + '...',
    detailTe: bilingualData.detailTe?.substring(0, 100) + '...'
});
