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
    if (!list || !list.length) {
      console.log('No tabs found');
      proc.kill();
      return;
    }
    const wsUrl = list[0].webSocketDebuggerUrl;
    console.log('Tab wsUrl:', wsUrl);
    
    // Connect WebSocket
    const ws = new WebSocket(wsUrl);
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
      // Reload page to catch boot errors
      ws.send(JSON.stringify({ id: 4, method: 'Page.reload' }));
    });
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled' || msg.method === 'Runtime.exceptionThrown') {
        console.log('PAGE ERROR:', JSON.stringify(msg, null, 2));
      }
    });
  } catch (e) {
    console.error('CDP Error:', e.message);
    proc.kill();
  }
}, 1500);

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
