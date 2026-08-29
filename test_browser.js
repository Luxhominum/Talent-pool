const { exec } = require('child_process');
const path = require('path');
const fileUrl = 'file:///' + path.resolve('preview.html').replace(/\\/g, '/');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `"${edgePath}" --headless --dump-dom --virtual-time-budget=3000 "${fileUrl}"`;

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  const mTotal = stdout.match(/id="metricTotal"[^>]*>([^<]+)</);
  console.log('metricTotal in DOM:', mTotal ? mTotal[1] : 'not found');
  
  const sync = stdout.match(/id="syncStatus"[^>]*>([^<]+)</);
  console.log('syncStatus in DOM:', sync ? sync[1] : 'not found');
  
  const bento = stdout.match(/id="bentoContainer"[\s\S]*?class="talent-card"/g);
  console.log('Talent cards found:', bento ? bento.length : 0);
});
