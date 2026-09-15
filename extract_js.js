const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
if (scripts) {
  scripts.forEach((s, i) => {
    const code = s.replace('<script>', '').replace('<\/script>', '');
    fs.writeFileSync('script_' + i + '.js', code);
  });
}
