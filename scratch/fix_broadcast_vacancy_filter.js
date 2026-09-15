const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../public/index.html');
let raw = fs.readFileSync(targetFile, 'utf8');
const isCrlf = raw.includes('\r\n');
let code = raw.replace(/\r\n/g, '\n');

// 1. Update Broadcast Outreach Queue header to include the active vacancy badge
const oldHeader = `<h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary);">Broadcast Outreach Queue</h3>`;
const newHeader = `<h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  Broadcast Outreach Queue
                  <span id="bcActiveVacancyBadge" style="font-size: 11px; font-weight: 600; color: #2563EB; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 2px 8px; border-radius: 6px;"></span>
                </h3>`;

if (code.includes(oldHeader)) {
  code = code.replace(oldHeader, newHeader);
  console.log('✅ 1. Broadcast Header updated with vacancy badge');
} else {
  console.log('ℹ️ 1. Broadcast Header already updated or not found');
}

// 2. Update state to include broadcastCurrentVacancy & broadcastUserExplicitlyCleared
if (!code.includes('broadcastCurrentVacancy')) {
  const oldStateBroadcast = `broadcastSelectedIds: new Set(),`;
  const newStateBroadcast = `broadcastSelectedIds: new Set(),
      broadcastCurrentVacancy: null,
      broadcastUserExplicitlyCleared: false,`;
  if (code.includes(oldStateBroadcast)) {
    code = code.replace(oldStateBroadcast, newStateBroadcast);
    console.log('✅ 2. state updated with broadcastCurrentVacancy tracking');
  }
} else {
  console.log('ℹ️ 2. state already has broadcastCurrentVacancy');
}

// 3. Update recalculateBroadcastSlots to use getVacancyFilteredTalents()
const oldRecalc = `    function recalculateBroadcastSlots(notify = true) {
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';
      const targetTalents = state.talents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });`;

const newRecalc = `    function recalculateBroadcastSlots(notify = true) {
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';
      const baseTalents = typeof getVacancyFilteredTalents === 'function' ? getVacancyFilteredTalents() : state.talents;
      const targetTalents = baseTalents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });`;

if (code.includes(oldRecalc)) {
  code = code.replace(oldRecalc, newRecalc);
  console.log('✅ 3. recalculateBroadcastSlots updated with vacancy filtering');
} else {
  console.warn('⚠️ 3. oldRecalc not found');
}

// 4. Update selectVacancy to reset broadcastCurrentVacancy
const oldSelectVacancy = `    function selectVacancy(vacancyName) {
      state.activeVacancy = vacancyName;
      try {
        localStorage.setItem('pge_active_vacancy', vacancyName);
      } catch (e) {}`;

const newSelectVacancy = `    function selectVacancy(vacancyName) {
      state.activeVacancy = vacancyName;
      state.broadcastCurrentVacancy = null;
      state.broadcastSelectedIds.clear();
      state.broadcastUserExplicitlyCleared = false;
      try {
        localStorage.setItem('pge_active_vacancy', vacancyName);
      } catch (e) {}`;

if (code.includes(oldSelectVacancy)) {
  code = code.replace(oldSelectVacancy, newSelectVacancy);
  console.log('✅ 4. selectVacancy updated to sync broadcast queue');
} else {
  console.warn('⚠️ 4. oldSelectVacancy not found');
}

// 5. Update renderBroadcastTable
const oldRenderBcTarget = `    function renderBroadcastTable() {
      if (!el.bcTableBody) return;
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';

      const targetTalents = state.talents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });

      if (state.broadcastSelectedIds.size === 0) {
        targetTalents.forEach(t => state.broadcastSelectedIds.add(t.id));
      }

      if (el.bcQueueCount) el.bcQueueCount.textContent = targetTalents.length;`;

const newRenderBcTarget = `    function renderBroadcastTable() {
      if (!el.bcTableBody) return;
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';

      const baseTalents = typeof getVacancyFilteredTalents === 'function' ? getVacancyFilteredTalents() : state.talents;
      const targetTalents = baseTalents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });

      // Synchronize selection with active vacancy
      if (state.broadcastCurrentVacancy !== state.activeVacancy) {
        state.broadcastCurrentVacancy = state.activeVacancy;
        state.broadcastSelectedIds.clear();
        state.broadcastUserExplicitlyCleared = false;
        targetTalents.forEach(t => state.broadcastSelectedIds.add(t.id));
      } else if (state.broadcastSelectedIds.size === 0 && targetTalents.length > 0 && !state.broadcastUserExplicitlyCleared) {
        targetTalents.forEach(t => state.broadcastSelectedIds.add(t.id));
      }

      // Update active vacancy badge in Broadcast UI
      const bcActiveBadge = document.getElementById('bcActiveVacancyBadge');
      if (bcActiveBadge) {
        const vName = (state.activeVacancy === 'ALL' || !state.activeVacancy || state.activeVacancy === 'HUB') ? 'Semua Lowongan' : state.activeVacancy;
        bcActiveBadge.textContent = vName;
      }

      const selectedTalents = targetTalents.filter(t => state.broadcastSelectedIds.has(t.id));

      if (el.bcQueueCount) el.bcQueueCount.textContent = selectedTalents.length;

      const bcSelectAll = document.getElementById('bcSelectAll');
      if (bcSelectAll) {
        bcSelectAll.checked = targetTalents.length > 0 && selectedTalents.length === targetTalents.length;
        bcSelectAll.indeterminate = selectedTalents.length > 0 && selectedTalents.length < targetTalents.length;
      }`;

if (code.includes(oldRenderBcTarget)) {
  code = code.replace(oldRenderBcTarget, newRenderBcTarget);
  console.log('✅ 5. renderBroadcastTable targetTalents & selection sync updated');
} else {
  console.warn('⚠️ 5. oldRenderBcTarget not found');
}

// 6. Empty state was already inserted in step 6 previously if present
console.log('ℹ️ 6. Empty state check: already has empty state?', code.includes('Tidak ada kandidat untuk lowongan ini'));

// 7. Update toggleBroadcastSelect and toggleSelectAllBroadcast
const oldToggleBc = `    function toggleBroadcastSelect(id) {
      if (state.broadcastSelectedIds.has(id)) {
        state.broadcastSelectedIds.delete(id);
      } else {
        state.broadcastSelectedIds.add(id);
      }
    }

    function toggleSelectAllBroadcast(isChecked) {
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';
      const targetTalents = state.talents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });

      if (isChecked) {
        targetTalents.forEach(t => state.broadcastSelectedIds.add(t.id));
      } else {
        state.broadcastSelectedIds.clear();
      }
      renderBroadcastTable();
    }`;

const newToggleBc = `    function toggleBroadcastSelect(id) {
      if (state.broadcastSelectedIds.has(id)) {
        state.broadcastSelectedIds.delete(id);
      } else {
        state.broadcastSelectedIds.add(id);
      }
      state.broadcastUserExplicitlyCleared = (state.broadcastSelectedIds.size === 0);
      renderBroadcastTable();
    }

    function toggleSelectAllBroadcast(isChecked) {
      const filterStage = el.bcStageFilter ? el.bcStageFilter.value : 'ALL';
      const baseTalents = typeof getVacancyFilteredTalents === 'function' ? getVacancyFilteredTalents() : state.talents;
      const targetTalents = baseTalents.filter(t => {
        if (t.stage === 'Archived') return false;
        if (filterStage !== 'ALL' && t.stage !== filterStage) return false;
        return true;
      });

      if (isChecked) {
        state.broadcastUserExplicitlyCleared = false;
        targetTalents.forEach(t => state.broadcastSelectedIds.add(t.id));
      } else {
        state.broadcastUserExplicitlyCleared = true;
        targetTalents.forEach(t => state.broadcastSelectedIds.delete(t.id));
      }
      renderBroadcastTable();
    }`;

if (code.includes(oldToggleBc)) {
  code = code.replace(oldToggleBc, newToggleBc);
  console.log('✅ 7. toggleBroadcastSelect & toggleSelectAllBroadcast updated');
} else {
  console.warn('⚠️ 7. oldToggleBc not found');
}

if (isCrlf) {
  code = code.replace(/\n/g, '\r\n');
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('🎉 Successfully saved all changes to public/index.html');
