import kjvData from '../assets/data/books/kjv.json';

/**
 * Get a Bible verse by book, chapter, and verse number
 * @param {string} book - The book name (e.g., 'Genesis')
 * @param {string|number} chapter - The chapter number
 * @param {string|number} verse - The verse number
 * @returns {string|null} The verse text or null if not found
 */
export function getVerse(book, chapter, verse) {
    try {
        const chapterStr = chapter.toString();
        const verseStr = verse.toString();

        if (kjvData[book] && kjvData[book][chapterStr] && kjvData[book][chapterStr][verseStr]) {
            return kjvData[book][chapterStr][verseStr];
        }
        return null;
    } catch (error) {
        console.error('Error fetching verse:', error);
        return null;
    }
}

/**
 * Get all verses in a chapter
 * @param {string} book - The book name
 * @param {string|number} chapter - The chapter number
 * @returns {object|null} Object with verse numbers as keys and text as values, or null if not found
 */
export function getChapter(book, chapter) {
    try {
        const chapterStr = chapter.toString();
        if (kjvData[book] && kjvData[book][chapterStr]) {
            return kjvData[book][chapterStr];
        }
        return null;
    } catch (error) {
        console.error('Error fetching chapter:', error);
        return null;
    }
}

/**
 * Get all chapters in a book
 * @param {string} book - The book name
 * @returns {object|null} Object with chapter numbers as keys, or null if not found
 */
export function getBook(book) {
    try {
        if (kjvData[book]) {
            return kjvData[book];
        }
        return null;
    } catch (error) {
        console.error('Error fetching book:', error);
        return null;
    }
}

/**
 * Search for verses containing specific text
 * @param {string} searchText - The text to search for
 * @param {string} [book] - Optional book to limit search
 * @returns {Array} Array of objects with book, chapter, verse, and text
 */
export function searchVerses(searchText, book = null) {
    const results = [];
    const searchLower = searchText.toLowerCase();

    try {
        const booksToSearch = book ? [book] : Object.keys(kjvData);

        booksToSearch.forEach(bookName => {
            if (!kjvData[bookName]) return;

            Object.keys(kjvData[bookName]).forEach(chapterNum => {
                Object.keys(kjvData[bookName][chapterNum]).forEach(verseNum => {
                    const text = kjvData[bookName][chapterNum][verseNum];
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
        console.error('Error searching verses:', error);
        return [];
    }
}