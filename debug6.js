const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
const idx = lines.findIndex(l => l.includes('el = {'));
console.log(lines.slice(idx - 5, idx + 5).join('\n'));
