const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const oldLogic = `        const assignedTime = state.smartScheduleMap[talent.id] || '-';
        const resolvedMsg = resolveCandidateMessage(talent, assignedTime);
        const sentTime = state.broadcastSentHistory[talent.id];
        const isSent = !!sentTime;`;

const newLogic = `        let assignedTime = state.smartScheduleMap[talent.id] || '-';
        let displayDate = formatDisplayDate(document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '');
        let isRescheduled = false;

        if (talent.outreachStatus === 'Reschedule' && talent.notes) {
          // Check for the most recent Reschedule remark
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

        const resolvedMsg = resolveCandidateMessage(talent, assignedTime);
        const sentTime = state.broadcastSentHistory[talent.id];
        const isSent = !!sentTime;`;

html = html.replace(oldLogic, newLogic);

const oldTd = `              <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: #1E40AF;">\${assignedTime}</div>
              <div style="font-size: 11px; color: var(--text-secondary);">\${formatDisplayDate(document.getElementById('bcDateInput') ? document.getElementById('bcDateInput').value : '')}</div>`;

const newTd = `              <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: \${isRescheduled ? '#D97706' : '#1E40AF'};">
                \${isRescheduled ? '🔄 ' : ''}\${assignedTime}
              </div>
              <div style="font-size: 11px; color: \${isRescheduled ? '#B45309' : 'var(--text-secondary)'};">\${displayDate}</div>`;

html = html.replace(oldTd, newTd);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Successfully injected reschedule date extraction.');
