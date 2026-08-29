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
  'about:blank'
]);

setTimeout(async () => {
  try {
    const list = await getJSON(`http://127.0.0.1:${port}/json/list`);
    const wsUrl = list[0].webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);
    
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
      // Navigate to fileUrl
      ws.send(JSON.stringify({ id: 3, method: 'Page.navigate', params: { url: fileUrl } }));
    });

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        console.log('EXCEPTION THROWN:', JSON.stringify(msg.params, null, 2));
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('CONSOLE:', msg.params.type, msg.params.args.map(a => a.value || a.description));
      }
      if (msg.method === 'Page.loadEventFired') {
        console.log('Page loaded!');
        ws.send(JSON.stringify({
          id: 10,
          method: 'Runtime.evaluate',
          params: { expression: 'typeof bootApp' }
        }));
      }
      if (msg.id === 10) {
        console.log('typeof bootApp:', JSON.stringify(msg.result));
        proc.kill();
        process.exit(0);
      }
    });

    setTimeout(() => {
      proc.kill();
      process.exit(0);
    }, 4000);
  } catch (e) {
    console.error('Error:', e);
    proc.kill();
  }
}, 1000);

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
