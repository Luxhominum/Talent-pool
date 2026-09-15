const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

if (!html.includes('@keyframes chickenRunAcross')) {
    html = html.replace(
      /\.psyduck-widget-container \{[\s\S]*?\}/,
      (match) => match + '\n    @keyframes chickenRunAcross {\n      0% { transform: translateX(-350px); }\n      100% { transform: translateX(110vw); }\n    }'
    );
}

fs.writeFileSync(file, html, 'utf8');
console.log('Keyframes added.');
