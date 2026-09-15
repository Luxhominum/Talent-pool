const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Helper: getTalentAssignedSchedule
const getScheduleHelper = `
    function getTalentAssignedSchedule(talent) {
      let assignedTime = (state.smartScheduleMap && state.smartScheduleMap[talent.id]) ? state.smartScheduleMap[talent.id] : '-';
      let displayDate = formatDisplayDate(document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '');
      let isRescheduled = false;

      if (talent.outreachStatus === 'Reschedule' && talent.notes) {
        const matches = [...talent.notes.matchAll(/\\[Rescheduled to: (.*?)\\]/g)];
        if (matches.length > 0) {
          const lastMatch = matches[matches.length - 1][1];
          const parts = lastMatch.split(' ');
          if (parts.length >= 3) {
            const tTimeWIB = parts.pop();
            const tTimeNum = parts.pop();
            assignedTime = tTimeNum + ' ' + tTimeWIB;
            displayDate = parts.join(' ');
            isRescheduled = true;
          } else {
            displayDate = lastMatch;
            assignedTime = 'Rescheduled';
            isRescheduled = true;
          }
        }
      }
      return { assignedTime, displayDate, isRescheduled };
    }
`;

// Insert getTalentAssignedSchedule before resolveCandidateMessage
html = html.replace('function resolveCandidateMessage(', getScheduleHelper + '\n    function resolveCandidateMessage(');

// 2. Update resolveCandidateMessage to accept customDate
html = html.replace(
  `function resolveCandidateMessage(talent, assignedTime) {
      const template = el.bcCustomMessage ? el.bcCustomMessage.value : '';
      const dateVal = formatDisplayDate(el.bcDateInput ? el.bcDateInput.value : '');
      const timeVal = assignedTime || 'TBD';
      const locVal = el.bcLocationInput ? el.bcLocationInput.value.trim() : 's.id/lokasipge';`,
  `function resolveCandidateMessage(talent, assignedTime, assignedDate) {
      const template = el.bcCustomMessage ? el.bcCustomMessage.value : '';
      const dateVal = assignedDate || formatDisplayDate(el.bcDateInput ? el.bcDateInput.value : '');
      const timeVal = assignedTime || 'TBD';
      const locVal = el.bcLocationInput ? el.bcLocationInput.value.trim() : 's.id/lokasipge';`
);

// 3. Update submitReschedule to set stage to 'Interviewed'
const oldSubmitReschedule = `      target.outreachStatus = 'Reschedule';
      target.notes = updatedNotes;
      
      const packedNotes = packOutreachStatus(updatedNotes, 'Reschedule');
      
      closeRescheduleModal();
      renderBroadcastTable();
      
      try {
        const docId = target.$id || (target.id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          docId,
          { notes: packedNotes }
        );
        showToast('Reschedule saved for ' + target.name);
      } catch (e) {
        console.warn('Save error:', e);
        showToast('Saved locally, but failed in Cloud');
      }`;

const newSubmitReschedule = `      target.stage = 'Interviewed';
      target.outreachStatus = 'Reschedule';
      target.notes = updatedNotes;
      
      const packedNotes = packOutreachStatus(updatedNotes, 'Reschedule');
      
      closeRescheduleModal();
      renderBroadcastTable();
      updateMetrics();
      
      try {
        const docId = target.$id || (target.id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          docId,
          {
            stage: 'Interviewed',
            notes: packedNotes
          }
        );
        showToast('Rescheduled to ' + displayDate + ' ' + timeVal + ' & moved to Interviewed for ' + target.name);
      } catch (e) {
        console.warn('Save error:', e);
        showToast('Saved locally, but failed in Cloud');
      }`;

if (html.includes(oldSubmitReschedule)) {
  html = html.replace(oldSubmitReschedule, newSubmitReschedule);
  console.log('submitReschedule updated to set stage to Interviewed.');
} else {
  console.error('oldSubmitReschedule NOT found!');
}

// 4. Update loadAppwriteTalents to promote Reschedule to 'Interviewed' if currently 'Screening'
const oldLoadStage = `stage: doc.stage || 'Prospect',`;
const newLoadStage = `stage: (parsedNotes.status === 'Reschedule' && (doc.stage === 'Screening' || !doc.stage)) ? 'Interviewed' : (doc.stage || 'Prospect'),`;

if (html.includes(oldLoadStage)) {
  html = html.replace(oldLoadStage, newLoadStage);
  console.log('loadAppwriteTalents updated to ensure Reschedule has Interviewed stage.');
} else {
  console.error('oldLoadStage NOT found!');
}

// 5. Update renderBroadcastTable loop to use getTalentAssignedSchedule
const oldTableLoopSched = `        let assignedTime = state.smartScheduleMap[talent.id] || '-';
        let displayDate = formatDisplayDate(document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '');
        let isRescheduled = false;

        if (talent.outreachStatus === 'Reschedule' && talent.notes) {
          const matches = [...talent.notes.matchAll(/\\[Rescheduled to: (.*?)\\]/g)];
          if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1][1];
            const parts = lastMatch.split(' ');
            if (parts.length >= 3) {
              const tTimeWIB = parts.pop();
              const tTimeNum = parts.pop();
              assignedTime = tTimeNum + ' ' + tTimeWIB;
              displayDate = parts.join(' ');
              isRescheduled = true;
            } else {
              displayDate = lastMatch;
              assignedTime = 'Rescheduled';
              isRescheduled = true;
            }
          }
        }

        const resolvedMsg = resolveCandidateMessage(talent, assignedTime);`;

const newTableLoopSched = `        const sched = getTalentAssignedSchedule(talent);
        const assignedTime = sched.assignedTime;
        const displayDate = sched.displayDate;
        const isRescheduled = sched.isRescheduled;
        const resolvedMsg = resolveCandidateMessage(talent, assignedTime, displayDate);`;

if (html.includes(oldTableLoopSched)) {
  html = html.replace(oldTableLoopSched, newTableLoopSched);
  console.log('renderBroadcastTable updated to use getTalentAssignedSchedule.');
} else {
  console.error('oldTableLoopSched NOT found!');
}

// 6. Update sendBroadcastSingle to use getTalentAssignedSchedule
const oldSendBcTime = `      const assignedTime = state.smartScheduleMap ? state.smartScheduleMap[talent.id] : 'TBD';
      const msg = resolveCandidateMessage(talent, assignedTime);`;

const newSendBcTime = `      const sched = getTalentAssignedSchedule(talent);
      const assignedTime = sched.assignedTime || 'TBD';
      const assignedDate = sched.displayDate;
      const msg = resolveCandidateMessage(talent, assignedTime, assignedDate);`;

if (html.includes(oldSendBcTime)) {
  html = html.replace(oldSendBcTime, newSendBcTime);
  console.log('sendBroadcastSingle updated to use getTalentAssignedSchedule.');
} else {
  console.error('oldSendBcTime NOT found!');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Finished updating public/index.html.');
