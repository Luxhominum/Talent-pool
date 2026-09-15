const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
const idx2 = lines.findIndex(l => l.includes('bcDateInput: document.getElementById'));
for (let i = idx2; i >= 0; i--) {
  if (lines[i].includes('function ')) {
    console.log(lines.slice(i, i + 5).join('\n'));
    break;
  }
}
