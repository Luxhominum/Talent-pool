const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace(
  /<div class="psyduck-mood-badge" id="psyduckMoodBadge">\s*<span>\?\?<\/span> <span id="psyduckMoodText">Psyduck Assistant<\/span>\s*<\/div>/,
  `<div class="psyduck-mood-badge" id="psyduckMoodBadge">\n          <span>??</span> <span id="psyduckMoodText">Psyduck Assistant</span>\n        </div>\n        <button type="button" class="btn btn-secondary btn-sm" id="btnToggleChickenRun" onclick="toggleChickenRunning()" style="padding: 2px 6px; font-size: 10px; background: transparent; border: 1px solid var(--border-light); color: var(--text-secondary); margin-left: auto; margin-right: 8px;">⏸️ Pause</button>`
);

html = html.replace(
  /<div class="psyduck-bubble-header">/,
  '<div class="psyduck-bubble-header" style="display: flex; align-items: center;">'
);

fs.writeFileSync('public/index.html', html, 'utf8');
