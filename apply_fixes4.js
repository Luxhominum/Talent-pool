const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// Remove border-radius, background, shadow, and overflow from inner
html = html.replace(
  /border-radius: 50%;[\s\S]*?overflow: hidden;[\s\S]*?background: #FFFFFF;[\s\S]*?box-shadow: inset 0 2px 6px rgba\(0, 0, 0, 0\.18\);/,
  '/* No circle background */'
);

// Remove the glare div too
html = html.replace(/<div class="psyduck-3d-glare"><\/div>/g, '');

fs.writeFileSync(file, html, 'utf8');
console.log('Removed circle styles.');
