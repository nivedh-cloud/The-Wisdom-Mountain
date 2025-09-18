const fs = require('fs');
const path = require('path');

// Book mapping from directory numbers to Telugu names
const bookMapping = {
    '01': 'ఆదికాండము',
    '02': 'నిర్గమకాండము',
    '03': 'లేవీయకాండము',
    '04': 'సంఖ్యాకాండము',
    '05': 'ద్వితీయోపదేశకాండమ',
    '06': 'యెహొషువ',
    '07': 'న్యాయాధిపతులు',
    '08': 'రూతు',
    '09': 'సమూయేలు మొదటి గ్రంథము',
    '10': 'సమూయేలు రెండవ గ్రంథము',
    '11': 'రాజులు మొదటి గ్రంథము',
    '12': 'రాజులు రెండవ గ్రంథము',
    '13': 'దినవృత్తాంతములు మొదటి గ్రంథము',
    '14': 'దినవృత్తాంతములు రెండవ గ్రంథము',
    '15': 'ఎజ్రా',
    '16': 'నెహెమ్యా',
    '17': 'ఎస్తేరు',
    '18': 'యోబు గ్రంథము',
    '19': 'కీర్తనల గ్రంథము',
    '20': 'సామెతలు',
    '21': 'ప్రసంగి',
    '22': 'పరమగీతము',
    '23': 'యెషయా గ్రంథము',
    '24': 'యిర్మీయా',
    '25': 'విలాపవాక్యములు',
    '26': 'యెహెజ్కేలు',
    '27': 'దానియేలు',
    '28': 'హొషేయ',
    '29': 'యోవేలు',
    '30': 'ఆమోసు',
    '31': 'ఓబద్యా',
    '32': 'యోనా',
    '33': 'మీకా',
    '34': 'నహూము',
    '35': 'హబక్కూకు',
    '36': 'జెఫన్యా',
    '37': 'హగ్గయి',
    '38': 'జెకర్యా',
    '39': 'మలాకీ',
    '40': 'మత్తయి సువార్త',
    '41': 'మార్కు సువార్త',
    '42': 'లూకా సువార్త',
    '43': 'యోహాను సువార్త',
    '44': 'అపొస్తలుల కార్యములు',
    '45': 'రోమీయులకు',
    '46': '1 కొరింథీయులకు',
    '47': '2 కొరింథీయులకు',
    '48': 'గలతీయులకు',
    '49': 'ఎఫెసీయులకు',
    '50': 'ఫిలిప్పీయులకు',
    '51': 'కొలొస్సయులకు',
    '52': '1 థెస్సలొనీకయులకు',
    '53': '2 థెస్సలొనీకయులకు',
    '54': '1 తిమోతికి',
    '55': '2 తిమోతికి',
    '56': 'తీతుకు',
    '57': 'ఫిలేమోనుకు',
    '58': 'హెబ్రీయులకు',
    '59': 'యాకోబు',
    '60': '1 పేతురు',
    '61': '2 పేతురు',
    '62': '1 యోహాను',
    '63': '2 యోహాను',
    '64': '3 యోహాను',
    '65': 'యూదా',
    '66': 'ప్రకటన గ్రంథము'
};

function parseChapterHTML(htmlContent) {
    const verses = {};

    // Extract verse content using regex
    // Pattern: <span class="verse" id="1">1 </span> [Telugu text] <br />
    const versePattern = /<span class="verse" id="(\d+)">\d+ <\/span>\s*([^<]+)\s*<br \/>/g;

    let match;
    while ((match = versePattern.exec(htmlContent)) !== null) {
        const verseNumber = match[1];
        let verseText = match[2].trim();

        // Clean up the text
        verseText = verseText.replace(/\s+/g, ' '); // Replace multiple spaces with single space
        verseText = verseText.replace(/^\s*-\s*/, ''); // Remove leading dash if present

        verses[verseNumber] = verseText;
    }

    return verses;
}

function processTeluguBible() {
    const basePath = path.join(__dirname, '..', 'src', 'assets', 'data', 'books', 'tel_new');
    const outputFile = path.join(__dirname, '..', 'src', 'assets', 'data', 'books', 'telugu.json');

    const bible = {};

    // Process each book directory
    for (let i = 1; i <= 66; i++) {
        const bookDir = i.toString().padStart(2, '0');
        const bookName = bookMapping[bookDir];

        if (!bookName) {
            console.log(`Warning: No mapping found for directory ${bookDir}`);
            continue;
        }

        const bookPath = path.join(basePath, bookDir);
        console.log(`Processing book: ${bookName} (${bookDir})`);

        if (!fs.existsSync(bookPath)) {
            console.log(`Warning: Directory ${bookPath} does not exist`);
            continue;
        }

        bible[bookName] = {};

        // Get all chapter files
        const chapterFiles = fs.readdirSync(bookPath)
            .filter(file => file.endsWith('.htm'))
            .sort((a, b) => {
                const numA = parseInt(a.replace('.htm', ''));
                const numB = parseInt(b.replace('.htm', ''));
                return numA - numB;
            });

        // Process each chapter
        for (const chapterFile of chapterFiles) {
            const chapterNum = chapterFile.replace('.htm', '');
            const chapterPath = path.join(bookPath, chapterFile);

            try {
                const htmlContent = fs.readFileSync(chapterPath, 'utf-8');
                const verses = parseChapterHTML(htmlContent);

                if (Object.keys(verses).length > 0) {
                    bible[bookName][chapterNum] = verses;
                }
            } catch (error) {
                console.log(`Error processing ${chapterPath}: ${error.message}`);
            }
        }

        console.log(`  Completed ${bookName}: ${Object.keys(bible[bookName]).length} chapters`);
    }

    // Write the JSON file
    fs.writeFileSync(outputFile, JSON.stringify(bible, null, 2), 'utf-8');
    console.log('\nTelugu Bible conversion completed successfully!');
    console.log(`Output file: ${outputFile}`);
}

processTeluguBible();