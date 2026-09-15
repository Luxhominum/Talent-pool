const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// 1. Adjust speed
html = html.replace(
  /const speed = state === 'CHASING' \? 0\.05 : 0\.015;/,
  "const speed = state === 'CHASING' ? 0.02 : 0.008;"
);

// 2. Adjust bubble toggle logic
html = html.replace(
  /if \(bubble\.classList\.contains\('open'\)\) \{\s*renderPsyduckBubbleContent\(\);\s*\}/,
  "if (bubble.classList.contains('open')) {\n        bubble.classList.remove('open');\n      }"
);

fs.writeFileSync(file, html, 'utf8');
console.log('Speed and toggle fixed.');
