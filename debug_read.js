const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const idx = html.indexOf('function initBroadcast');
console.log(html.substring(idx, idx + 1000));
