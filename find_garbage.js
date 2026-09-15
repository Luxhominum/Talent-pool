const fs = require('fs');
let file = 'C:/Users/User/.gemini/antigravity/brain/96e6a36a-dd0e-4271-825d-0f44ce115687/scratch/generate_public_index.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /[^\x00-\x7F]+/g;
let match;
const uniqueGarbage = new Set();
while ((match = regex.exec(content)) !== null) {
    uniqueGarbage.add(match[0]);
}
console.log(Array.from(uniqueGarbage));
