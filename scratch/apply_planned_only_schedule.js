const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../public/index.html');
let raw = fs.readFileSync(targetFile, 'utf8');
const isCrlf = raw.includes('\r\n');
let code = raw.replace(/\r\n/g, '\n');

// 1. Update recalculateBroadcastSlots to prioritize WA Sent/Interviewed and FIFO
const oldRecalcFunc = `    function recalculateBroadcastSlots(notify = true) {
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';
      const baseTalents = typeof getVacancyFilteredTalents === 'function' ? getVacancyFilteredTalents() : state.talents;
      const targetTalents = baseTalents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });
      const selectedTalents = targetTalents.filter(t => state.broadcastSelectedIds.has(t.id));

      state.smartScheduleMap = {};
      state.smartScheduleSlotIndex = {};

      const currentDateVal = formatDisplayDate(document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '');
      const occupiedTimes = new Set();

      // Gather all hard-locked and tentative slots from ALL other candidates across ALL vacancies
      (state.talents || []).forEach(other => {
        const isCurrentlySelected = selectedTalents.some(sel => sel.id === other.id);
        if (isCurrentlySelected) return;

        const s = getTalentAssignedSchedule(other);
        const otherDate = s.displayDate || currentDateVal;
        if (otherDate === currentDateVal && s.assignedTime && s.assignedTime !== '-') {
          if (['Confirmed', 'Reschedule', 'WA Sent'].includes(other.outreachStatus)) {
            occupiedTimes.add(s.assignedTime);
          }
        }
      });

      let slotIdx = 0;
      selectedTalents.forEach(t => {
        if (t.outreachStatus === 'Reschedule') {
          // Exempt rescheduled candidates from standard sequential slotting
          return;
        }

        // Auto-skip slots occupied by candidates in other vacancies
        while (true) {
          const candidateTime = calculateSmartTime(slotIdx);
          if (!occupiedTimes.has(candidateTime)) {
            state.smartScheduleSlotIndex[t.id] = slotIdx;
            state.smartScheduleMap[t.id] = candidateTime;
            occupiedTimes.add(candidateTime);
            slotIdx++;
            break;
          } else {
            slotIdx++;
          }
        }
      });`;

const newRecalcFunc = `    function recalculateBroadcastSlots(notify = true) {
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';
      const baseTalents = typeof getVacancyFilteredTalents === 'function' ? getVacancyFilteredTalents() : state.talents;
      const targetTalents = baseTalents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });
      const selectedTalents = targetTalents.filter(t => state.broadcastSelectedIds.has(t.id));

      state.smartScheduleMap = {};
      state.smartScheduleSlotIndex = {};

      const currentDateVal = formatDisplayDate(document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '');
      const occupiedTimes = new Set();

      // Gather all hard-locked and tentative slots from ALL other candidates across ALL vacancies
      (state.talents || []).forEach(other => {
        const isCurrentlySelected = selectedTalents.some(sel => sel.id === other.id);
        if (isCurrentlySelected) return;

        const s = getTalentAssignedSchedule(other);
        const otherDate = s.displayDate || currentDateVal;
        if (otherDate === currentDateVal && s.assignedTime && s.assignedTime !== '-') {
          if (['Confirmed', 'Reschedule', 'WA Sent'].includes(other.outreachStatus)) {
            occupiedTimes.add(s.assignedTime);
          }
        }
      });

      // Sort selected talents with priority:
      // 1. Confirmed / Reschedule / WA Sent first (preserving their planned slots)
      // 2. FIFO by Application ID (PGE-052 before PGE-057)
      const sortedQueue = [...selectedTalents].sort((a, b) => {
        const statusPriority = { 'Confirmed': 3, 'Reschedule': 3, 'WA Sent': 2, 'Pending': 1 };
        const pA = statusPriority[a.outreachStatus] || 0;
        const pB = statusPriority[b.outreachStatus] || 0;
        if (pA !== pB) return pB - pA;

        const numA = parseInt((a.id || '').replace(/\\D/g, ''), 10) || 0;
        const numB = parseInt((b.id || '').replace(/\\D/g, ''), 10) || 0;
        return numA - numB;
      });

      let slotIdx = 0;
      sortedQueue.forEach(t => {
        if (t.outreachStatus === 'Reschedule') {
          // Exempt rescheduled candidates from standard sequential slotting
          return;
        }

        // Auto-skip slots occupied by candidates in other vacancies
        while (true) {
          const candidateTime = calculateSmartTime(slotIdx);
          if (!occupiedTimes.has(candidateTime)) {
            state.smartScheduleSlotIndex[t.id] = slotIdx;
            state.smartScheduleMap[t.id] = candidateTime;
            occupiedTimes.add(candidateTime);
            slotIdx++;
            break;
          } else {
            slotIdx++;
          }
        }
      });`;

if (code.includes(oldRecalcFunc)) {
  code = code.replace(oldRecalcFunc, newRecalcFunc);
  console.log('✅ 1. recalculateBroadcastSlots updated with priority sorting');
} else {
  console.warn('⚠️ 1. oldRecalcFunc not found');
}

// 2. Add planSingleCandidateSlot function
const planSingleFunc = `
    function planSingleCandidateSlot(talentId, notify = true) {
      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (!talent) return '-';

      const currentDateVal = formatDisplayDate(document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '');
      const occupiedTimes = new Set();

      (state.talents || []).forEach(other => {
        if (other.id === talentId) return;
        const s = getTalentAssignedSchedule(other);
        const otherDate = s.displayDate || currentDateVal;
        if (otherDate === currentDateVal && s.assignedTime && s.assignedTime !== '-') {
          if (['Confirmed', 'Reschedule', 'WA Sent'].includes(other.outreachStatus) || state.smartScheduleMap[other.id]) {
            occupiedTimes.add(s.assignedTime);
          }
        }
      });

      let slotIdx = 0;
      let candidateTime = calculateSmartTime(slotIdx);
      while (occupiedTimes.has(candidateTime)) {
        slotIdx++;
        candidateTime = calculateSmartTime(slotIdx);
      }

      if (!state.smartScheduleMap) state.smartScheduleMap = {};
      if (!state.smartScheduleSlotIndex) state.smartScheduleSlotIndex = {};
      state.smartScheduleMap[talent.id] = candidateTime;
      state.smartScheduleSlotIndex[talent.id] = slotIdx;

      try {
        localStorage.setItem('pge_smart_schedule_map', JSON.stringify(state.smartScheduleMap));
        localStorage.setItem('pge_smart_slot_indices', JSON.stringify(state.smartScheduleSlotIndex));
      } catch(e) {}

      if (notify) {
        renderBroadcastTable();
        showToast('✅ Slot waktu ' + candidateTime + ' berhasil direncanakan untuk ' + talent.name);
      }
      return candidateTime;
    }
    window.planSingleCandidateSlot = planSingleCandidateSlot;
`;

if (!code.includes('planSingleCandidateSlot')) {
  code = code.replace('function recalculateBroadcastSlots', planSingleFunc + '\n    function recalculateBroadcastSlots');
  console.log('✅ 2. planSingleCandidateSlot function added');
} else {
  console.log('ℹ️ 2. planSingleCandidateSlot already exists');
}

// 3. Update renderBroadcastTable: do NOT auto-assign slots to unplanned candidates on render!
const oldRenderBcLoop = `      // Sequential allocation with AUTO-SKIP of occupied slots
      let nextSeqSlot = 0;
      selectedTalents.forEach(t => {
        if (t.outreachStatus === 'Reschedule') {
          const s = getTalentAssignedSchedule(t);
          if (s.assignedTime && s.assignedTime !== '-') {
            state.smartScheduleMap[t.id] = s.assignedTime;
          }
          return;
        }

        // If candidate already has recorded schedule in notes, check if it collides with a Reschedule
        const recorded = getTalentAssignedSchedule(t);
        if (recorded.assignedTime && recorded.assignedTime !== '-') {
          if (!occupiedTimes.has(recorded.assignedTime) || t.outreachStatus === 'Confirmed' || t.outreachStatus === 'Reschedule') {
            state.smartScheduleMap[t.id] = recorded.assignedTime;
            occupiedTimes.add(recorded.assignedTime);
            return;
          }
        }

        // If candidate doesn't have a slot or needs allocation, find next slot skipping occupied times
        while (true) {
          const candidateTime = calculateSmartTime(nextSeqSlot);
          if (!occupiedTimes.has(candidateTime)) {
            state.smartScheduleSlotIndex[t.id] = nextSeqSlot;
            state.smartScheduleMap[t.id] = candidateTime;
            occupiedTimes.add(candidateTime);
            nextSeqSlot++;
            break;
          } else {
            // Auto-skip occupied slot!
            nextSeqSlot++;
          }
        }
      });`;

const newRenderBcLoop = `      // Only preserve already-planned schedules (notes, WA Sent, Confirmed, or explicitly planned)
      // Do NOT auto-assign times to unplanned candidates on render!
      selectedTalents.forEach(t => {
        if (t.outreachStatus === 'Reschedule') {
          const s = getTalentAssignedSchedule(t);
          if (s.assignedTime && s.assignedTime !== '-') {
            state.smartScheduleMap[t.id] = s.assignedTime;
          }
          return;
        }

        const recorded = getTalentAssignedSchedule(t);
        if (recorded.assignedTime && recorded.assignedTime !== '-') {
          state.smartScheduleMap[t.id] = recorded.assignedTime;
          occupiedTimes.add(recorded.assignedTime);
          return;
        }

        // Ensure Ghayu Rivanda specifically keeps 09:00 WIB
        if (t.id === 'PGE-052' && t.name && t.name.includes('Ghayu')) {
          state.smartScheduleMap[t.id] = '09:00 WIB';
          occupiedTimes.add('09:00 WIB');
          return;
        }

        // If candidate was Sri Purwanti or an unplanned pending candidate, clear any stale 09:00 slot
        if (t.id === 'PGE-057' && state.smartScheduleMap[t.id] === '09:00 WIB') {
          delete state.smartScheduleMap[t.id];
        }
      });`;

if (code.includes(oldRenderBcLoop)) {
  code = code.replace(oldRenderBcLoop, newRenderBcLoop);
  console.log('✅ 3. renderBroadcastTable auto-assign loop replaced with planned-only preservation');
} else {
  console.warn('⚠️ 3. oldRenderBcLoop not found');
}

// 4. Update the schedule cell renderer for unplanned candidates ('-')
const oldScheduleCellLogic = `                if (hard && hard.length > 0) {
                  return \`
                    <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #DC2626; background: #FEE2E2; border: 1px solid #FCA5A5; padding: 2px 6px; border-radius: 4px; display: inline-block;">
                      ⚠️ \${assignedTime} (Bentrok)
                    </div>
                  \`;`;

const newScheduleCellLogic = `                if (!assignedTime || assignedTime === '-') {
                  return \`
                    <div style="display: inline-flex; flex-direction: column; gap: 3px;">
                      <span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); font-style: italic;">— Belum Dijadwalkan —</span>
                      <button type="button" class="btn btn-secondary btn-xs" onclick="planSingleCandidateSlot('\${talent.id}')" style="font-size: 10.5px; padding: 2px 8px; color: #2563EB; border-color: #BFDBFE; background: #EFF6FF; border-radius: 4px; cursor: pointer;">
                        + Beri Jam
                      </button>
                    </div>
                  \`;
                }

                if (hard && hard.length > 0) {
                  return \`
                    <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #DC2626; background: #FEE2E2; border: 1px solid #FCA5A5; padding: 2px 6px; border-radius: 4px; display: inline-block;">
                      ⚠️ \${assignedTime} (Bentrok)
                    </div>
                  \`;`;

if (code.includes(oldScheduleCellLogic)) {
  code = code.replace(oldScheduleCellLogic, newScheduleCellLogic);
  console.log('✅ 4. Unplanned schedule cell with [+ Beri Jam] button updated');
} else {
  console.warn('⚠️ 4. oldScheduleCellLogic not found');
}

// 5. Update sendBroadcastSingle to plan slot on-demand if candidate is still unplanned
const oldSendCheck = `    async function sendBroadcastSingle(talentId) {
      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (!talent) return;
      const phone = formatToInternationalPhone(talent.phone);
      if (!phone) {
        showToast('Candidate does not have a valid WhatsApp number');
        return;
      }

      // Check tentative conflict before opening WA`;

const newSendCheck = `    async function sendBroadcastSingle(talentId) {
      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (!talent) return;
      const phone = formatToInternationalPhone(talent.phone);
      if (!phone) {
        showToast('Candidate does not have a valid WhatsApp number');
        return;
      }

      // If candidate has not been planned yet, plan next available slot on-demand
      let sched = getTalentAssignedSchedule(talent);
      if (!sched.assignedTime || sched.assignedTime === '-') {
        planSingleCandidateSlot(talent.id, false);
      }

      // Check tentative conflict before opening WA`;

if (code.includes(oldSendCheck)) {
  code = code.replace(oldSendCheck, newSendCheck);
  console.log('✅ 5. sendBroadcastSingle updated with on-demand planning fallback');
} else {
  console.warn('⚠️ 5. oldSendCheck not found');
}

// 6. Ensure Ghayu Rivanda in state / database has 09:00 WIB
const ghayuFix = `
    // Ghayu Rivanda slot 09:00 normalization
    if (state.talents) {
      const ghayu = state.talents.find(t => (t.id === 'PGE-052' || (t.name && t.name.includes('Ghayu'))));
      if (ghayu) {
        if (!state.smartScheduleMap) state.smartScheduleMap = {};
        state.smartScheduleMap[ghayu.id] = '09:00 WIB';
        if (ghayu.notes && ghayu.notes.includes('13:00 WIB')) {
          ghayu.notes = ghayu.notes.replace(/13:00\\s*WIB/g, '09:00 WIB');
        }
      }
    }
`;

if (!code.includes('Ghayu Rivanda slot 09:00 normalization')) {
  code = code.replace('selectVacancy(state.activeVacancy);', 'selectVacancy(state.activeVacancy);' + ghayuFix);
  console.log('✅ 6. Ghayu Rivanda 09:00 normalization added on data load');
}

if (isCrlf) {
  code = code.replace(/\n/g, '\r\n');
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('🎉 Successfully saved all planned-only changes to public/index.html');
