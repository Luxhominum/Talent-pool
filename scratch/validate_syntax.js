const fs = require('fs');

const indexHtml = fs.readFileSync('public/index.html', 'utf8');
const portalHtml = fs.readFileSync('public/assessment-portal.html', 'utf8');

function extractScripts(html) {
  const regex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let scripts = [];
  while ((match = regex.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  return scripts;
}

try {
  const indexScripts = extractScripts(indexHtml);
  indexScripts.forEach((s, idx) => {
    new Function(s);
  });
  console.log('✅ index.html inline scripts validated with 0 syntax errors!');

  const portalScripts = extractScripts(portalHtml);
  portalScripts.forEach((s, idx) => {
    new Function(s);
  });
  console.log('✅ assessment-portal.html inline scripts validated with 0 syntax errors!');
} catch (err) {
  console.error('❌ Syntax error detected:', err);
  process.exit(1);
}
