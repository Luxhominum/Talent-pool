const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const regex = /const assignedTime = state\.smartScheduleMap\[talent\.id\] \|\| '-';\s*const resolvedMsg = resolveCandidateMessage\(talent, assignedTime\);\s*const sentTime = state\.broadcastSentHistory\[talent\.id\];\s*const isSent = !!sentTime;/;

const newLogic = `        let assignedTime = state.smartScheduleMap[talent.id] || '-';
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

        const resolvedMsg = resolveCandidateMessage(talent, assignedTime);
        const sentTime = state.broadcastSentHistory[talent.id];
        const isSent = !!sentTime;`;

html = html.replace(regex, newLogic);
fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed variable declaration logic.');
