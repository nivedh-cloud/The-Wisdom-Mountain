import teluguData from '../assets/data/books/telugu.json';

/**
 * Get a Telugu Bible verse by book, chapter, and verse number
 * @param {string} book - The book name in Telugu (e.g., 'ఆదికాండము')
 * @param {string|number} chapter - The chapter number
 * @param {string|number} verse - The verse number
 * @returns {string|null} The verse text in Telugu or null if not found
 */
export function getTeluguVerse(book, chapter, verse) {
    try {
        const chapterStr = chapter.toString();
        const verseStr = verse.toString();

        if (teluguData[book] && teluguData[book][chapterStr] && teluguData[book][chapterStr][verseStr]) {
            return teluguData[book][chapterStr][verseStr];
        }
        return null;
    } catch (error) {
        console.error('Error fetching Telugu verse:', error);
        return null;
    }
}

/**
 * Get all verses in a Telugu Bible chapter
 * @param {string} book - The book name in Telugu
 * @param {string|number} chapter - The chapter number
 * @returns {object|null} Object with verse numbers as keys and Telugu text as values, or null if not found
 */
export function getTeluguChapter(book, chapter) {
    try {
        const chapterStr = chapter.toString();
        if (teluguData[book] && teluguData[book][chapterStr]) {
            return teluguData[book][chapterStr];
        }
        return null;
    } catch (error) {
        console.error('Error fetching Telugu chapter:', error);
        return null;
    }
}

/**
 * Get all chapters in a Telugu Bible book
 * @param {string} book - The book name in Telugu
 * @returns {object|null} Object with chapter numbers as keys, or null if not found
 */
export function getTeluguBook(book) {
    try {
        if (teluguData[book]) {
            return teluguData[book];
        }
        return null;
    } catch (error) {
        console.error('Error fetching Telugu book:', error);
        return null;
    }
}

/**
 * Search for Telugu Bible verses containing specific text
 * @param {string} searchText - The text to search for (in Telugu)
 * @param {string} [book] - Optional book to limit search
 * @returns {Array} Array of objects with book, chapter, verse, and Telugu text
 */
export function searchTeluguVerses(searchText, book = null) {
    const results = [];
    const searchLower = searchText.toLowerCase();

    try {
        const booksToSearch = book ? [book] : Object.keys(teluguData);

        booksToSearch.forEach(bookName => {
            if (!teluguData[bookName]) return;

            Object.keys(teluguData[bookName]).forEach(chapterNum => {
                Object.keys(teluguData[bookName][chapterNum]).forEach(verseNum => {
                    const text = teluguData[bookName][chapterNum][verseNum];
                    if (text.toLowerCase().includes(searchLower)) {
                        results.push({
                            book: bookName,
                            chapter: chapterNum,
                            verse: verseNum,
                            text: text
                        });
                    }
                });
            });
        });

        return results;
    } catch (error) {
        console.error('Error searching Telugu verses:', error);
        return [];
    }
}

/**
 * Get the list of all Telugu Bible book names
 * @returns {Array} Array of Telugu book names
 */
export function getTeluguBookList() {
    return Object.keys(teluguData);
}

/**
 * Get book name mapping (English to Telugu)
 * @returns {object} Object mapping English book names to Telugu
 */
export function getBookNameMapping() {
    return {
        'Genesis': 'ఆదికాండము',
        'Exodus': 'నిర్గమకాండము',
        'Leviticus': 'లేవీయకాండము',
        'Numbers': 'సంఖ్యాకాండము',
        'Deuteronomy': 'ద్వితీయోపదేశకాండమ',
        'Joshua': 'యెహొషువ',
        'Judges': 'న్యాయాధిపతులు',
        'Ruth': 'రూతు',
        '1 Samuel': 'సమూయేలు మొదటి గ్రంథము',
        '2 Samuel': 'సమూయేలు రెండవ గ్రంథము',
        '1 Kings': 'రాజులు మొదటి గ్రంథము',
        '2 Kings': 'రాజులు రెండవ గ్రంథము',
        '1 Chronicles': 'దినవృత్తాంతములు మొదటి గ్రంథము',
        '2 Chronicles': 'దినవృత్తాంతములు రెండవ గ్రంథము',
        'Ezra': 'ఎజ్రా',
        'Nehemiah': 'నెహెమ్యా',
        'Esther': 'ఎస్తేరు',
        'Job': 'యోబు గ్రంథము',
        'Psalms': 'కీర్తనల గ్రంథము',
        'Proverbs': 'సామెతలు',
        'Ecclesiastes': 'ప్రసంగి',
        'Song of Songs': 'పరమగీతము',
        'Isaiah': 'యెషయా గ్రంథము',
        'Jeremiah': 'యిర్మీయా',
        'Lamentations': 'విలాపవాక్యములు',
        'Ezekiel': 'యెహెజ్కేలు',
        'Daniel': 'దానియేలు',
        'Hosea': 'హొషేయ',
        'Joel': 'యోవేలు',
        'Amos': 'ఆమోసు',
        'Obadiah': 'ఓబద్యా',
        'Jonah': 'యోనా',
        'Micah': 'మీకా',
        'Nahum': 'నహూము',
        'Habakkuk': 'హబక్కూకు',
        'Zephaniah': 'జెఫన్యా',
        'Haggai': 'హగ్గయి',
        'Zechariah': 'జెకర్యా',
        'Malachi': 'మలాకీ',
        'Matthew': 'మత్తయి సువార్త',
        'Mark': 'మార్కు సువార్త',
        'Luke': 'లూకా సువార్త',
        'John': 'యోహాను సువార్త',
        'Acts': 'అపొస్తలుల కార్యములు',
        'Romans': 'రోమీయులకు',
        '1 Corinthians': '1 కొరింథీయులకు',
        '2 Corinthians': '2 కొరింథీయులకు',
        'Galatians': 'గలతీయులకు',
        'Ephesians': 'ఎఫెసీయులకు',
        'Philippians': 'ఫిలిప్పీయులకు',
        'Colossians': 'కొలొస్సయులకు',
        '1 Thessalonians': '1 థెస్సలొనీకయులకు',
        '2 Thessalonians': '2 థెస్సలొనీకయులకు',
        '1 Timothy': '1 తిమోతికి',
        '2 Timothy': '2 తిమోతికి',
        'Titus': 'తీతుకు',
        'Philemon': 'ఫిలేమోనుకు',
        'Hebrews': 'హెబ్రీయులకు',
        'James': 'యాకోబు',
        '1 Peter': '1 పేతురు',
        '2 Peter': '2 పేతురు',
        '1 John': '1 యోహాను',
        '2 John': '2 యోహాను',
        '3 John': '3 యోహాను',
        'Jude': 'యూదా',
        'Revelation': 'ప్రకటన గ్రంథము'
    };
}