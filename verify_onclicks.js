const fs = require('fs');

const idx = fs.readFileSync('Index.html', 'utf8');
const scr = fs.readFileSync('Scripts.html', 'utf8');

const regex = /onclick=["']([^"']+)["']/g;
let m;
const onClicks = new Set();
while ((m = regex.exec(idx)) !== null) {
  const fn = m[1].split('(')[0].replace('return ', '').trim();
  onClicks.add(fn);
}

console.log('All onclicks in Index.html:');
for (const fn of onClicks) {
  const defined = scr.includes(`function ${fn}`) || scr.includes(`${fn} =`) || scr.includes(`window.${fn}`);
  console.log(`  ${fn}: ${defined ? 'OK' : 'MISSING!'}`);
}
