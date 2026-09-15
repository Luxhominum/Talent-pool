const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. CHICKEN TOGGLE HTML & LOGIC
html = html.replace(
  /<div class="psyduck-mood-badge" id="psyduckMoodBadge">\s*<span>\?\?<\/span> <span id="psyduckMoodText">Psyduck Assistant<\/span>\s*<\/div>/,
  `<div class="psyduck-mood-badge" id="psyduckMoodBadge">\n          <span>??</span> <span id="psyduckMoodText">Psyduck Assistant</span>\n        </div>\n        <button type="button" class="btn btn-secondary btn-sm" id="btnToggleChickenRun" onclick="toggleChickenRunning()" style="padding: 2px 6px; font-size: 10px; background: transparent; border: 1px solid var(--border-light); color: var(--text-secondary);">⏸️ Pause</button>`
);

// Inject toggle JS
const toggleJS = `
    let isChickenRunning = true;
    function toggleChickenRunning() {
      isChickenRunning = !isChickenRunning;
      const btn = document.getElementById('btnToggleChickenRun');
      if (isChickenRunning) {
        btn.innerHTML = '⏸️ Pause';
      } else {
        btn.innerHTML = '▶️ Resume';
      }
    }
    
    // Add to window
    window.toggleChickenRunning = toggleChickenRunning;
`;
html = html.replace(/window\.renderPsyduckBubbleContent = renderPsyduckBubbleContent;/, `window.renderPsyduckBubbleContent = renderPsyduckBubbleContent;\n${toggleJS}`);

// Inject state override in updateChickenPosition
html = html.replace(
  /let state = 'IDLE';\s*if \(activePellets\.length > 0\)/,
  `let state = 'IDLE';
          if (!isChickenRunning) {
            targetX = currentX;
            targetY = currentY;
          } else if (activePellets.length > 0)`
);


// 2. BROADCAST CONTAINER REWRITE
const bcStart = html.indexOf('<div id="broadcastContainer"');
const bcEnd = html.indexOf('<div id="emptyState"');
const bcContent = html.substring(bcStart, bcEnd);

const newBcContent = `<div id="broadcastContainer" class="broadcast-container" style="display: none;">
        <!-- High-End Sub-Tabs Navigation -->
        <div style="border-bottom: 1px solid var(--border-light); margin-bottom: 24px; padding: 0 20px;">
          <div style="display: flex; gap: 24px;">
            <button type="button" class="bc-tab-btn active" onclick="switchBcTab('queue')" id="bcNavQueue" style="background: none; border: none; padding: 12px 0; font-size: 14px; font-weight: 500; cursor: pointer; color: #2563EB; border-bottom: 2px solid #2563EB;">dY"s 1. Candidate Queue</button>
            <button type="button" class="bc-tab-btn" onclick="switchBcTab('automation')" id="bcNavAutomation" style="background: none; border: none; padding: 12px 0; font-size: 14px; font-weight: 500; cursor: pointer; color: var(--text-secondary); border-bottom: 2px solid transparent;">dY"Z 2. Smart Scheduling</button>
            <button type="button" class="bc-tab-btn" onclick="switchBcTab('template')" id="bcNavTemplate" style="background: none; border: none; padding: 12px 0; font-size: 14px; font-weight: 500; cursor: pointer; color: var(--text-secondary); border-bottom: 2px solid transparent;">dY' 3. Message Template</button>
          </div>
        </div>

        <!-- TAB 1: QUEUE -->
        <div id="bcTabQueue" style="display: block;">
          <div class="table-container">
            <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; background: #FFFFFF;">
              <div>
                <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary);">Broadcast Outreach Queue</h3>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                  Select candidates for the outreach sequence. Smart scheduling will assign times sequentially.
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <select id="bcStageFilter" class="form-select" onchange="renderBroadcastTable()" style="font-size: 12px; padding: 6px 12px;">
                  <option value="ALL">All Active Candidates</option>
                  <option value="Screening" selected>Screening Candidates Only</option>
                  <option value="Prospect">Prospect Candidates</option>
                  <option value="Interviewed">Interviewed Candidates</option>
                  <option value="Shortlisted">Shortlisted Candidates</option>
                  <option value="Hired">Hired Candidates</option>
                </select>
                <div style="font-family: var(--font-mono); font-size: 12px;">
                  Queue: <span id="bcQueueCount" style="font-weight: 600; color: #16A34A;">0</span> selected
                </div>
              </div>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">
                    <input type="checkbox" id="bcSelectAll" checked onchange="toggleSelectAllBroadcast(this.checked)">
                  </th>
                  <th>Candidate Profile</th>
                  <th>Stage</th>
                  <th>WhatsApp Number</th>
                  <th>Assigned Schedule</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="bcTableBody"></tbody>
            </table>
          </div>
        </div>

        <!-- TAB 2: AUTOMATION SETTINGS -->
        <div id="bcTabAutomation" style="display: none; padding: 0 20px;">
          <div class="broadcast-control-card" style="grid-template-columns: 1fr; max-width: 600px;">
            <div>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #16A34A; margin-bottom: 12px;">
                dY"Z Smart Scheduling Parameters
              </div>
              <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Set the base time and interval. Candidates in the queue will be automatically assigned sequential time slots to avoid overlap.</p>

              <div class="form-group">
                <label class="form-label">Interview Date:</label>
                <input type="date" id="bcDateInput" class="form-input" onchange="renderBroadcastTable()">
              </div>
              
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Base Start Time:</label>
                  <input type="time" id="bcTimeInput" class="form-input" value="09:00" onchange="renderBroadcastTable()">
                </div>
                <div class="form-group">
                  <label class="form-label">Interval (mins) per candidate:</label>
                  <input type="number" id="bcIntervalInput" class="form-input" value="30" min="5" oninput="renderBroadcastTable()">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Interview Location (Onsite):</label>
                <input type="text" id="bcLocationInput" class="form-input" value="s.id/lokasipge" placeholder="e.g. s.id/lokasipge" oninput="renderBroadcastTable()">
              </div>

              <div style="background: #F0FDF4; border: 1px solid #DCFCE7; border-radius: var(--radius-sm); padding: 10px 12px; margin-top: 12px;">
                <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; cursor: pointer; color: #166534;">
                  <input type="checkbox" id="bcAutoUpdateStage" checked style="margin-top: 2px;">
                  <span><strong>Auto-Sync ke Appwrite:</strong> Otomatis simpan catatan jadwal &amp; ubah status kandidat ke <em>Interviewed</em> saat pesan dikirim.</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: MESSAGE TEMPLATE -->
        <div id="bcTabTemplate" style="display: none; padding: 0 20px;">
          <div class="broadcast-control-card" style="grid-template-columns: 1fr; max-width: 800px;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #1E40AF;">
                  dY' Custom Message Box
                </div>
                <select id="bcTemplateSelect" class="form-select" style="width: auto; padding: 4px 8px; font-size: 11px;" onchange="handleBroadcastTemplateChange()">
                  <option value="interview">Template: Undangan Interview</option>
                  <option value="screening">Template: Follow-up Screening</option>
                  <option value="offering">Template: Pemberitahuan Shortlist</option>
                  <option value="custom">Template: Pesan Kustom Bebas</option>
                </select>
              </div>

              <div style="margin-bottom: 8px;">
                <span style="font-size: 11px; color: var(--text-muted); margin-right: 6px;">Insert Variable:</span>
                <div style="display: inline-flex; gap: 4px; flex-wrap: wrap;">
                  <span class="variable-chip" onclick="insertVariableIntoMessage('{name}')">{name}</span>
                  <span class="variable-chip" onclick="insertVariableIntoMessage('{role}')">{role}</span>
                  <span class="variable-chip" onclick="insertVariableIntoMessage('{date}')">{date}</span>
                  <span class="variable-chip" onclick="insertVariableIntoMessage('{time}')">{time}</span>
                  <span class="variable-chip" onclick="insertVariableIntoMessage('{location}')">{location}</span>
                </div>
              </div>

              <textarea id="bcCustomMessage" class="form-textarea" rows="10" style="font-family: var(--font-sans); font-size: 13px; line-height: 1.6;"></textarea>

              <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; font-style: italic;">
                dY' Variabel di atas otomatis diganti sesuai data kandidat dan slot waktu mereka.
              </div>
            </div>
          </div>
        </div>
      </div>
`;
html = html.replace(bcContent, newBcContent);

// 3. JS LOGIC FOR TABS & SMART SCHEDULING
const bcLogic = `
    window.switchBcTab = function(tabName) {
      document.getElementById('bcTabQueue').style.display = tabName === 'queue' ? 'block' : 'none';
      document.getElementById('bcTabAutomation').style.display = tabName === 'automation' ? 'block' : 'none';
      document.getElementById('bcTabTemplate').style.display = tabName === 'template' ? 'block' : 'none';
      
      const navs = ['Queue', 'Automation', 'Template'];
      navs.forEach(n => {
        const btn = document.getElementById('bcNav' + n);
        if (btn) {
          if (n.toLowerCase() === tabName) {
            btn.style.color = '#2563EB';
            btn.style.borderBottomColor = '#2563EB';
          } else {
            btn.style.color = 'var(--text-secondary)';
            btn.style.borderBottomColor = 'transparent';
          }
        }
      });
    };
    
    function calculateSmartTime(index) {
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
    }
`;
html = html.replace(/function renderBroadcastTable\(\) \{/, `${bcLogic}\n    function renderBroadcastTable() {`);

// 4. Update resolveCandidateMessage to accept assignedTime
html = html.replace(
  /function resolveCandidateMessage\(talent\) \{[\s\S]*?const timeVal = el\.bcTimeInput \? el\.bcTimeInput\.value\.trim\(\) : '10:00 WIB';/,
  `function resolveCandidateMessage(talent, assignedTime) {
      const template = el.bcCustomMessage ? el.bcCustomMessage.value : '';
      const dateVal = formatDisplayDate(el.bcDateInput ? el.bcDateInput.value : '');
      const timeVal = assignedTime || 'TBD';`
);

// 5. Update renderBroadcastTable to use smart scheduling
const oldTableLogic = `      el.bcTableBody.innerHTML = targetTalents.map(talent => {
        const isSelected = state.broadcastSelectedIds.has(talent.id);
        const phone = formatToInternationalPhone(talent.phone);
        const resolvedMsg = resolveCandidateMessage(talent);
        const sentTime = state.broadcastSentHistory[talent.id];`;

const newTableLogic = `      
      // Calculate smart schedule assignments for selected talents
      const selectedTalents = targetTalents.filter(t => state.broadcastSelectedIds.has(t.id));
      const scheduleMap = {};
      selectedTalents.forEach((t, i) => { scheduleMap[t.id] = calculateSmartTime(i); });
      state.smartScheduleMap = scheduleMap;

      el.bcTableBody.innerHTML = targetTalents.map(talent => {
        const isSelected = state.broadcastSelectedIds.has(talent.id);
        const phone = formatToInternationalPhone(talent.phone);
        const assignedTime = state.smartScheduleMap[talent.id] || '-';
        const resolvedMsg = resolveCandidateMessage(talent, assignedTime);
        const sentTime = state.broadcastSentHistory[talent.id];`;
        
html = html.replace(oldTableLogic, newTableLogic);

// Update table cell
html = html.replace(
  /<td style="max-width: 320px;">\s*<div style="font-size: 11px;[\s\S]*?<\/div>\s*<\/td>/,
  `<td>
              <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: #1E40AF;">\${assignedTime}</div>
              <div style="font-size: 11px; color: var(--text-secondary);">\${formatDisplayDate(document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '')}</div>
            </td>`
);
html = html.replace(/<th>Resolved Message Preview<\/th>/, '<th>Assigned Schedule</th>');

// Update sendBroadcastSingle
html = html.replace(
  /const msg = resolveCandidateMessage\(talent\);/,
  `const assignedTime = state.smartScheduleMap ? state.smartScheduleMap[talent.id] : 'TBD';
      const msg = resolveCandidateMessage(talent, assignedTime);`
);
html = html.replace(
  /const timeVal = el\.bcTimeInput \? el\.bcTimeInput\.value\.trim\(\) : '10:00 WIB';/,
  `const timeVal = assignedTime || 'TBD';`
);


// Replace default location in WA template if we can find it
html = html.replace(/Lokasi: Google Meet/g, 'Lokasi: {location}');
html = html.replace(/https:\/\/meet\.google\.com\/[a-z\-]+/g, '{location}');

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Broadcast UI & Chicken Toggle Added.');
