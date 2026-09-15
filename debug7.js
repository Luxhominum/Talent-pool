const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
const idx = lines.findIndex(l => l.includes('el.bcDateInput ='));
const idx2 = lines.findIndex(l => l.includes('bcDateInput: document.getElementById'));
if (idx > -1) console.log(lines.slice(idx - 5, idx + 5).join('\n'));
if (idx2 > -1) console.log(lines.slice(idx2 - 5, idx2 + 5).join('\n'));
