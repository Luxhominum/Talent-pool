const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Replace autoUpdate block in sendBroadcastSingle
const sendBcRegex = /const autoUpdate = el\.bcAutoUpdateStage && el\.bcAutoUpdateStage\.checked;[\s\S]*?renderBroadcastTable\(\);\s*updateMetrics\(\);\s*\}/;

const newSendBc = `const autoUpdate = el.bcAutoUpdateStage && el.bcAutoUpdateStage.checked;
      if (autoUpdate) {
        const dateVal = formatDisplayDate(el.bcDateInput ? el.bcDateInput.value : '');
        const timeVal = assignedTime || 'TBD';
        const locVal = el.bcLocationInput ? el.bcLocationInput.value.trim() : 's.id/lokasipge';
        
        const scheduleRemark = \`\\n[Interview Scheduled: \${dateVal} \${timeVal} @ \${locVal}]\`;
        const updatedNotes = (talent.notes || '') + scheduleRemark;

        talent.stage = 'Interviewed';
        talent.notes = updatedNotes;
        talent.outreachStatus = 'WA Sent';

        try {
          const docId = talent.$id || (talent.id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
          await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            docId,
            {
              stage: 'Interviewed',
              notes: packOutreachStatus(updatedNotes, 'WA Sent')
            }
          );
          showToast(\`Sent & Recorded Schedule for \${talent.name} in Appwrite!\`);
        } catch (err) {
          console.warn('Auto-save schedule error:', err);
        }
      } else {
        updateOutreachStatus(talent.id, 'WA Sent');
        showToast(\`Opening WhatsApp for \${talent.name}...\`);
      }

      renderBroadcastTable();
      updateMetrics();
    }`;

html = html.replace(sendBcRegex, newSendBc);
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed sendBroadcastSingle.');
