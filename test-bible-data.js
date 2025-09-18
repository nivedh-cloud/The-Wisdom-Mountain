// Test script to verify Bible data loading
import { getChapter, getBook } from './src/utils/bibleUtils.js';
import { getTeluguChapter, getTeluguBook, getBookNameMapping } from './src/utils/teluguBibleUtils.js';

console.log('Testing Bible data loading...');

// Test English data
console.log('English Genesis Chapter 1:', getChapter('Genesis', '1'));
console.log('English Genesis Book:', Object.keys(getBook('Genesis') || {}).length, 'chapters');

// Test Telugu data
const mapping = getBookNameMapping();
console.log('Book mapping:', mapping['Genesis']);
console.log('Telugu Genesis Chapter 1:', getTeluguChapter(mapping['Genesis'], '1'));
console.log('Telugu Genesis Book:', Object.keys(getTeluguBook(mapping['Genesis']) || {}).length, 'chapters');