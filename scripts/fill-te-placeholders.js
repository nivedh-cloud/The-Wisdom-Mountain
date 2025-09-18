const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'assets', 'data', 'book-details.json');

const teluguBookNames = {
  Genesis: 'ఆదికాండము',
  Exodus: 'నిర్గమవాక్యములు',
  Leviticus: 'లేవీయకాండము',
  Numbers: 'సంఖ్యాకాండము',
  Deuteronomy: 'ద్వితీయోపదేశకాండము',
  Joshua: 'యెహోషువ',
  Judges: 'న్యాయాధిపతులు',
  Ruth: 'రూతు',
  '1 Samuel': '1 సమూయేలు',
  '2 Samuel': '2 సమూయేలు',
  '1 Kings': '1 రాజులు',
  '2 Kings': '2 రాజులు',
  '1 Chronicles': '1 దినవృత్తాంతములు',
  '2 Chronicles': '2 దినవృత్తాంతములు',
  Ezra: 'ఎజ్రా',
  Nehemiah: 'నెహెమ్యా',
  Esther: 'ఎస్తేరు',
  Job: 'యోబు',
  Psalms: 'కీర్తనలు',
  Proverbs: 'సామెతలు',
  Ecclesiastes: 'ప్రకటన',
  'Song of Songs': 'పాటల పాటలు',
  Isaiah: 'యెషయా',
  Jeremiah: 'యిర్మీయా',
  Lamentations: 'విలాపవాక్యములు',
  Ezekiel: 'యెహెజ్కేలు',
  Daniel: 'దానియేలు',
  Hosea: 'హోషేయ',
  Joel: 'యోవేలు',
  Amos: 'ఆమోసు',
  Obadiah: 'ఓబద్యా',
  Jonah: 'యోనా',
  Micah: 'మీకా',
  Nahum: 'నహూము',
  Habakkuk: 'హబక్కూకు',
  Zephaniah: 'జెఫన్యా',
  Haggai: 'హగ్గయి',
  Zechariah: 'జెకర్యా',
  Malachi: 'మలాకీ'
};

function fillPlaceholders() {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  data.forEach(book => {
    // ensure bookTelugu exists
    if (!book.bookTelugu && book.nameTelugu) book.bookTelugu = book.nameTelugu;
    if (!book.bookTelugu && teluguBookNames[book.book]) book.bookTelugu = teluguBookNames[book.book];

    // mainPersonsTe
    if (book.mainPersons && !book.mainPersonsTe) {
      book.mainPersonsTe = book.mainPersons.slice();
    }

    if (Array.isArray(book.mainEvents)) {
      book.mainEvents.forEach(event => {
        if (!event.titleTe) event.titleTe = event.title || '';
        if (!event.referenceTe) {
          const bookName = teluguBookNames[book.book] || book.book;
          event.referenceTe = event.reference ? event.reference.toString().replace(book.book, bookName) : '';
        }
        if (!event.textTe) event.textTe = event.text || '';
      });
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Filled placeholders for Telugu fields in', filePath);
}

fillPlaceholders();
