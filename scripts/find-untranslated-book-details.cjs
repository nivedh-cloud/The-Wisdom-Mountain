const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'src', 'assets', 'data', 'book-details.json');
const raw = fs.readFileSync(filePath, 'utf8');
let data = JSON.parse(raw);

const results = [];

data.forEach((book) => {
  const bookLabel = book.book || book.name || 'UNKNOWN';
  if (Array.isArray(book.mainEvents)) {
    book.mainEvents.forEach((ev, idx) => {
      const issues = [];
      if ('titleTe' in ev && ev.titleTe && ev.titleTe.trim() === (ev.title || '').trim()) issues.push('titleTe_same_as_title');
      if ('referenceTe' in ev && ev.referenceTe && ev.referenceTe.trim() === (ev.reference || '').trim()) issues.push('referenceTe_same_as_reference');
      if ('textTe' in ev && ev.textTe && ev.textTe.trim() === (ev.text || '').trim()) issues.push('textTe_same_as_text');
      if (issues.length > 0) {
        results.push({ book: bookLabel, index: idx, issues, title: ev.title });
      }
    });
  }
});

console.log('Untranslated detection report');
console.log('Total matches:', results.length);
console.log(results.slice(0, 40));
process.exit(0);
