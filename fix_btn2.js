const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace(
  /<button type="button" class="psyduck-bubble-close" onclick="closePsyduckBubble\(\)" title="Tutup">/,
  `<button type="button" class="btn btn-secondary btn-sm" id="btnToggleChickenRun" onclick="toggleChickenRunning()" style="padding: 2px 6px; font-size: 10px; background: transparent; border: 1px solid var(--border-light); color: var(--text-secondary); margin-left: auto; margin-right: 8px;">⏸️ Pause</button>\n        <button type="button" class="psyduck-bubble-close" onclick="closePsyduckBubble()" title="Tutup">`
);

fs.writeFileSync('public/index.html', html, 'utf8');
