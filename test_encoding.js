const fs = require('fs');

// Read as latin1, then convert to utf8 string by buffering it
let file = 'C:/Users/User/.gemini/antigravity/brain/96e6a36a-dd0e-4271-825d-0f44ce115687/scratch/generate_public_index.js';
let content = fs.readFileSync(file, 'utf8');

let buffer = Buffer.from(content, 'latin1');
let restored = buffer.toString('utf8');

const regex = /[^\x00-\x7F]+/g;
let match;
const uniqueGarbage = new Set();
while ((match = regex.exec(restored)) !== null) {
    uniqueGarbage.add(match[0]);
}
console.log(Array.from(uniqueGarbage).slice(0, 20));

// Did it restore 'ðŸ’¼' to '💼' ?
console.log(Buffer.from('ðŸ’¼', 'latin1').toString('utf8'));
