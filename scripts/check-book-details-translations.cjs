const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'src', 'assets', 'data', 'book-details.json');
const raw = fs.readFileSync(filePath, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('Failed to parse JSON:', e.message);
  process.exit(2);
}

const missingBookTelugu = [];
const missingMainEvents = [];
const missingMainPersonsTe = [];

data.forEach((book, bi) => {
  const titleKey = book.book ? 'book' : (book.name ? 'name' : 'unknown');
  const bookLabel = book.book || book.name || `index:${bi}`;

  // Check book-level telugu name: allow either bookTelugu or nameTelugu
  const hasBookTelugu = Boolean(book.bookTelugu || book.nameTelugu || book.nameTelugu === '' === false && book.bookTelugu === '');
  if (!book.bookTelugu && !book.nameTelugu) {
    missingBookTelugu.push(bookLabel);
  }

  // Check mainEvents
  if (Array.isArray(book.mainEvents)) {
    book.mainEvents.forEach((ev, ei) => {
      const missing = [];
      if (!('titleTe' in ev) || !ev.titleTe) missing.push('titleTe');
      if (!('referenceTe' in ev) || !ev.referenceTe) missing.push('referenceTe');
      if (!('textTe' in ev) || !ev.textTe) missing.push('textTe');
      if (missing.length) {
        missingMainEvents.push({ book: bookLabel, index: ei, missing });
      }
    });
  } else {
    missingMainEvents.push({ book: bookLabel, index: -1, missing: ['mainEvents_missing'] });
  }

  // Check mainPersonsTe
  if (!Array.isArray(book.mainPersonsTe) || book.mainPersonsTe.length === 0) {
    missingMainPersonsTe.push(bookLabel);
  }
});

console.log('Scan results for book-details.json');
console.log('Total books scanned:', data.length);
console.log('Books missing `bookTelugu`/`nameTelugu`:', missingBookTelugu.length);
if (missingBookTelugu.length > 0) console.log('Examples:', missingBookTelugu.slice(0, 10));
console.log('Main events entries missing Telugu fields (count):', missingMainEvents.length);
if (missingMainEvents.length > 0) console.log('Examples:', missingMainEvents.slice(0, 10));
console.log('Books missing `mainPersonsTe` or empty:', missingMainPersonsTe.length);
if (missingMainPersonsTe.length > 0) console.log('Examples:', missingMainPersonsTe.slice(0, 10));

// Exit code 0
process.exit(0);
