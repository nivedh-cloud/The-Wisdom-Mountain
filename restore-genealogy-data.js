const fs = require('fs');
const path = require('path');

// Read the backup files
const englishDataPath = path.join(__dirname, 'src/assets/data/backup/genealogy-min.json');
const teluguDataPath = path.join(__dirname, 'src/assets/data/backup/genealogy_telu-min.json');
const outputPath = path.join(__dirname, 'src/assets/data/genealogy-bilingual-improved.json');

console.log('Starting bilingual genealogy data restoration...');

try {
    // Read and parse the backup files
    const englishData = JSON.parse(fs.readFileSync(englishDataPath, 'utf8'));
    const teluguData = JSON.parse(fs.readFileSync(teluguDataPath, 'utf8'));
    
    console.log('Successfully loaded backup files');
    
    // Function to merge English and Telugu data recursively
    function mergeData(englishNode, teluguNode) {
        if (!englishNode || !teluguNode) {
            return englishNode || teluguNode;
        }
        
        const merged = {
            name: englishNode.name || '',
            nameEn: englishNode.name || '',
            nameTe: teluguNode.name || '',
            ...englishNode
        };
        
        // Add Telugu translations for other fields
        if (teluguNode.spouse) {
            merged.spouseTe = teluguNode.spouse;
            if (!merged.spouseEn && englishNode.spouse) {
                merged.spouseEn = englishNode.spouse;
            }
        }
        
        if (teluguNode.detail) {
            merged.detailTe = teluguNode.detail;
            if (!merged.detailEn && englishNode.detail) {
                merged.detailEn = englishNode.detail;
            }
        }
        
        // Handle children arrays
        if (englishNode.children && Array.isArray(englishNode.children)) {
            merged.children = englishNode.children.map((englishChild, index) => {
                const teluguChild = teluguNode.children && teluguNode.children[index];
                return mergeData(englishChild, teluguChild);
            });
        } else if (englishNode._children && Array.isArray(englishNode._children)) {
            merged._children = englishNode._children.map((englishChild, index) => {
                const teluguChild = teluguNode._children && teluguNode._children[index];
                return mergeData(englishChild, teluguChild);
            });
        }
        
        return merged;
    }
    
    // Merge the data
    const mergedData = mergeData(englishData, teluguData);
    
    // Write the merged data to the output file
    fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), 'utf8');
    
    console.log('✅ Successfully restored genealogy-bilingual-improved.json');
    console.log('✅ English and Telugu names are now properly merged');
    console.log('✅ Search functionality should work correctly now');
    
    // Verify the merge by checking a few entries
    const sample = mergedData.children[2].children[0]; // Seth -> Enos
    console.log('\n📋 Sample verification:');
    console.log(`Name: ${sample.name}`);
    console.log(`English: ${sample.nameEn}`);
    console.log(`Telugu: ${sample.nameTe}`);
    
} catch (error) {
    console.error('❌ Error during restoration:', error.message);
    process.exit(1);
}
