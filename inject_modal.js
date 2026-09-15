const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Inject Modal HTML
const modalHtml = `
  <!-- Reschedule Modal -->
  <div class="modal-backdrop" id="rescheduleModalBackdrop" style="display: none; z-index: 2000;" onclick="if(event.target === this) closeRescheduleModal()">
    <div class="modal-card" style="max-width: 400px;">
      <div class="modal-header">
        <div>
          <span style="font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; color: var(--text-muted);">Update Schedule</span>
          <h2 style="font-size: 18px; font-weight: 600; color: var(--text-primary);">Reschedule Interview</h2>
        </div>
        <button type="button" class="btn btn-secondary btn-icon" onclick="closeRescheduleModal()">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
          Enter the new agreed date and time for the candidate. This will be recorded in their profile notes.
        </p>
        <div class="form-group">
          <label class="form-label">New Date</label>
          <input type="date" id="rescheduleDate" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">New Time</label>
          <input type="time" id="rescheduleTime" class="form-input">
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 8px;">
        <button type="button" class="btn btn-secondary" onclick="closeRescheduleModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="submitReschedule()" style="background: #D97706; color: white; border-color: #D97706;">Save Reschedule</button>
      </div>
    </div>
  </div>
`;
html = html.replace(/<!-- Candidate Comparison Modal -->/, modalHtml + '\n  <!-- Candidate Comparison Modal -->');

// 2. Inject Modal JS
const modalJs = `
    let currentRescheduleId = null;
    function openRescheduleModal(id) {
      currentRescheduleId = id;
      document.getElementById('rescheduleDate').value = '';
      document.getElementById('rescheduleTime').value = '';
      document.getElementById('rescheduleModalBackdrop').style.display = 'flex';
    }
    window.closeRescheduleModal = function() {
      currentRescheduleId = null;
      document.getElementById('rescheduleModalBackdrop').style.display = 'none';
      renderBroadcastTable();
    };
    window.submitReschedule = async function() {
      if (!currentRescheduleId) return;
      const dateVal = document.getElementById('rescheduleDate').value;
      const timeVal = document.getElementById('rescheduleTime').value;
      if (!dateVal || !timeVal) {
        showToast('Please fill in both date and time');
        return;
      }
      
      const target = state.talents.find(t => t.id === currentRescheduleId || t.$id === currentRescheduleId);
      if (!target) return;
      
      const displayDate = formatDisplayDate(dateVal);
      const remark = \`\\n[Rescheduled to: \${displayDate} \${timeVal} WIB]\`;
      const updatedNotes = (target.notes || '') + remark;
      
      target.outreachStatus = 'Reschedule';
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
      }
    };
`;
html = html.replace(/function updateOutreachStatus\(/, modalJs + '\n    async function updateOutreachStatus(');

// 3. Intercept 'Reschedule' inside updateOutreachStatus
const interceptJs = `
      if (newStatus === 'Reschedule') {
        openRescheduleModal(id);
        return;
      }
`;
html = html.replace(
  /async function updateOutreachStatus\(id, newStatus\) \{/,
  `async function updateOutreachStatus(id, newStatus) {` + interceptJs
);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Reschedule modal injected.');
