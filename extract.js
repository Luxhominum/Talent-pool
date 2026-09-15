const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const startIdx = html.indexOf('<div id="broadcastContainer"');
const endIdx = html.indexOf('<div id="emptyState"');
if (startIdx >= 0 && endIdx >= 0) {
  fs.writeFileSync('temp_bc.html', html.substring(startIdx, endIdx), 'utf8');
  console.log('Extracted successfully.');
} else {
  console.log('Failed to extract.');
}
