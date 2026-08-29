const { exec } = require('child_process');
const path = require('path');
const fileUrl = 'file:///' + path.resolve('preview.html').replace(/\\/g, '/');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `"${edgePath}" --headless --dump-dom --virtual-time-budget=4000 "${fileUrl}"`;

exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  const bento = stdout.match(/<div class="talent-grid"[\s\S]*?<\/div>\s*<\/section>/);
  if (bento) {
    console.log('BENTO HTML:');
    console.log(bento[0].slice(0, 1000));
  } else {
    console.log('No bento found');
    const emptyState = stdout.match(/<div class="empty-state"[\s\S]*?<\/div>/);
    if (emptyState) console.log('EMPTY STATE FOUND:', emptyState[0]);
  }
});
