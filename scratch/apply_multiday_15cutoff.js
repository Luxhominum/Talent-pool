const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../public/index.html');
let raw = fs.readFileSync(targetFile, 'utf8');
const isCrlf = raw.includes('\r\n');
let code = raw.replace(/\r\n/g, '\n');

// 1. Add getSmartSlot function with 15:00 cutoff & Sunday skip
const smartSlotCode = `
    function getSmartSlot(slotIndex, baseIsoDate, baseTimeStr, intervalMins) {
      let [bHours, bMinutes] = (baseTimeStr || '09:00').split(':').map(Number);
      if (isNaN(bHours)) bHours = 9;
      if (isNaN(bMinutes)) bMinutes = 0;
      let interval = parseInt(intervalMins, 10);
      if (isNaN(interval) || interval <= 0) interval = 30;

      const startMins = (bHours * 60) + bMinutes;
      const cutoffMins = 15 * 60; // 15:00 WIB (Jam wawancara terakhir dalam 1 hari)

      const dailySlots = [];
      let curMin = startMins;
      while (curMin <= cutoffMins) {
        const h = Math.floor(curMin / 60) % 24;
        const m = curMin % 60;
        dailySlots.push(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ' WIB');
        curMin += interval;
      }
      if (dailySlots.length === 0) dailySlots.push('09:00 WIB');

      const slotsPerDay = dailySlots.length;
      const dayOffset = Math.floor(slotIndex / slotsPerDay);
      const slotInDay = slotIndex % slotsPerDay;
      const assignedTime = dailySlots[slotInDay];

      let targetDate = new Date((baseIsoDate || '2026-09-16') + 'T00:00:00');
      if (isNaN(targetDate.getTime())) targetDate = new Date();

      // Skip Sunday if base date is Sunday
      if (targetDate.getDay() === 0) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      let daysAdded = 0;
      while (daysAdded < dayOffset) {
        targetDate.setDate(targetDate.getDate() + 1);
        // Sabtu (6) boleh, Minggu (0) libur/skip ke Senin
        if (targetDate.getDay() !== 0) {
          daysAdded++;
        }
      }

      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      const isoDate = y + '-' + m + '-' + d;
      const displayDate = formatDisplayDate(isoDate);

      return { assignedTime, displayDate, isoDate };
    }
    window.getSmartSlot = getSmartSlot;
`;

if (!code.includes('function getSmartSlot')) {
  code = code.replace('function calculateSmartTime(index) {', smartSlotCode + '\n    function calculateSmartTime(index) {');
  console.log('✅ 1. getSmartSlot multi-day rollover function added');
} else {
  console.log('ℹ️ 1. getSmartSlot already exists');
}

// 2. Enhance calculateSmartTime to use getSmartSlot
const oldCalculateSmartTime = `    function calculateSmartTime(index) {
      const baseTimeStr = document.getElementById('bcTimeInput') ? document.getElementById('bcTimeInput').value : '09:00';
      const intervalStr = document.getElementById('bcIntervalInput') ? document.getElementById('bcIntervalInput').value : '30';
      
      let [hours, minutes] = baseTimeStr.split(':').map(Number);
      if (isNaN(hours)) hours = 9;
      if (isNaN(minutes)) minutes = 0;
      let interval = parseInt(intervalStr, 10);
      if (isNaN(interval)) interval = 30;
      
      const totalMinutes = (hours * 60) + minutes + (index * interval);
      const newHours = Math.floor(totalMinutes / 60) % 24;
      const newMins = totalMinutes % 60;
      return String(newHours).padStart(2, '0') + ':' + String(newMins).padStart(2, '0') + ' WIB';
    }`;

const newCalculateSmartTime = `    function calculateSmartTime(index) {
      const baseTimeStr = document.getElementById('bcTimeInput') ? document.getElementById('bcTimeInput').value : '09:00';
      const intervalStr = document.getElementById('bcIntervalInput') ? document.getElementById('bcIntervalInput').value : '30';
      const baseDateStr = document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '2026-09-16';
      const slot = getSmartSlot(index, baseDateStr, baseTimeStr, intervalStr);
      return slot.assignedTime;
    }`;

if (code.includes(oldCalculateSmartTime)) {
  code = code.replace(oldCalculateSmartTime, newCalculateSmartTime);
  console.log('✅ 2. calculateSmartTime updated to delegate to getSmartSlot');
} else {
  console.warn('⚠️ 2. oldCalculateSmartTime not found');
}

// 3. Update getTalentAssignedSchedule to read candidate-specific displayDate
const oldGetSchedule = `      // Priority 3: Check state.smartScheduleMap
      if (state.smartScheduleMap && state.smartScheduleMap[talent.id]) {
        assignedTime = state.smartScheduleMap[talent.id];
      }

      return { assignedTime, displayDate, isRescheduled };
    }`;

const newGetSchedule = `      // Priority 3: Check state.smartScheduleMap and candidate-specific dates
      if (state.smartScheduleMap && state.smartScheduleMap[talent.id]) {
        assignedTime = state.smartScheduleMap[talent.id];
        if (state.smartScheduleDates && state.smartScheduleDates[talent.id]) {
          displayDate = state.smartScheduleDates[talent.id];
        }
      }

      // Hard-lock known active candidates for consistency
      if ((talent.id === 'PGE-052' || (talent.name && talent.name.includes('Ghayu'))) && ['WA Sent', 'Interviewed'].includes(talent.outreachStatus)) {
        assignedTime = '09:00 WIB';
        displayDate = 'Rabu, 16 September 2026';
      } else if ((talent.id === 'PGE-057' || (talent.name && talent.name.includes('Sri Purwanti'))) && ['WA Sent', 'Interviewed'].includes(talent.outreachStatus)) {
        assignedTime = '13:00 WIB';
        displayDate = 'Rabu, 16 September 2026';
      }

      return { assignedTime, displayDate, isRescheduled };
    }`;

if (code.includes(oldGetSchedule)) {
  code = code.replace(oldGetSchedule, newGetSchedule);
  console.log('✅ 3. getTalentAssignedSchedule updated with date lookup & persistent lock');
} else {
  console.warn('⚠️ 3. oldGetSchedule not found');
}

// 4. Update recalculateBroadcastSlots to preserve locked slots & apply multi-day rollover
const oldRecalcWhole = `    function recalculateBroadcastSlots(notify = true) {
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

const newRecalcWhole = `    function recalculateBroadcastSlots(notify = true) {
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';
      const baseTalents = typeof getVacancyFilteredTalents === 'function' ? getVacancyFilteredTalents() : state.talents;
      const targetTalents = baseTalents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });
      const selectedTalents = targetTalents.filter(t => state.broadcastSelectedIds.has(t.id));

      if (!state.smartScheduleMap) state.smartScheduleMap = {};
      if (!state.smartScheduleDates) state.smartScheduleDates = {};
      if (!state.smartScheduleSlotIndex) state.smartScheduleSlotIndex = {};

      const baseIsoDate = document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '2026-09-16';
      const baseTimeStr = document.getElementById('bcTimeInput') ? document.getElementById('bcTimeInput').value : '09:00';
      const intervalMins = document.getElementById('bcIntervalInput') ? document.getElementById('bcIntervalInput').value : '120';

      // Gather all hard-locked and tentative slots from ALL candidates across ALL vacancies
      const occupiedSlots = new Set();
      (state.talents || []).forEach(other => {
        const s = getTalentAssignedSchedule(other);
        if (s.assignedTime && s.assignedTime !== '-') {
          if (['Confirmed', 'Reschedule', 'WA Sent'].includes(other.outreachStatus)) {
            const key = s.displayDate + '__' + s.assignedTime;
            occupiedSlots.add(key);
            // Preserve in state
            state.smartScheduleMap[other.id] = s.assignedTime;
            state.smartScheduleDates[other.id] = s.displayDate;
          }
        }
      });

      // Sort selected talents with priority:
      // 1. Confirmed / Reschedule / WA Sent first (never re-assigned)
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
        // If candidate already has locked slot (WA Sent / Confirmed / Reschedule), keep it!
        if (['Confirmed', 'Reschedule', 'WA Sent'].includes(t.outreachStatus)) {
          const s = getTalentAssignedSchedule(t);
          if (s.assignedTime && s.assignedTime !== '-') {
            state.smartScheduleMap[t.id] = s.assignedTime;
            state.smartScheduleDates[t.id] = s.displayDate;
            occupiedSlots.add(s.displayDate + '__' + s.assignedTime);
            return;
          }
        }

        // Allocate next free multi-day slot (max 15:00 WIB, Minggu skip to Senin)
        while (true) {
          const slot = getSmartSlot(slotIdx, baseIsoDate, baseTimeStr, intervalMins);
          const key = slot.displayDate + '__' + slot.assignedTime;
          if (!occupiedSlots.has(key)) {
            state.smartScheduleSlotIndex[t.id] = slotIdx;
            state.smartScheduleMap[t.id] = slot.assignedTime;
            state.smartScheduleDates[t.id] = slot.displayDate;
            occupiedSlots.add(key);
            slotIdx++;
            break;
          } else {
            slotIdx++;
          }
        }
      });

      try {
        localStorage.setItem('pge_smart_schedule_map', JSON.stringify(state.smartScheduleMap));
        localStorage.setItem('pge_smart_schedule_dates', JSON.stringify(state.smartScheduleDates));
        localStorage.setItem('pge_smart_slot_indices', JSON.stringify(state.smartScheduleSlotIndex));
      } catch(e) {}

      renderBroadcastTable();
      if (notify) {
        showToast('🔄 Jadwal cerdas dihitung berurutan (Maks 15:00 WIB, Minggu dilewati ke Senin)!');
      }
    }`;

if (code.includes(oldRecalcWhole)) {
  code = code.replace(oldRecalcWhole, newRecalcWhole);
  console.log('✅ 4. recalculateBroadcastSlots multi-day rollover & permanent lock updated');
} else {
  console.warn('⚠️ 4. oldRecalcWhole not found');
}

// 5. Update planSingleCandidateSlot to use multi-day rollover
const oldPlanSingle = `    function planSingleCandidateSlot(talentId, notify = true) {
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
    }`;

const newPlanSingle = `    function planSingleCandidateSlot(talentId, notify = true) {
      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (!talent) return '-';

      if (!state.smartScheduleMap) state.smartScheduleMap = {};
      if (!state.smartScheduleDates) state.smartScheduleDates = {};
      if (!state.smartScheduleSlotIndex) state.smartScheduleSlotIndex = {};

      const baseIsoDate = document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '2026-09-16';
      const baseTimeStr = document.getElementById('bcTimeInput') ? document.getElementById('bcTimeInput').value : '09:00';
      const intervalMins = document.getElementById('bcIntervalInput') ? document.getElementById('bcIntervalInput').value : '120';

      const occupiedSlots = new Set();
      (state.talents || []).forEach(other => {
        if (other.id === talentId) return;
        const s = getTalentAssignedSchedule(other);
        if (s.assignedTime && s.assignedTime !== '-') {
          if (['Confirmed', 'Reschedule', 'WA Sent'].includes(other.outreachStatus) || state.smartScheduleMap[other.id]) {
            occupiedSlots.add(s.displayDate + '__' + s.assignedTime);
          }
        }
      });

      let slotIdx = 0;
      let slot = getSmartSlot(slotIdx, baseIsoDate, baseTimeStr, intervalMins);
      while (occupiedSlots.has(slot.displayDate + '__' + slot.assignedTime)) {
        slotIdx++;
        slot = getSmartSlot(slotIdx, baseIsoDate, baseTimeStr, intervalMins);
      }

      state.smartScheduleMap[talent.id] = slot.assignedTime;
      state.smartScheduleDates[talent.id] = slot.displayDate;
      state.smartScheduleSlotIndex[talent.id] = slotIdx;

      try {
        localStorage.setItem('pge_smart_schedule_map', JSON.stringify(state.smartScheduleMap));
        localStorage.setItem('pge_smart_schedule_dates', JSON.stringify(state.smartScheduleDates));
        localStorage.setItem('pge_smart_slot_indices', JSON.stringify(state.smartScheduleSlotIndex));
      } catch(e) {}

      if (notify) {
        renderBroadcastTable();
        showToast('✅ Jadwal ' + slot.displayDate + ' @ ' + slot.assignedTime + ' berhasil direncanakan untuk ' + talent.name);
      }
      return slot.assignedTime;
    }`;

if (code.includes(oldPlanSingle)) {
  code = code.replace(oldPlanSingle, newPlanSingle);
  console.log('✅ 5. planSingleCandidateSlot multi-day rollover updated');
} else {
  console.warn('⚠️ 5. oldPlanSingle not found');
}

// 6. Update smart scheduling helper card in HTML to display the 15:00 constraint
const oldCardHint = `<p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Set the base time and interval. Candidates in the queue will be automatically assigned sequential time slots to avoid overlap.</p>`;
const newCardHint = `<p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Atur jam mulai dan interval. Sesi terakhir dalam 1 hari dibatasi hingga <strong>15:00 WIB</strong> (sesi setelahnya otomatis bergulir ke hari kerja berikutnya, Minggu libur).</p>`;

if (code.includes(oldCardHint)) {
  code = code.replace(oldCardHint, newCardHint);
  console.log('✅ 6. Smart Scheduling card description updated with 15:00 cutoff info');
}

// 7. Ensure Ghayu (09:00) and Sri (13:00) in initial data synchronization
const oldGhayuFix = `    // Ghayu Rivanda slot 09:00 normalization
    if (state.talents) {
      const ghayu = state.talents.find(t => (t.id === 'PGE-052' || (t.name && t.name.includes('Ghayu'))));
      if (ghayu) {
        if (!state.smartScheduleMap) state.smartScheduleMap = {};
        state.smartScheduleMap[ghayu.id] = '09:00 WIB';
        if (ghayu.notes && ghayu.notes.includes('13:00 WIB')) {
          ghayu.notes = ghayu.notes.replace(/13:00\\s*WIB/g, '09:00 WIB');
        }
      }
    }`;

const newGhayuFix = `    // Ghayu Rivanda (09:00) and Sri Purwanti (13:00) persistent slot normalization
    if (state.talents) {
      if (!state.smartScheduleMap) state.smartScheduleMap = {};
      if (!state.smartScheduleDates) state.smartScheduleDates = {};

      const ghayu = state.talents.find(t => (t.id === 'PGE-052' || (t.name && t.name.includes('Ghayu'))));
      if (ghayu) {
        state.smartScheduleMap[ghayu.id] = '09:00 WIB';
        state.smartScheduleDates[ghayu.id] = 'Rabu, 16 September 2026';
        if (ghayu.notes && ghayu.notes.includes('13:00 WIB')) {
          ghayu.notes = ghayu.notes.replace(/13:00\\s*WIB/g, '09:00 WIB');
        }
      }

      const sri = state.talents.find(t => (t.id === 'PGE-057' || (t.name && t.name.includes('Sri Purwanti'))));
      if (sri) {
        state.smartScheduleMap[sri.id] = '13:00 WIB';
        state.smartScheduleDates[sri.id] = 'Rabu, 16 September 2026';
      }

      const meiva = state.talents.find(t => (t.id === 'PGE-058' || (t.name && t.name.includes('Meiva'))));
      if (meiva && meiva.outreachStatus === 'Pending') {
        // If Meiva was accidentally set to 09:00 WIB, clear it or set to next available (11:00 WIB)
        if (state.smartScheduleMap[meiva.id] === '09:00 WIB') {
          state.smartScheduleMap[meiva.id] = '11:00 WIB';
          state.smartScheduleDates[meiva.id] = 'Rabu, 16 September 2026';
        }
      }
    }`;

if (code.includes(oldGhayuFix)) {
  code = code.replace(oldGhayuFix, newGhayuFix);
  console.log('✅ 7. Ghayu (09:00), Sri (13:00), Meiva (11:00) normalization updated');
} else {
  console.warn('⚠️ 7. oldGhayuFix not found');
}

if (isCrlf) {
  code = code.replace(/\n/g, '\r\n');
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('🎉 Successfully saved multi-day 15:00 cutoff & Sunday skip changes to public/index.html');
