const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'src', 'assets', 'data', 'books', 'kjv.txt');
const outputFile = path.join(__dirname, '..', 'src', 'assets', 'data', 'books', 'kjv.json');

function parseKJV() {
    const content = fs.readFileSync(inputFile, 'utf-8');
    const lines = content.split('\n').slice(2); // Skip first two lines (KJV header)

    const bible = {};

    lines.forEach(line => {
        if (!line.trim()) return;

        const parts = line.split('\t');
        if (parts.length < 2) return;

        const reference = parts[0];
        const text = parts[1].trim();

        // Parse reference like "Genesis 1:1"
        const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
        if (!match) return;

        const [, book, chapter, verse] = match;

        if (!bible[book]) {
            bible[book] = {};
        }
        if (!bible[book][chapter]) {
            bible[book][chapter] = {};
        }
        bible[book][chapter][verse] = text;
    });

    return bible;
}

const bibleData = parseKJV();
fs.writeFileSync(outputFile, JSON.stringify(bibleData, null, 2));

console.log('KJV converted to JSON successfully!');