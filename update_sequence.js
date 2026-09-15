const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Update getTalentAssignedSchedule to read from notes first
const oldGetSchedule = `    function getTalentAssignedSchedule(talent) {
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
    }`;

const newGetSchedule = `    function getTalentAssignedSchedule(talent) {
      let assignedTime = (state.smartScheduleMap && state.smartScheduleMap[talent.id]) ? state.smartScheduleMap[talent.id] : '-';
      let displayDate = formatDisplayDate(document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '');
      let isRescheduled = false;

      // Priority 1: Check for Reschedule in notes
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
          return { assignedTime, displayDate, isRescheduled };
        }
      }

      // Priority 2: Check for permanently recorded [Interview Scheduled: ...] in notes
      if (talent.notes) {
        const schedMatches = [...talent.notes.matchAll(/\\[Interview Scheduled:\\s*(.*?)\\s+@\\s*.*?\\]/g)];
        if (schedMatches.length > 0) {
          const lastSched = schedMatches[schedMatches.length - 1][1];
          const parts = lastSched.split(' ');
          if (parts.length >= 3) {
            const tTimeWIB = parts.pop();
            const tTimeNum = parts.pop();
            assignedTime = tTimeNum + ' ' + tTimeWIB;
            displayDate = parts.join(' ');
            return { assignedTime, displayDate, isRescheduled: false };
          }
        }
      }

      return { assignedTime, displayDate, isRescheduled };
    }`;

html = html.replace(oldGetSchedule, newGetSchedule);

// 2. Update recalculateBroadcastSlots to strictly exempt Reschedule and sequence from 0
const oldRecalc = `function recalculateBroadcastSlots(notify = true) {
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';
      const targetTalents = state.talents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });
      const selectedTalents = targetTalents.filter(t => state.broadcastSelectedIds.has(t.id));

      state.smartScheduleMap = {};
      state.smartScheduleSlotIndex = {};
      selectedTalents.forEach((t, i) => {
        state.smartScheduleSlotIndex[t.id] = i;
        state.smartScheduleMap[t.id] = calculateSmartTime(i);
      });

      try {
        localStorage.setItem('pge_smart_schedule_map', JSON.stringify(state.smartScheduleMap));
        localStorage.setItem('pge_smart_slot_indices', JSON.stringify(state.smartScheduleSlotIndex));
      } catch(e) {}

      renderBroadcastTable();
      if (notify) {
        showToast('🔄 Slot jam dihitung ulang berurutan dari jam awal!');
      }
    }`;

const newRecalc = `function recalculateBroadcastSlots(notify = true) {
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';
      const targetTalents = state.talents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });
      const selectedTalents = targetTalents.filter(t => state.broadcastSelectedIds.has(t.id));

      state.smartScheduleMap = {};
      state.smartScheduleSlotIndex = {};

      let slotIdx = 0;
      selectedTalents.forEach(t => {
        if (t.outreachStatus === 'Reschedule') {
          // Exempt rescheduled candidates from standard sequential slotting
          return;
        }
        state.smartScheduleSlotIndex[t.id] = slotIdx;
        state.smartScheduleMap[t.id] = calculateSmartTime(slotIdx);
        slotIdx++;
      });

      try {
        localStorage.setItem('pge_smart_schedule_map', JSON.stringify(state.smartScheduleMap));
        localStorage.setItem('pge_smart_slot_indices', JSON.stringify(state.smartScheduleSlotIndex));
      } catch(e) {}

      renderBroadcastTable();
      if (notify) {
        showToast('🔄 Slot jam dihitung ulang berurutan dari jam awal (kecuali kandidat reschedule)!');
      }
    }`;

html = html.replace(oldRecalc, newRecalc);

// 3. Update renderBroadcastTable schedule assignment loop
const oldRenderSchedule = `      // Calculate smart schedule assignments with LOCKED slots (prevents shifting when candidates are chatted)
      if (!state.smartScheduleMap) {
        try {
          state.smartScheduleMap = JSON.parse(localStorage.getItem('pge_smart_schedule_map') || '{}');
        } catch(e) {
          state.smartScheduleMap = {};
        }
      }
      if (!state.smartScheduleSlotIndex) {
        try {
          state.smartScheduleSlotIndex = JSON.parse(localStorage.getItem('pge_smart_slot_indices') || '{}');
        } catch(e) {
          state.smartScheduleSlotIndex = {};
        }
      }

      const selectedTalents = targetTalents.filter(t => state.broadcastSelectedIds.has(t.id));

      // Find highest allocated slot index
      let maxSlot = -1;
      Object.values(state.smartScheduleSlotIndex).forEach(idx => {
        if (typeof idx === 'number' && idx > maxSlot) maxSlot = idx;
      });

      // Keep existing locked slot for candidates who already have one; allocate next slot for new candidates
      selectedTalents.forEach(t => {
        if (!state.smartScheduleMap[t.id]) {
          maxSlot++;
          state.smartScheduleSlotIndex[t.id] = maxSlot;
          state.smartScheduleMap[t.id] = calculateSmartTime(maxSlot);
        }
      });

      try {
        localStorage.setItem('pge_smart_schedule_map', JSON.stringify(state.smartScheduleMap));
        localStorage.setItem('pge_smart_slot_indices', JSON.stringify(state.smartScheduleSlotIndex));
      } catch(e) {}`;

const newRenderSchedule = `      // Calculate smart schedule assignments with LOCKED slots & notes priority
      if (!state.smartScheduleMap) {
        try {
          state.smartScheduleMap = JSON.parse(localStorage.getItem('pge_smart_schedule_map') || '{}');
        } catch(e) {
          state.smartScheduleMap = {};
        }
      }
      if (!state.smartScheduleSlotIndex) {
        try {
          state.smartScheduleSlotIndex = JSON.parse(localStorage.getItem('pge_smart_slot_indices') || '{}');
        } catch(e) {
          state.smartScheduleSlotIndex = {};
        }
      }

      const selectedTalents = targetTalents.filter(t => state.broadcastSelectedIds.has(t.id));

      // Sequential allocation exempting Rescheduled candidates
      let nextSeqSlot = 0;
      selectedTalents.forEach(t => {
        if (t.outreachStatus === 'Reschedule') return;

        // If candidate already has recorded schedule in notes, lock that into map
        const recorded = getTalentAssignedSchedule(t);
        if (recorded.assignedTime && recorded.assignedTime !== '-') {
          state.smartScheduleMap[t.id] = recorded.assignedTime;
          return;
        }

        // If candidate doesn't have a slot yet, assign in top-to-bottom sequence
        if (!state.smartScheduleMap[t.id]) {
          while (Object.values(state.smartScheduleSlotIndex).includes(nextSeqSlot)) {
            nextSeqSlot++;
          }
          state.smartScheduleSlotIndex[t.id] = nextSeqSlot;
          state.smartScheduleMap[t.id] = calculateSmartTime(nextSeqSlot);
          nextSeqSlot++;
        }
      });

      try {
        localStorage.setItem('pge_smart_schedule_map', JSON.stringify(state.smartScheduleMap));
        localStorage.setItem('pge_smart_slot_indices', JSON.stringify(state.smartScheduleSlotIndex));
      } catch(e) {}`;

html = html.replace(oldRenderSchedule, newRenderSchedule);

// 4. In loadAppwriteTalents, add correction for legacy schedule remarks
const correctionFunction = `
    function correctCandidateScheduleSequence(talents) {
      const fixedTimes = {
        'PGE-051': '09:00 WIB',
        'PGE-050': '09:40 WIB',
        'PGE-046': '10:20 WIB',
        'PGE-043': '11:00 WIB',
        'PGE-037': '11:40 WIB',
        'PGE-023': '12:20 WIB'
      };

      if (!state.smartScheduleMap) state.smartScheduleMap = {};

      talents.forEach(t => {
        if (fixedTimes[t.id]) {
          const time = fixedTimes[t.id];
          const date = 'Selasa, 8 September 2026';
          const loc = 's.id/lokasipge';
          const remark = '[Interview Scheduled: ' + date + ' ' + time + ' @ ' + loc + ']';

          state.smartScheduleMap[t.id] = time;

          // If candidate note had wrong time (e.g. 13:40 or 14:20), fix it
          if (t.notes && t.notes.includes('[Interview Scheduled:') && !t.notes.includes(time)) {
            t.notes = t.notes.replace(/\\[Interview Scheduled:\\s*.*?\\]/g, remark);
            const docId = t.$id || (t.id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
            databases.updateDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collectionId,
              docId,
              { notes: packOutreachStatus(t.notes, t.outreachStatus || 'WA Sent') }
            ).catch(err => console.warn('Background sync error:', err));
          } else if (t.outreachStatus === 'WA Sent' && (!t.notes || !t.notes.includes('[Interview Scheduled:'))) {
            t.notes = (t.notes ? t.notes + '\n\n' : '') + remark;
            const docId = t.$id || (t.id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
            databases.updateDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collectionId,
              docId,
              { notes: packOutreachStatus(t.notes, 'WA Sent') }
            ).catch(err => console.warn('Background sync error:', err));
          }
        }
      });

      try {
        localStorage.setItem('pge_smart_schedule_map', JSON.stringify(state.smartScheduleMap));
      } catch(e) {}
    }
`;

html = html.replace('function bootApp()', correctionFunction + '\n    function bootApp()');

// Call correctCandidateScheduleSequence in loadAppwriteTalents after items sort
html = html.replace(
  'state.talents = items;',
  'state.talents = items;\n        correctCandidateScheduleSequence(state.talents);'
);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('public/index.html updated with sequence lock and correction.');
