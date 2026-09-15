const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace(
  /el\.syncStatus\.textContent = 'Appwrite Error';/,
  `el.syncStatus.textContent = 'Appwrite Error: ' + (err.message || 'Unknown');`
);

fs.writeFileSync('public/index.html', html, 'utf8');
