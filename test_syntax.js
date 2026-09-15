const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

// Extract all <script> tags
const scripts = html.match(/<script[\s\S]*?<\/script>/gi);
console.log('Found scripts:', scripts ? scripts.length : 0);

if (scripts) {
  scripts.forEach((s, idx) => {
    if (!s.includes('src=')) {
      const code = s.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
      try {
        new Function(code);
        console.log('Script block ' + idx + ' is valid JavaScript syntax!');
      } catch (err) {
        console.error('Syntax error in script block ' + idx + ':', err.message);
      }
    }
  });
}
