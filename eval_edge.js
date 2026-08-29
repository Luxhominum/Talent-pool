const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fileUrl = 'file:///' + path.resolve('preview.html').replace(/\\/g, '/');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9222;

const proc = spawn(edgePath, [
  '--headless',
  `--remote-debugging-port=${port}`,
  '--disable-gpu',
  fileUrl
]);

setTimeout(async () => {
  try {
    const list = await getJSON(`http://127.0.0.1:${port}/json/list`);
    const wsUrl = list[0].webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);
    
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({
        id: 2,
        method: 'Runtime.evaluate',
        params: { expression: 'document.querySelector("script") ? document.querySelector("script").textContent.slice(0, 100) : "no script"', returnByValue: true }
      }));
      ws.send(JSON.stringify({
        id: 3,
        method: 'Runtime.evaluate',
        params: { expression: 'typeof bootApp', returnByValue: true }
      }));
      ws.send(JSON.stringify({
        id: 4,
        method: 'Runtime.evaluate',
        params: { expression: 'typeof window.openAddCandidateDrawer', returnByValue: true }
      }));
      ws.send(JSON.stringify({
        id: 5,
        method: 'Runtime.evaluate',
        params: { expression: 'window.errors || []', returnByValue: true }
      }));
    });

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id >= 2 && msg.id <= 5) {
        console.log(`ID ${msg.id} result:`, JSON.stringify(msg.result));
      }
    });

    setTimeout(() => {
      proc.kill();
      process.exit(0);
    }, 2000);
  } catch (e) {
    console.error('Error:', e);
    proc.kill();
  }
}, 1200);

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}
