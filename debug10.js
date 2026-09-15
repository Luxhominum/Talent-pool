const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
const start = lines.findIndex(l => l.includes('const assignedTime = state.smartScheduleMap[talent.id] ||'));
const end = start + 30;
console.log(lines.slice(start, end).join('\n'));
