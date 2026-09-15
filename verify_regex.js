const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

// Match the main script tag content
const match = html.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/i);
if (!match) {
  console.log('No inline script found!');
  process.exit(1);
}

const jsCode = match[1];

// 1. Test compilation with new Function
try {
  new Function(jsCode);
  console.log('? JavaScript AST & Syntax is completely valid and compiles without any SyntaxError!');
} catch (err) {
  console.error('? SyntaxError found in public/index.html:', err.message);
}

// 2. Scan all regex literals in the codebase
const regexMatches = jsCode.match(/\/[^\/\n\r]+\/[gimsuy]*/g);
console.log('Found ' + (regexMatches ? regexMatches.length : 0) + ' regex patterns. Testing each one:');
if (regexMatches) {
  let issues = 0;
  regexMatches.forEach((rgxStr, idx) => {
    try {
      eval(rgxStr);
    } catch (e) {
      console.error('  ? Invalid regex at #' + idx + ': ' + rgxStr + ' -> ' + e.message);
      issues++;
    }
  });
  if (issues === 0) {
    console.log('? All regex literals are 100% valid!');
  }
}

// 3. Search for any weird patterns like ///, //g, empty regexes, or double escapes
const lines = jsCode.split('\n');
lines.forEach((line, lineNum) => {
  if (line.includes('///') || line.includes('\\\\\\') || line.includes('/[/') || line.includes('/]/')) {
    console.log('Line ' + (lineNum + 1) + ' suspicious pattern: ' + line.trim());
  }
});
