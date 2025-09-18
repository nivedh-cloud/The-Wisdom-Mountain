const fs = require('fs');
const path = require('path');

const inPath = path.resolve(__dirname, '..', 'src', 'assets', 'data', 'book-details.json');
const outPath = path.resolve(__dirname, 'untranslated_book_details.csv');

const raw = fs.readFileSync(inPath, 'utf8');
const data = JSON.parse(raw);

const rows = [];
rows.push(['book', 'bookKey', 'eventIndex', 'field', 'englishText', 'teluguText', 'issue'].join(','));

data.forEach((book, bi) => {
  const bookLabel = book.book || book.name || `index:${bi}`;
  const bookKey = book.book ? 'book' : (book.name ? 'name' : 'unknown');

  // book-level name missing
  if (!book.bookTelugu && !book.nameTelugu) {
    rows.push([escapeCsv(bookLabel), bookKey, '', 'bookName', book.book || book.name || '', '', 'missing_bookTelugu'].join(','));
  }

  // main events
  if (Array.isArray(book.mainEvents)) {
    book.mainEvents.forEach((ev, ei) => {
      ['title', 'reference', 'text'].forEach((f) => {
        const en = ev[f] || '';
        const teKey = f === 'reference' ? 'referenceTe' : `${f}Te`;
        const te = ev[teKey] || '';
        if (!te || te.trim() === en.trim()) {
          const issue = !te ? 'missing' : 'identical_to_english';
          rows.push([escapeCsv(bookLabel), bookKey, ei, f, escapeCsv(en), escapeCsv(te), issue].join(','));
        }
      });
    });
  } else {
    rows.push([escapeCsv(bookLabel), bookKey, '', 'mainEvents', '', '', 'missing_mainEvents'].join(','));
  }

  // mainPersonsTe
  if (!Array.isArray(book.mainPersonsTe) || book.mainPersonsTe.length === 0) {
    const enList = Array.isArray(book.mainPersons) ? book.mainPersons.join(' | ') : (book.mainPersons || '');
    rows.push([escapeCsv(bookLabel), bookKey, '', 'mainPersons', escapeCsv(enList), '', 'missing_mainPersonsTe'].join(','));
  }
});

fs.writeFileSync(outPath, rows.join('\n'), 'utf8');
console.log('Wrote CSV:', outPath);
console.log('Rows (including header):', rows.length);

function escapeCsv(s) {
  if (!s && s !== '') return '';
  const str = String(s).replace(/"/g, '""');
  if (str.indexOf(',') !== -1 || str.indexOf('\n') !== -1 || str.indexOf('"') !== -1) {
    return `"${str}"`;
  }
  return str;
}
