const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'assets', 'data', 'book-details.json');

const canonicalOrder = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther',
  'Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel',
  'Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'
];

function main(){
  if(!fs.existsSync(filePath)){
    console.error('file not found:', filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  let arr;
  try{ arr = JSON.parse(raw); }catch(e){ console.error('JSON parse error', e); process.exit(1); }

  // Build a map of book -> last occurrence (so the most recent entry wins)
  const map = new Map();
  for(const obj of arr){
    if(obj && obj.book) map.set(obj.book, obj);
  }

  const ordered = [];
  for(const name of canonicalOrder){
    if(map.has(name)){
      ordered.push(map.get(name));
      map.delete(name);
    }
  }

  // Append any remaining books (non-canonical or extras) in their original order from the source
  if(map.size){
    for(const obj of arr){
      if(obj && obj.book && map.has(obj.book)){
        ordered.push(obj);
        map.delete(obj.book);
      }
    }
  }

  // Backup original
  const bakPath = filePath + '.bak.' + Date.now();
  fs.copyFileSync(filePath, bakPath);
  console.log('Backup written to', bakPath);

  fs.writeFileSync(filePath, JSON.stringify(ordered, null, 2), 'utf8');
  console.log('Reordered book-details written. Total books:', ordered.length);
}

main();
