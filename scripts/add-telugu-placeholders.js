const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'src', 'assets', 'data', 'book-details.json');
const backupPath = filePath + '.bak';

function load() {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function save(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function makeTeluguReference(reference, teluguBookName, englishBook) {
  if (!reference) return reference;
  if (!teluguBookName) return reference;
  // Replace English book name (first word(s) before space+chapter) with Telugu book name
  // naive approach: find digits and take the part before them
  const match = reference.match(/^(.*?)(\s+\d)/);
  if (match) {
    return reference.replace(match[1], teluguBookName);
  }
  return `${teluguBookName} ${reference}`;
}

function process() {
  const data = load();
  // create a map of english book -> telugu name from entries that have it
  const teluguMap = {};
  data.forEach(b => {
    if (b.book && b.nameTelugu) teluguMap[b.book.toLowerCase()] = b.nameTelugu;
  });

  let eventsAdded = 0;
  let personsAdded = 0;

  data.forEach(book => {
    const bookKey = book.book && book.book.toLowerCase();
    const teluguName = teluguMap[bookKey] || book.nameTelugu || null;

    if (Array.isArray(book.mainEvents)) {
      book.mainEvents.forEach(ev => {
        if (!ev.titleTe) { ev.titleTe = ev.title || ''; eventsAdded++; }
        if (!ev.referenceTe) { ev.referenceTe = makeTeluguReference(ev.reference || '', teluguName, book.book); eventsAdded++; }
        if (!ev.textTe) { ev.textTe = ev.text || ''; eventsAdded++; }
      });
    }

    if (Array.isArray(book.mainPersons)) {
      if (!book.mainPersonsTe) {
        book.mainPersonsTe = book.mainPersons.slice();
        personsAdded += book.mainPersons.length;
      }
    }
  });

  // backup then save
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }
  save(data);
  console.log(`Done. events fields added ~${eventsAdded}, mainPersonsTe entries added ~${personsAdded}`);
}

process();
