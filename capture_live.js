const { exec } = require('child_process');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const url = 'https://script.google.com/macros/s/AKfycbzIC-mHyF6VqxWBl-ljZCSAB5RYeo6rex8wo841rheeODdibPgMxyFci1InN9BtGLH5Vg/exec';
const screenshotPath = path.resolve('live_screenshot.png');

const cmd = `"${edgePath}" --headless --disable-gpu --screenshot="${screenshotPath}" --window-size=1280,800 --virtual-time-budget=6000 "${url}"`;

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error('Error taking screenshot:', err.message);
  } else {
    console.log('Screenshot saved to:', screenshotPath);
  }
});
