const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// Replace corrupted symbols array
html = html.replace(/const symbols = \['[^\]]*'\];/g, "const symbols = ['+', '-', '×', '÷', '=', '%', 'ƒ(x)', 'Δ'];");

// Also let's check for any remaining `` characters in the file and replace them with something safe just in case
html = html.replace(//g, '');

fs.writeFileSync(file, html, 'utf8');
console.log('Fixed math burst and garbage chars');
