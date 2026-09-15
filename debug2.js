const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
console.log(html.includes('function initBroadcast'));
console.log(html.includes('loadBcSettings'));
