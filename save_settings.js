const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const jsToInsert = `
    function saveBcSettings() {
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
      try { localStorage.setItem('pge_bc_settings', JSON.stringify(settings)); } catch(e) {}
    }

    function loadBcSettings() {
      try {
        const saved = JSON.parse(localStorage.getItem('pge_bc_settings'));
        if (saved) {
          if (el.bcStageFilter && saved.filter) el.bcStageFilter.value = saved.filter;
          if (el.bcDateInput && saved.date) el.bcDateInput.value = saved.date;
          if (el.bcTimeInput && saved.time) el.bcTimeInput.value = saved.time;
          if (el.bcIntervalInput && saved.interval) el.bcIntervalInput.value = saved.interval;
          if (el.bcLocationInput && saved.location) el.bcLocationInput.value = saved.location;
          if (el.bcTemplateSelect && saved.template) el.bcTemplateSelect.value = saved.template;
          if (el.bcCustomMessage && saved.customMsg) el.bcCustomMessage.value = saved.customMsg;
          if (el.bcAutoUpdateStage && saved.hasOwnProperty('autoUpdate')) el.bcAutoUpdateStage.checked = saved.autoUpdate;
        }
      } catch(e) {}
    }
`;

html = html.replace(/function initBroadcast\(\) \{/, jsToInsert + '\n    function initBroadcast() {');

const initBcRegex = /function initBroadcast\(\) \{[\s\S]*?if \(el\.bcDateInput && !el\.bcDateInput\.value\) \{/;
html = html.replace(initBcRegex, (match) => {
  return match.replace(
    'if (el.bcDateInput && !el.bcDateInput.value) {',
    `loadBcSettings();\n\n      // Attach auto-save listeners\n      ['bcStageFilter', 'bcDateInput', 'bcTimeInput', 'bcIntervalInput', 'bcLocationInput', 'bcTemplateSelect', 'bcCustomMessage', 'bcAutoUpdateStage'].forEach(id => {\n        if (el[id]) el[id].addEventListener('input', saveBcSettings);\n        if (el[id]) el[id].addEventListener('change', saveBcSettings);\n      });\n\n      if (el.bcDateInput && !el.bcDateInput.value) {`
  );
});

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Added localStorage saving for broadcast settings.');
