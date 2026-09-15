const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Fix Mojibake in tabs
html = html.replace(/dY"s 1\. Candidate Queue/, '1. Candidate Queue');
html = html.replace(/dY"Z 2\. Smart Scheduling/, '2. Smart Scheduling');
html = html.replace(/dY' 3\. Message Template/, '3. Message Template');
html = html.replace(/dY"Z Smart Scheduling Parameters/, '⚙️ Smart Scheduling Parameters');
html = html.replace(/dY' Custom Message Box/, '📝 Custom Message Box');
html = html.replace(/dY' Variabel di atas/, '💡 Variabel di atas');

// 2. Add outreach-status-pill CSS
const cssToInsert = `
    .outreach-status-pill {
      appearance: none;
      background-color: var(--bg-element);
      border: 1px solid var(--border-light);
      border-radius: 999px;
      padding: 4px 20px 4px 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      font-family: var(--font-sans);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 6px center;
      transition: all 0.2s ease;
    }
    .outreach-status-pill:hover { filter: brightness(0.95); }
    .status-pending { background-color: #F3F4F6; color: #4B5563; border-color: #D1D5DB; }
    .status-wa-sent { background-color: #DBEAFE; color: #1D4ED8; border-color: #BFDBFE; }
    .status-confirmed { background-color: #DCFCE7; color: #166534; border-color: #BBF7D0; }
    .status-cant-attend { background-color: #FEE2E2; color: #991B1B; border-color: #FECACA; }
`;
html = html.replace(/<\/style>/, cssToInsert + '\n  </style>');

// 3. Add updateOutreachStatus function
const jsToInsert = `
    async function updateOutreachStatus(id, newStatus) {
      const target = state.talents.find(t => t.id === id || t.$id === id);
      if (target) {
        target.outreachStatus = newStatus;
      }
      renderBroadcastTable(); // update UI

      try {
        const docId = target && target.$id ? target.$id : (id || '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          docId,
          { outreachStatus: newStatus }
        );
        showToast('Status updated to ' + newStatus);
      } catch (err) {
        console.warn('Save error, ensure outreachStatus column exists in Appwrite', err);
        showToast('Saved locally, but failed in Cloud. Check Appwrite attributes.');
      }
    }
`;
html = html.replace(/function renderBroadcastTable\(\) \{/, jsToInsert + '\n    function renderBroadcastTable() {');

// 4. Update loadAppwriteTalents to parse outreachStatus
html = html.replace(
  /notes: doc\.notes \|\| ''\s*\};/,
  "notes: doc.notes || '',\n            outreachStatus: doc.outreachStatus || 'Pending'\n          };"
);

// 5. Update drawer handleSaveCandidate
html = html.replace(
  /skillsJson: JSON\.stringify\(skills\)\s*\};/,
  "skillsJson: JSON.stringify(skills),\n        outreachStatus: state.selectedTalent ? (state.selectedTalent.outreachStatus || 'Pending') : 'Pending'\n      };"
);

// 6. Update renderBroadcastTable row UI
const oldTdHtml = `              \${phone ? \`
                <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                  \${isSent ? \`
                    <span style="font-family: var(--font-mono); font-size: 11px; color: #16A34A; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;">
                      ✓ Sent (\${sentTime})
                    </span>
                  \` : '<span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">⏳ Pending</span>'}
                  <button type="button" class="btn btn-wa btn-sm" onclick="sendBroadcastSingle('\${talent.id}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Send to WA ↗
                  </button>
                </div>
              \` : '<span style="font-size: 11px; color: var(--text-muted);">Cannot send</span>'}`;

const newTdHtml = `              \${phone ? \`
                <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                  <select class="outreach-status-pill status-\${(talent.outreachStatus || 'Pending').toLowerCase().replace(/\\s+/g, '-')}" onchange="updateOutreachStatus('\${talent.id}', this.value)">
                    <option value="Pending" \${(talent.outreachStatus || 'Pending') === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                    <option value="WA Sent" \${talent.outreachStatus === 'WA Sent' ? 'selected' : ''}>💬 WA Sent</option>
                    <option value="Confirmed" \${talent.outreachStatus === 'Confirmed' ? 'selected' : ''}>✅ Confirmed</option>
                    <option value="Cant Attend" \${talent.outreachStatus === 'Cant Attend' ? 'selected' : ''}>❌ Can't Attend</option>
                  </select>
                  <button type="button" class="btn btn-wa btn-sm" onclick="sendBroadcastSingle('\${talent.id}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Send to WA ↗
                  </button>
                </div>
              \` : '<span style="font-size: 11px; color: var(--text-muted);">Cannot send</span>'}`;

html = html.replace(oldTdHtml, newTdHtml);

// 7. Update sendBroadcastSingle
const oldSendAuto = `              stage: 'Interviewed',
              notes: updatedNotes
            }`;
const newSendAuto = `              stage: 'Interviewed',
              notes: updatedNotes,
              outreachStatus: 'WA Sent'
            }`;
html = html.replace(oldSendAuto, newSendAuto);

html = html.replace(
  /talent\.stage = 'Interviewed';\s*talent\.notes = updatedNotes;\s*renderBroadcastTable\(\);/,
  "talent.stage = 'Interviewed';\n          talent.notes = updatedNotes;\n          talent.outreachStatus = 'WA Sent';\n          renderBroadcastTable();"
);

// If autoUpdate is false, we still need to set WA Sent
const oldSendNormal = `          console.error('Stage update error:', err);
          showToast('Failed to auto-update stage');
        }
      }
      
      showToast('WhatsApp opened for ' + talent.name);`;

const newSendNormal = `          console.error('Stage update error:', err);
          showToast('Failed to auto-update stage');
        }
      } else {
        updateOutreachStatus(talent.id, 'WA Sent');
      }
      
      showToast('WhatsApp opened for ' + talent.name);`;
html = html.replace(oldSendNormal, newSendNormal);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Outreach status updated successfully.');
