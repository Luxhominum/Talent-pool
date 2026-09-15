const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const start = html.indexOf('const resolvedMsg = resolveCandidateMessage(talent, assignedTime);');
const end = html.indexOf('}).join(\'\');', start);
console.log(html.substring(start, end));
