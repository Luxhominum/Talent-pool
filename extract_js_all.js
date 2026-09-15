const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const matches = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
matches.forEach((m, i) => { fs.writeFileSync('test_runtime_' + i + '.js', m[1], 'utf8'); });
console.log('Found ' + matches.length + ' scripts');
