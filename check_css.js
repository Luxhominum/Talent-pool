const fs = require('fs');
const css = fs.readFileSync('test.css', 'utf8');
let depth = 0;
for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}') {
        depth--;
        if (depth < 0) {
            console.log('Unmatched } at index ' + i);
            process.exit(1);
        }
    }
}
console.log('Final depth: ' + depth);
if (depth !== 0) console.log('Missing }');
