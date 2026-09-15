const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (cssMatch) {
    fs.writeFileSync('test.css', cssMatch[1], 'utf8');
}
