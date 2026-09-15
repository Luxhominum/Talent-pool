const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
const start = lines.findIndex(l => l.includes('function renderBroadcastTable() {'));
const end = lines.findIndex((l, i) => i > start && l.includes('function updateBroadcastPreview() {'));
console.log(lines.slice(start, end).join('\n'));
