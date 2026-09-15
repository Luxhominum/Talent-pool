const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
const idx = lines.findIndex(l => l.includes('if (el.bcDateInput && !el.bcDateInput.value) {'));
console.log(lines.slice(idx - 15, idx + 15).join('\n'));
