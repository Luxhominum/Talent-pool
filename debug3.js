const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
const broadcastLines = lines.filter(l => l.includes('bcDateInput') || l.includes('bcLocationInput'));
console.log(broadcastLines.slice(0, 5).join('\n'));
