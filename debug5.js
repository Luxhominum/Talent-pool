const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
const idx = lines.findIndex(l => l.includes('btnDeleteDrawer: document.getElementById'));
console.log(lines.slice(idx - 150, idx - 130).join('\n'));
