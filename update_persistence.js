const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Add Save Button to Tab 2
const tab2Target = `<div style="background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: var(--radius-sm); padding: 10px 12px; margin-top: 12px;">
                <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; cursor: pointer; color: #166534;">
                  <input type="checkbox" id="bcAutoUpdateStage" checked style="margin-top: 2px;">
                  <span><strong>Auto-Sync ke Appwrite:</strong> Otomatis simpan catatan jadwal &amp; ubah status kandidat ke <em>Interviewed</em> saat pesan dikirim.</span>
                </label>
              </div>`;

const tab2Replacement = tab2Target + `
              <div style="display: flex; justify-content: flex-end; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-light);">
                <button type="button" class="btn btn-primary" id="btnSaveScheduleSettings" onclick="handleSaveScheduleSettings()" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 500; font-size: 13px; background: #16A34A; border-color: #16A34A; color: #FFFFFF; box-shadow: 0 1px 2px rgba(0,0,0,0.05); padding: 8px 16px; cursor: pointer;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  Simpan Pengaturan Jadwal
                </button>
              </div>`;

if (html.includes(tab2Target)) {
  html = html.replace(tab2Target, tab2Replacement);
  console.log('Tab 2 button added.');
} else {
  console.error('Tab 2 target NOT found!');
}

// 2. Add Save Button to Tab 3
const tab3Target = `<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; font-style: italic;">
                💡 Variabel di atas otomatis diganti sesuai data kandidat dan slot waktu mereka.
              </div>`;

const tab3Replacement = tab3Target + `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-light);">
                <span style="font-size: 12px; color: var(--text-muted);">
                  Format template pesan akan disimpan dan digunakan saat klik &ldquo;Send to WA&rdquo;.
                </span>
                <button type="button" class="btn btn-primary" id="btnSaveTemplateSettings" onclick="handleSaveTemplateSettings()" style="display: inline-flex; align-items: center; gap: 8px; font-weight: 500; font-size: 13px; background: #2563EB; border-color: #2563EB; color: #FFFFFF; box-shadow: 0 1px 2px rgba(0,0,0,0.05); padding: 8px 16px; cursor: pointer;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  Simpan Template Pesan
                </button>
              </div>`;

if (html.includes(tab3Target)) {
  html = html.replace(tab3Target, tab3Replacement);
  console.log('Tab 3 button added.');
} else {
  console.error('Tab 3 target NOT found!');
}

// 3. Update saveBcSettings, loadBcSettings, handleSaveScheduleSettings, handleSaveTemplateSettings
const oldSaveBcRegex = /function saveBcSettings\(\) \{[\s\S]*?function loadBcSettings\(\) \{[\s\S]*?\}\s*\}/;

const newSaveLoadFunctions = `function saveBcSettings() {
      const settings = {
        filter: el.bcStageFilter ? el.bcStageFilter.value : '',
        date: el.bcDateInput ? el.bcDateInput.value : '',
        time: el.bcTimeInput ? el.bcTimeInput.value : '',
        interval: el.bcIntervalInput ? el.bcIntervalInput.value : '',
        location: el.bcLocationInput ? el.bcLocationInput.value : '',
        template: el.bcTemplateSelect ? el.bcTemplateSelect.value : '',
        customMsg: el.bcCustomMessage ? el.bcCustomMessage.value : '',
        autoUpdate: el.bcAutoUpdateStage ? el.bcAutoUpdateStage.checked : true
      };
      try {
        localStorage.setItem('pge_bc_settings', JSON.stringify(settings));
        return true;
      } catch (e) {
        console.warn('Failed to save bc settings:', e);
        return false;
      }
    }

    function loadBcSettings() {
      try {
        const raw = localStorage.getItem('pge_bc_settings');
        if (!raw) return false;
        const saved = JSON.parse(raw);
        if (saved) {
          if (el.bcStageFilter && saved.filter) el.bcStageFilter.value = saved.filter;
          if (el.bcDateInput && saved.date) el.bcDateInput.value = saved.date;
          if (el.bcTimeInput && saved.time) el.bcTimeInput.value = saved.time;
          if (el.bcIntervalInput && saved.interval) el.bcIntervalInput.value = saved.interval;
          if (el.bcLocationInput && saved.location) el.bcLocationInput.value = saved.location;
          if (el.bcTemplateSelect && saved.template) el.bcTemplateSelect.value = saved.template;
          if (el.bcCustomMessage && typeof saved.customMsg === 'string' && saved.customMsg.length > 0) {
            el.bcCustomMessage.value = saved.customMsg;
          }
          if (el.bcAutoUpdateStage && saved.hasOwnProperty('autoUpdate')) {
            el.bcAutoUpdateStage.checked = saved.autoUpdate;
          }
          return true;
        }
      } catch (e) {
        console.warn('Error reading saved broadcast settings:', e);
      }
      return false;
    }

    function handleSaveScheduleSettings() {
      const ok = saveBcSettings();
      renderBroadcastTable();
      if (ok) {
        showToast('✅ Pengaturan jadwal & interval berhasil disimpan!');
      } else {
        showToast('⚠️ Gagal menyimpan pengaturan jadwal.');
      }
    }

    function handleSaveTemplateSettings() {
      const ok = saveBcSettings();
      updateBroadcastPreview();
      if (ok) {
        showToast('✅ Template pesan WhatsApp berhasil disimpan!');
      } else {
        showToast('⚠️ Gagal menyimpan template pesan.');
      }
    }`;

if (oldSaveBcRegex.test(html)) {
  html = html.replace(oldSaveBcRegex, newSaveLoadFunctions);
  console.log('Updated save/load functions.');
} else {
  console.error('oldSaveBcRegex NOT found!');
}

// 4. Update cacheDOMElements to include bcIntervalInput and the new buttons
const domCacheTarget = `bcLocationInput: document.getElementById('bcLocationInput'),
        bcAutoUpdateStage: document.getElementById('bcAutoUpdateStage'),`;

const domCacheReplacement = `bcLocationInput: document.getElementById('bcLocationInput'),
        bcIntervalInput: document.getElementById('bcIntervalInput'),
        bcAutoUpdateStage: document.getElementById('bcAutoUpdateStage'),
        btnSaveScheduleSettings: document.getElementById('btnSaveScheduleSettings'),
        btnSaveTemplateSettings: document.getElementById('btnSaveTemplateSettings'),`;

if (html.includes(domCacheTarget)) {
  html = html.replace(domCacheTarget, domCacheReplacement);
  console.log('cacheDOMElements updated with bcIntervalInput and buttons.');
} else {
  console.error('domCacheTarget NOT found!');
}

// 5. Update initDefaultBroadcastTemplate to never overwrite if already populated
const oldInitTemplate = `function initDefaultBroadcastTemplate() {
      if (el.bcCustomMessage) {
        el.bcCustomMessage.value = \`Halo Kak {name},\\n\\nTerima kasih telah melamar posisi {role} di PGE Talent Pool.\\n\\nKami telah meninjau portofolio Kakak dan ingin mengundang Kakak untuk sesi Interview:\\n📅 Tanggal: {date}\\n⏰ Waktu: {time}\\n📍 Lokasi: {location}\\n\\nMohon konfirmasi kehadiran Kakak dengan membalas pesan ini ya. Terima kasih!\\n- Tim HR PGE Talent Pool\`;
      }
    }`;

const newInitTemplate = `function initDefaultBroadcastTemplate() {
      if (el.bcCustomMessage && (!el.bcCustomMessage.value || el.bcCustomMessage.value.trim() === '')) {
        el.bcCustomMessage.value = \`Halo Kak {name},\\n\\nTerima kasih telah melamar posisi {role} di PGE Talent Pool.\\n\\nKami telah meninjau portofolio Kakak dan ingin mengundang Kakak untuk sesi Interview:\\n📅 Tanggal: {date}\\n⏰ Waktu: {time}\\n📍 Lokasi: {location}\\n\\nMohon konfirmasi kehadiran Kakak dengan membalas pesan ini ya. Terima kasih!\\n- Tim HR PGE Talent Pool\`;
      }
    }`;

if (html.includes(oldInitTemplate)) {
  html = html.replace(oldInitTemplate, newInitTemplate);
  console.log('initDefaultBroadcastTemplate guarded against overwriting.');
} else {
  console.error('oldInitTemplate NOT found!');
}

// 6. Update bootApp to call loadBcSettings() and attach listeners
const oldBootApp = `function bootApp() {
      cacheDOMElements();
      initParticleBackground();
      initEventListeners();
      initDefaultBroadcastTemplate();
      initAuthListener();
      initPsyduckAssistant();
    }`;

const newBootApp = `function bootApp() {
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
    }`;

if (html.includes(oldBootApp)) {
  html = html.replace(oldBootApp, newBootApp);
  console.log('bootApp updated with loadBcSettings and listeners.');
} else {
  console.error('oldBootApp NOT found!');
}

// 7. Make sure handleBroadcastTemplateChange and insertVariableIntoMessage also saveBcSettings()
html = html.replace(
  `function handleBroadcastTemplateChange() {`,
  `function handleBroadcastTemplateChange() {\n      // Change template and save immediately`
);

html = html.replace(
  `updateBroadcastPreview();\n    }\n\n    function insertVariableIntoMessage`,
  `saveBcSettings();\n      updateBroadcastPreview();\n    }\n\n    function insertVariableIntoMessage`
);

html = html.replace(
  `textarea.selectionStart = textarea.selectionEnd = start + variableTag.length;\n      updateBroadcastPreview();`,
  `textarea.selectionStart = textarea.selectionEnd = start + variableTag.length;\n      saveBcSettings();\n      updateBroadcastPreview();`
);

// Expose handlers globally on window just in case
const windowExpose = `\n    window.handleSaveScheduleSettings = handleSaveScheduleSettings;\n    window.handleSaveTemplateSettings = handleSaveTemplateSettings;\n`;
html = html.replace(`function bootApp()`, windowExpose + `    function bootApp()`);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('All changes written to public/index.html successfully.');
