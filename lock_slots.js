const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Add "Recalculate Slots" button in Tab 1 header
const headerTarget = `<div style="display: flex; align-items: center; gap: 12px;">
                <select id="bcStageFilter" class="form-select" onchange="renderBroadcastTable()" style="font-size: 12px; padding: 6px 12px;">`;

const headerReplacement = `<div style="display: flex; align-items: center; gap: 10px;">
                <select id="bcStageFilter" class="form-select" onchange="renderBroadcastTable()" style="font-size: 12px; padding: 6px 10px;">`;

const selectEndTarget = `</select>
                <div style="font-family: var(--font-mono); font-size: 12px;">
                  Queue: <span id="bcQueueCount" style="font-weight: 600; color: #16A34A;">0</span> selected
                </div>`;

const selectEndReplacement = `</select>
                <button type="button" class="btn btn-secondary btn-sm" onclick="recalculateBroadcastSlots(true)" title="Hitung ulang jam interview berurutan dari jam awal" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; padding: 6px 12px; font-weight: 500; cursor: pointer;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                  Recalculate Slots
                </button>
                <div style="font-family: var(--font-mono); font-size: 12px;">
                  Queue: <span id="bcQueueCount" style="font-weight: 600; color: #16A34A;">0</span> selected
                </div>`;

if (html.includes(selectEndTarget)) {
  html = html.replace(headerTarget, headerReplacement);
  html = html.replace(selectEndTarget, selectEndReplacement);
  console.log('Recalculate Slots button added to Tab 1 header.');
} else {
  console.error('selectEndTarget NOT found!');
}

// 2. Add recalculateBroadcastSlots function and update handleSaveScheduleSettings
const oldHandleSaveSchedule = `function handleSaveScheduleSettings() {
      const ok = saveBcSettings();
      renderBroadcastTable();
      if (ok) {
        showToast('✅ Pengaturan jadwal & interval berhasil disimpan!');
      } else {
        showToast('⚠️ Gagal menyimpan pengaturan jadwal.');
      }
    }`;

const newHandleSaveSchedule = `function recalculateBroadcastSlots(notify = true) {
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
    }
    window.recalculateBroadcastSlots = recalculateBroadcastSlots;

    function handleSaveScheduleSettings() {
      const ok = saveBcSettings();
      recalculateBroadcastSlots(false);
      if (ok) {
        showToast('✅ Pengaturan jadwal & interval disimpan, slot dihitung ulang!');
      } else {
        showToast('⚠️ Gagal menyimpan pengaturan jadwal.');
      }
    }`;

if (html.includes(oldHandleSaveSchedule)) {
  html = html.replace(oldHandleSaveSchedule, newHandleSaveSchedule);
  console.log('recalculateBroadcastSlots and updated handleSaveScheduleSettings injected.');
} else {
  console.error('oldHandleSaveSchedule NOT found!');
}

// 3. Update renderBroadcastTable slot locking logic
const oldScheduleAssignment = `      // Calculate smart schedule assignments for selected talents
      const selectedTalents = targetTalents.filter(t => state.broadcastSelectedIds.has(t.id));
      const scheduleMap = {};
      selectedTalents.forEach((t, i) => { scheduleMap[t.id] = calculateSmartTime(i); });
      state.smartScheduleMap = scheduleMap;`;

const newScheduleAssignment = `      // Calculate smart schedule assignments with LOCKED slots (prevents shifting when candidates are chatted)
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

if (html.includes(oldScheduleAssignment)) {
  html = html.replace(oldScheduleAssignment, newScheduleAssignment);
  console.log('Locked slot logic injected into renderBroadcastTable.');
} else {
  console.error('oldScheduleAssignment NOT found!');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('public/index.html updated successfully.');
