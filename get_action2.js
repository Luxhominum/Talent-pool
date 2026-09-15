const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const start = html.indexOf('<td style="text-align: right;">');
const end = html.indexOf('</tr>', start);
console.log(html.substring(start, end));
