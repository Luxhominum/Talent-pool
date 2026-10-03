const fs = require('fs');
const vm = require('vm');

function checkHtmlScripts(filename) {
  console.log(`Checking ${filename}...`);
  const content = fs.readFileSync(filename, 'utf-8');
  
  // Regex to extract inline scripts
  const scriptRegex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  
  while ((match = scriptRegex.exec(content)) !== null) {
    count++;
    const code = match[1];
    try {
      new vm.Script(code, { filename: `${filename}-inline-${count}.js` });
      console.log(`  [OK] Script tag #${count} parsed successfully (${code.length} chars).`);
    } catch (err) {
      console.error(`  [ERROR] Script tag #${count} syntax error:`, err.message);
      // Print line context if available
      if (err.stack) {
        console.error(err.stack.split('\n').slice(0, 5).join('\n'));
      }
      process.exit(1);
    }
  }
  console.log(`All ${count} inline scripts in ${filename} are syntactically valid!\n`);
}

checkHtmlScripts('public/assessment.html');
checkHtmlScripts('public/assessment-portal.html');
