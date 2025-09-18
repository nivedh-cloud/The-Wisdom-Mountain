const fs = require('fs');
const path = require('path');

// Usage:
// node scripts/translate-to-telugu.cjs export   -> writes scripts/translate_batch.json with items needing translation
// node scripts/translate-to-telugu.cjs apply    -> reads scripts/translate_batch.translated.json and applies translations back to book-details.json

const mode = process.argv[2] || 'export';
const dataPath = path.resolve(__dirname, '..', 'src', 'assets', 'data', 'book-details.json');
const batchPath = path.resolve(__dirname, 'translate_batch.json');
const translatedPath = path.resolve(__dirname, 'translate_batch.translated.json');

const raw = fs.readFileSync(dataPath, 'utf8');
const books = JSON.parse(raw);

if (mode === 'export') {
  const items = [];
  books.forEach((book, bi) => {
    const bookLabel = book.book || book.name || `index:${bi}`;
    // book-level name
    if (!book.bookTelugu && !book.nameTelugu) {
      items.push({ key: `${bi}`, book: bookLabel, field: 'bookTelugu', english: book.book || book.name || '' });
    }
    if (!Array.isArray(book.mainEvents)) return;
    book.mainEvents.forEach((ev, ei) => {
      ['title', 'reference', 'text'].forEach((f) => {
        const en = ev[f] || '';
        const teKey = f === 'reference' ? 'referenceTe' : `${f}Te`;
        const te = ev[teKey] || '';
        if (!te || te.trim() === en.trim()) {
          items.push({ key: `${bi}_${ei}_${f}`, book: bookLabel, bookIndex: bi, eventIndex: ei, field: teKey, english: en });
        }
      });
    });
    // mainPersons
    if (!Array.isArray(book.mainPersonsTe) || book.mainPersonsTe.length === 0) {
      items.push({ key: `${bi}_mainPersons`, book: bookLabel, bookIndex: bi, field: 'mainPersonsTe', english: (book.mainPersons || []).join(' | ') });
    }
  });

  fs.writeFileSync(batchPath, JSON.stringify(items, null, 2), 'utf8');
  console.log('Exported batch for translation to', batchPath, 'items:', items.length);
  process.exit(0);
}

if (mode === 'apply') {
  if (!fs.existsSync(translatedPath)) {
    console.error('Translated file not found:', translatedPath);
    process.exit(2);
  }
  const translated = JSON.parse(fs.readFileSync(translatedPath, 'utf8'));
  const byKey = {};
  translated.forEach(item => { byKey[item.key] = item; });

  let applied = 0;
  translated.forEach(item => {
    const key = item.key;
    if (key.includes('_')) {
      const parts = key.split('_');
      const bi = parseInt(parts[0], 10);
      const ei = parseInt(parts[1], 10);
      const f = parts[2];
      const teKey = f === 'reference' ? 'referenceTe' : `${f}Te`;
      if (books[bi] && books[bi].mainEvents && books[bi].mainEvents[ei]) {
        books[bi].mainEvents[ei][teKey] = item.telugu || item.translation || item.te || item.value || '';
        applied++;
      }
    } else if (key.endsWith('_mainPersons')) {
      const bi = parseInt(key.split('_')[0], 10);
      if (books[bi]) {
        const list = (item.telugu || item.translation || item.te || item.value || '');
        books[bi].mainPersonsTe = list.split('|').map(s => s.trim()).filter(Boolean);
        applied++;
      }
    } else {
      // book-level
      const bi = parseInt(key, 10);
      if (books[bi]) {
        books[bi].nameTelugu = item.telugu || item.translation || item.te || item.value || '';
        applied++;
      }
    }
  });

  // backup
  fs.copyFileSync(dataPath, dataPath + '.bak');
  fs.writeFileSync(dataPath, JSON.stringify(books, null, 2), 'utf8');
  console.log('Applied translations:', applied, 'and wrote backup to', dataPath + '.bak');
  process.exit(0);
}

console.error('Unknown mode. Use export or apply');
process.exit(2);
