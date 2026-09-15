const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Normalize to LF temporarily for replacement, or replace with regex that matches \r?\n
// 1. cacheDOMElements: add bcIntervalInput and buttons
html = html.replace(
  /bcLocationInput:\s*document\.getElementById\('bcLocationInput'\),/,
  `bcLocationInput: document.getElementById('bcLocationInput'),\n        bcIntervalInput: document.getElementById('bcIntervalInput'),\n        btnSaveScheduleSettings: document.getElementById('btnSaveScheduleSettings'),\n        btnSaveTemplateSettings: document.getElementById('btnSaveTemplateSettings'),`
);

// 2. initDefaultBroadcastTemplate guard
html = html.replace(
  /function initDefaultBroadcastTemplate\(\)\s*\{[\s\S]*?if\s*\(el\.bcCustomMessage\)\s*\{[\s\S]*?\}\s*\}/,
  `function initDefaultBroadcastTemplate() {
      if (el.bcCustomMessage && (!el.bcCustomMessage.value || el.bcCustomMessage.value.trim() === '')) {
        el.bcCustomMessage.value = \`Halo Kak {name},\\n\\nTerima kasih telah melamar posisi {role} di PGE Talent Pool.\\n\\nKami telah meninjau portofolio Kakak dan ingin mengundang Kakak untuk sesi Interview:\\n📅 Tanggal: {date}\\n⏰ Waktu: {time}\\n📍 Lokasi: {location}\\n\\nMohon konfirmasi kehadiran Kakak dengan membalas pesan ini ya. Terima kasih!\\n- Tim HR PGE Talent Pool\`;
      }
    }`
);

// 3. bootApp update
html = html.replace(
  /function bootApp\(\)\s*\{[\s\S]*?cacheDOMElements\(\);[\s\S]*?initPsyduckAssistant\(\);\s*\}/,
  `function bootApp() {
      cacheDOMElements();
      initParticleBackground();
      initEventListeners();
      loadBcSettings();
      initDefaultBroadcastTemplate();

      // Attach auto-save listeners on change
      ['bcStageFilter', 'bcDateInput', 'bcTimeInput', 'bcIntervalInput', 'bcLocationInput', 'bcTemplateSelect', 'bcAutoUpdateStage'].forEach(id => {
        if (el[id]) {
          el[id].addEventListener('change', saveBcSettings);
        }
      });
      if (el.bcCustomMessage) {
        el.bcCustomMessage.addEventListener('input', saveBcSettings);
      }

      initAuthListener();
      initPsyduckAssistant();
    }`
);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Normalized replacements applied successfully.');
