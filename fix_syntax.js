const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace(/async\s*let currentRescheduleId = null;/, 'let currentRescheduleId = null;');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed syntax error.');
