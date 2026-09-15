const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../public/index.html');
let raw = fs.readFileSync(targetFile, 'utf8');
const isCrlf = raw.includes('\r\n');
let code = raw.replace(/\r\n/g, '\n');

// 1. Insert the Tentative Conflict Modal HTML before finalScheduleModalBackdrop
const modalHtml = `  <!-- Tentative WA Sent Conflict Resolution Modal -->
  <div class="modal-backdrop" id="tentativeConflictModalBackdrop" style="display: none; z-index: 2200; align-items: center; justify-content: center;" onclick="if(event.target === this) closeTentativeConflictModal()">
    <div class="modal-card" style="max-width: 520px; width: 92%; padding: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
      <div class="modal-header" style="background: #FFFBEB; border-bottom: 1.5px solid #FDE68A; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: #F59E0B; color: #FFF; font-size: 18px;">⏳</span>
          <div>
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #B45309;">
              Peringatan Slot Waktu
            </div>
            <h3 style="font-size: 16px; font-weight: 700; color: #78350F; margin: 0;">
              Slot Jam Menunggu Konfirmasi (Tentative)
            </h3>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-icon" onclick="closeTentativeConflictModal()" style="cursor: pointer;">✕</button>
      </div>
      
      <div class="modal-body" style="padding: 20px; background: #FFFFFF;">
        <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
          Slot waktu pada <strong id="tcModalSlotTime" style="color: #1E40AF;">09:00 WIB</strong> saat ini sedang ditawarkan ke kandidat lain via WhatsApp, namun <strong>belum dikonfirmasi kehadiran</strong>.
        </div>

        <!-- Comparison Cards -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          <!-- Existing Holder -->
          <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
              <div>
                <span style="font-size: 10px; font-family: var(--font-mono); font-weight: 700; color: #92400E; text-transform: uppercase;">Pemegang Slot Saat Ini:</span>
                <div id="tcModalHolderName" style="font-weight: 700; font-size: 14px; color: #78350F; margin-top: 2px;">-</div>
                <div id="tcModalHolderRole" style="font-size: 11.5px; color: #B45309;">-</div>
              </div>
              <span class="outreach-status-pill status-wa-sent" style="font-size: 11px; flex-shrink: 0;">💬 WA Sent (Belum Konfirmasi)</span>
            </div>
          </div>

          <!-- New Target Candidate -->
          <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
              <div>
                <span style="font-size: 10px; font-family: var(--font-mono); font-weight: 700; color: #1E40AF; text-transform: uppercase;">Kandidat Baru yang Mengantre:</span>
                <div id="tcModalTargetName" style="font-weight: 700; font-size: 14px; color: #1E3A8A; margin-top: 2px;">-</div>
                <div id="tcModalTargetRole" style="font-size: 11.5px; color: #2563EB;">-</div>
              </div>
              <span class="outreach-status-pill status-pending" style="font-size: 11px; flex-shrink: 0;">⏳ Menunggu Jadwal</span>
            </div>
          </div>
        </div>

        <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px;">
          Pilih tindakan penjadwalan:
        </div>

        <!-- Action Options -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button type="button" id="tcBtnShift" class="btn btn-primary" onclick="actionTentativeShift()" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #2563EB; border-color: #2563EB; color: #FFF; text-align: left; cursor: pointer;">
            <div>
              <div style="font-weight: 600; font-size: 13px;">⏭️ Geser Kandidat Baru ke Jam Kosong Berikutnya</div>
              <div style="font-size: 11px; opacity: 0.9; margin-top: 2px;">Pertahankan slot kandidat lama, alokasikan kandidat baru ke jam bebas berikutnya</div>
            </div>
            <span style="font-size: 16px;">→</span>
          </button>

          <button type="button" id="tcBtnOverride" class="btn btn-secondary" onclick="actionTentativeOverride()" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #FFF; border: 1.5px solid #F59E0B; color: #B45309; text-align: left; cursor: pointer;">
            <div>
              <div style="font-weight: 600; font-size: 13px;">⚡ Ambil Alih Slot Jam Ini</div>
              <div style="font-size: 11px; color: #92400E; margin-top: 2px;">Tandai kandidat lama sebagai "Tidak Hadir / Batal", dan berikan jam ini ke kandidat baru</div>
            </div>
            <span style="font-size: 16px;">✓</span>
          </button>

          <button type="button" id="tcBtnDual" class="btn btn-secondary" onclick="actionTentativeProceedDual()" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; font-size: 12px; color: var(--text-secondary); cursor: pointer;">
            <span>💬 Tetap Kirim WA Bersamaan (Wawancara Panel / Jam Sama)</span>
            <span style="font-size: 14px;">↗</span>
          </button>
        </div>
      </div>

      <div class="modal-footer" style="padding: 12px 20px; background: #F8FAFC; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end;">
        <button type="button" class="btn btn-secondary" onclick="closeTentativeConflictModal()">Batal</button>
      </div>
    </div>
  </div>\n\n`;

const anchorModal = `  <!-- Final Interview Schedule Modal -->`;
if (!code.includes('tentativeConflictModalBackdrop')) {
  if (code.includes(anchorModal)) {
    code = code.replace(anchorModal, modalHtml + anchorModal);
    console.log('✅ 1. Tentative Conflict Modal HTML inserted');
  } else {
    console.warn('⚠️ 1. anchorModal not found');
  }
} else {
  console.log('ℹ️ 1. Tentative Conflict Modal HTML already present');
}

// 2. Enhance detectScheduleConflicts to return hardConflicts & tentativeConflicts
const oldDetectConflicts = `    function detectScheduleConflicts() {
      const timeCounts = {};
      (state.talents || []).forEach(t => {
        const sched = getTalentAssignedSchedule(t);
        if (sched.displayDate && sched.displayDate !== '-' && sched.assignedTime && sched.assignedTime !== '-') {
          const key = sched.displayDate + '__' + sched.assignedTime;
          if (!timeCounts[key]) timeCounts[key] = [];
          timeCounts[key].push({ id: t.id, name: t.name, status: t.outreachStatus, isRescheduled: sched.isRescheduled });
        }
      });

      const conflicts = {};
      Object.values(timeCounts).forEach(list => {
        // Collision (tabrakan) ONLY occurs if 2 or more candidates have actually CONFIRMED attendance
        // (status 'Confirmed' or agreed 'Reschedule').
        // If a candidate is merely 'WA Sent' or 'Pending', they have NOT confirmed attendance yet,
        // so it does not count as a conflict.
        const confirmedAttendees = list.filter(item => item.status === 'Confirmed' || item.status === 'Reschedule');

        if (confirmedAttendees.length > 1) {
          confirmedAttendees.forEach(item => {
            conflicts[item.id] = confirmedAttendees.filter(other => other.id !== item.id);
          });
        }
      });
      return conflicts;
    }`;

const newDetectConflicts = `    function detectScheduleConflicts() {
      const timeCounts = {};
      (state.talents || []).forEach(t => {
        const sched = getTalentAssignedSchedule(t);
        if (sched.displayDate && sched.displayDate !== '-' && sched.assignedTime && sched.assignedTime !== '-') {
          const key = sched.displayDate + '__' + sched.assignedTime;
          if (!timeCounts[key]) timeCounts[key] = [];
          timeCounts[key].push({ 
            id: t.id, 
            name: t.name, 
            role: t.role || 'Freelance Content Creator', 
            status: t.outreachStatus, 
            isRescheduled: sched.isRescheduled,
            displayDate: sched.displayDate,
            assignedTime: sched.assignedTime
          });
        }
      });

      const conflicts = {};
      const tentativeConflicts = {};
      const allSlotHolders = timeCounts;

      Object.entries(timeCounts).forEach(([key, list]) => {
        // Hard collision: 2 or more candidates confirmed or agreed reschedule
        const confirmedAttendees = list.filter(item => item.status === 'Confirmed' || item.status === 'Reschedule');
        if (confirmedAttendees.length > 1) {
          confirmedAttendees.forEach(item => {
            conflicts[item.id] = confirmedAttendees.filter(other => other.id !== item.id);
          });
        }

        // Tentative collision: any candidate sharing slot with a candidate who has WA Sent
        const waSentAttendees = list.filter(item => item.status === 'WA Sent');
        if (waSentAttendees.length > 0 && list.length > 1) {
          list.forEach(item => {
            const othersWithWa = waSentAttendees.filter(other => other.id !== item.id);
            if (othersWithWa.length > 0) {
              tentativeConflicts[item.id] = othersWithWa;
            }
          });
        }
      });

      conflicts.hardConflicts = conflicts;
      conflicts.tentativeConflicts = tentativeConflicts;
      conflicts.allSlotHolders = allSlotHolders;
      return conflicts;
    }`;

if (code.includes(oldDetectConflicts)) {
  code = code.replace(oldDetectConflicts, newDetectConflicts);
  console.log('✅ 2. detectScheduleConflicts enhanced with tentative conflicts');
} else {
  console.warn('⚠️ 2. oldDetectConflicts not found');
}

// 3. Update recalculateBroadcastSlots to auto-skip across all vacancies
const oldRecalcBody = `      let slotIdx = 0;
      selectedTalents.forEach(t => {
        if (t.outreachStatus === 'Reschedule') {
          // Exempt rescheduled candidates from standard sequential slotting
          return;
        }
        state.smartScheduleSlotIndex[t.id] = slotIdx;
        state.smartScheduleMap[t.id] = calculateSmartTime(slotIdx);
        slotIdx++;
      });`;

const newRecalcBody = `      const currentDateVal = formatDisplayDate(document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '');
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

if (code.includes(oldRecalcBody)) {
  code = code.replace(oldRecalcBody, newRecalcBody);
  console.log('✅ 3. recalculateBroadcastSlots auto-skip updated');
} else {
  console.warn('⚠️ 3. oldRecalcBody not found');
}

// 4. Update renderBroadcastTable auto-skip and occupiedTimes
const oldRenderBcOccupied = `      // Gather all hard-locked occupied times (Tier 1: Rescheduled/Confirmed, Tier 2: Already Sent)
      const occupiedTimes = new Set();
      (state.talents || []).forEach(other => {
        if (other.outreachStatus === 'Reschedule' || other.outreachStatus === 'Confirmed') {
          const s = getTalentAssignedSchedule(other);
          if (s.assignedTime && s.assignedTime !== '-') occupiedTimes.add(s.assignedTime);
        }
      });`;

const newRenderBcOccupied = `      // Gather all occupied times across ALL vacancies for the selected interview date
      const currentDateVal = formatDisplayDate(document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '');
      const occupiedTimes = new Set();

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
      });`;

if (code.includes(oldRenderBcOccupied)) {
  code = code.replace(oldRenderBcOccupied, newRenderBcOccupied);
  console.log('✅ 4. renderBroadcastTable occupiedTimes cross-vacancy updated');
} else {
  console.warn('⚠️ 4. oldRenderBcOccupied not found');
}

// 5. Update schedule column in renderBroadcastTable to show tentative badge & Kelola button
const oldScheduleTd = `            <td>
              \${(detectScheduleConflicts()[talent.id]) ? \`
                <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #DC2626; background: #FEE2E2; border: 1px solid #FCA5A5; padding: 2px 6px; border-radius: 4px; display: inline-block;">
                  ⚠️ \${assignedTime} (Bentrok)
                </div>
              \` : \`
                <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: \${isRescheduled ? '#D97706' : '#1E40AF'};">
                  \${isRescheduled ? '🔄 ' : ''}\${assignedTime}
                </div>
              \`}
              <div style="font-size: 11px; color: \${isRescheduled ? '#B45309' : 'var(--text-secondary)'};">\${displayDate}</div>
            </td>`;

const newScheduleTd = `            <td>
              \${(() => {
                const conf = detectScheduleConflicts();
                const hard = conf[talent.id];
                const tent = conf.tentativeConflicts ? conf.tentativeConflicts[talent.id] : null;

                if (hard && hard.length > 0) {
                  return \`
                    <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #DC2626; background: #FEE2E2; border: 1px solid #FCA5A5; padding: 2px 6px; border-radius: 4px; display: inline-block;">
                      ⚠️ \${assignedTime} (Bentrok)
                    </div>
                  \`;
                } else if (tent && tent.length > 0 && talent.outreachStatus !== 'WA Sent') {
                  const holder = tent[0];
                  return \`
                    <div style="display: inline-flex; flex-direction: column; gap: 4px;">
                      <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: #92400E; background: #FEF3C7; border: 1px solid #FCD34D; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                        ⏳ \${assignedTime} (Menunggu Konfirmasi)
                      </div>
                      <button type="button" class="btn btn-secondary btn-xs" onclick="openTentativeConflictModal('\${talent.id}', '\${holder.id}')" style="font-size: 10.5px; padding: 2px 6px; color: #B45309; border-color: #FCD34D; background: #FFFBEB; border-radius: 4px; cursor: pointer;">
                        ℹ️ Detail &amp; Kelola Slot
                      </button>
                    </div>
                  \`;
                } else if (talent.outreachStatus === 'WA Sent') {
                  return \`
                    <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: #D97706;">
                      💬 \${assignedTime}
                    </div>
                  \`;
                } else {
                  return \`
                    <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: \${isRescheduled ? '#D97706' : '#1E40AF'};">
                      \${isRescheduled ? '🔄 ' : ''}\${assignedTime}
                    </div>
                  \`;
                }
              })()}
              <div style="font-size: 11px; color: \${isRescheduled ? '#B45309' : 'var(--text-secondary)'};">\${displayDate}</div>
            </td>`;

if (code.includes(oldScheduleTd)) {
  code = code.replace(oldScheduleTd, newScheduleTd);
  console.log('✅ 5. Schedule TD column updated with tentative badge & button');
} else {
  console.warn('⚠️ 5. oldScheduleTd not found');
}

// 6. Insert Tentative Modal JS Handlers and intercept sendBroadcastSingle
const oldSendBroadcastSingle = `    async function sendBroadcastSingle(talentId) {
      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (!talent) return;
      const phone = formatToInternationalPhone(talent.phone);
      if (!phone) {
        showToast('Candidate does not have a valid WhatsApp number');
        return;
      }`;

const newSendBroadcastSingle = `    let activeTentativeContext = null;

    function openTentativeConflictModal(targetTalentId, existingHolderId) {
      const target = state.talents.find(t => t.id === targetTalentId || t.$id === targetTalentId);
      const holder = state.talents.find(t => t.id === existingHolderId || t.$id === existingHolderId);
      if (!target || !holder) return;

      const schedTarget = getTalentAssignedSchedule(target);
      const schedHolder = getTalentAssignedSchedule(holder);
      const slotTime = schedTarget.assignedTime || schedHolder.assignedTime || '-';
      const slotDate = schedTarget.displayDate || schedHolder.displayDate || '-';

      activeTentativeContext = {
        targetTalentId,
        existingHolderId,
        slotTime,
        slotDate
      };

      const elSlotTime = document.getElementById('tcModalSlotTime');
      const elHolderName = document.getElementById('tcModalHolderName');
      const elHolderRole = document.getElementById('tcModalHolderRole');
      const elTargetName = document.getElementById('tcModalTargetName');
      const elTargetRole = document.getElementById('tcModalTargetRole');

      if (elSlotTime) elSlotTime.textContent = slotTime + ' (' + slotDate + ')';
      if (elHolderName) elHolderName.textContent = holder.name + ' (' + holder.id + ')';
      if (elHolderRole) elHolderRole.textContent = (holder.role || 'Freelance Content Creator') + ' • Domisili: ' + (holder.domisili || '-');
      if (elTargetName) elTargetName.textContent = target.name + ' (' + target.id + ')';
      if (elTargetRole) elTargetRole.textContent = (target.role || 'Freelance Content Creator') + ' • Domisili: ' + (target.domisili || '-');

      const modal = document.getElementById('tentativeConflictModalBackdrop');
      if (modal) modal.style.display = 'flex';
    }
    window.openTentativeConflictModal = openTentativeConflictModal;

    function closeTentativeConflictModal() {
      const modal = document.getElementById('tentativeConflictModalBackdrop');
      if (modal) modal.style.display = 'none';
      activeTentativeContext = null;
    }
    window.closeTentativeConflictModal = closeTentativeConflictModal;

    function actionTentativeShift() {
      if (!activeTentativeContext) return;
      const { targetTalentId, slotDate } = activeTentativeContext;
      const target = state.talents.find(t => t.id === targetTalentId || t.$id === targetTalentId);
      if (!target) return;

      const occupiedTimes = new Set();
      (state.talents || []).forEach(other => {
        if (other.id === targetTalentId) return;
        const s = getTalentAssignedSchedule(other);
        const oDate = s.displayDate || slotDate;
        if (oDate === slotDate && s.assignedTime && s.assignedTime !== '-') {
          if (['Confirmed', 'Reschedule', 'WA Sent'].includes(other.outreachStatus)) {
            occupiedTimes.add(s.assignedTime);
          }
        }
      });

      let nextSlot = 0;
      let newTime = calculateSmartTime(nextSlot);
      while (occupiedTimes.has(newTime)) {
        nextSlot++;
        newTime = calculateSmartTime(nextSlot);
      }

      state.smartScheduleMap[targetTalentId] = newTime;
      if (state.smartScheduleSlotIndex) state.smartScheduleSlotIndex[targetTalentId] = nextSlot;

      try {
        localStorage.setItem('pge_smart_schedule_map', JSON.stringify(state.smartScheduleMap));
        if (state.smartScheduleSlotIndex) {
          localStorage.setItem('pge_smart_slot_indices', JSON.stringify(state.smartScheduleSlotIndex));
        }
      } catch (e) {}

      closeTentativeConflictModal();
      renderBroadcastTable();
      showToast('✅ Jam untuk ' + target.name + ' digeser ke slot bebas berikutnya: ' + newTime);
    }
    window.actionTentativeShift = actionTentativeShift;

    async function actionTentativeOverride() {
      if (!activeTentativeContext) return;
      const { targetTalentId, existingHolderId, slotTime } = activeTentativeContext;
      const target = state.talents.find(t => t.id === targetTalentId || t.$id === targetTalentId);
      const holder = state.talents.find(t => t.id === existingHolderId || t.$id === existingHolderId);
      if (!target || !holder) return;

      // 1. Mark existing holder as 'Tidak Hadir'
      holder.outreachStatus = 'Tidak Hadir';
      holder.notes = (holder.notes || '') + '\\n[Slot ' + slotTime + ' dialihkan ke ' + target.name + ' karena tidak ada konfirmasi WA]';

      // 2. Assign slot to target
      state.smartScheduleMap[targetTalentId] = slotTime;

      try {
        localStorage.setItem('pge_smart_schedule_map', JSON.stringify(state.smartScheduleMap));
      } catch (e) {}

      // Update holder in Appwrite Cloud
      try {
        const docId = holder.$id || (holder.id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        const packedNotes = packOutreachStatus(holder.notes, 'Tidak Hadir');
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          docId,
          { notes: packedNotes }
        );
      } catch (err) {
        console.warn('Update holder error:', err);
      }

      closeTentativeConflictModal();
      renderBroadcastTable();
      showToast('⚡ Slot ' + slotTime + ' berhasil dialihkan ke ' + target.name + '. Status ' + holder.name + ' diubah menjadi Tidak Hadir.');
    }
    window.actionTentativeOverride = actionTentativeOverride;

    function actionTentativeProceedDual() {
      if (!activeTentativeContext) return;
      const { targetTalentId } = activeTentativeContext;
      closeTentativeConflictModal();
      executeActualSendBroadcast(targetTalentId);
    }
    window.actionTentativeProceedDual = actionTentativeProceedDual;

    async function sendBroadcastSingle(talentId) {
      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (!talent) return;
      const phone = formatToInternationalPhone(talent.phone);
      if (!phone) {
        showToast('Candidate does not have a valid WhatsApp number');
        return;
      }

      // Check tentative conflict before opening WA
      const conflicts = detectScheduleConflicts();
      const tent = conflicts.tentativeConflicts ? conflicts.tentativeConflicts[talent.id] : null;
      if (tent && tent.length > 0 && talent.outreachStatus !== 'WA Sent') {
        openTentativeConflictModal(talent.id, tent[0].id);
        return;
      }

      executeActualSendBroadcast(talentId);
    }

    async function executeActualSendBroadcast(talentId) {
      const talent = state.talents.find(t => t.id === talentId || t.$id === talentId);
      if (!talent) return;
      const phone = formatToInternationalPhone(talent.phone);
      if (!phone) {
        showToast('Candidate does not have a valid WhatsApp number');
        return;
      }`;

if (code.includes(oldSendBroadcastSingle)) {
  code = code.replace(oldSendBroadcastSingle, newSendBroadcastSingle);
  console.log('✅ 6. sendBroadcastSingle intercepted & tentative handlers added');
} else {
  console.warn('⚠️ 6. oldSendBroadcastSingle not found');
}

if (isCrlf) {
  code = code.replace(/\n/g, '\r\n');
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('🎉 Successfully saved tentative scheduling updates to public/index.html');
