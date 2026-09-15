const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Inject Helper Functions
const helpers = `
    /* --- OUTREACH STATUS HELPERS --- */
    function extractOutreachStatus(notes) {
      if (!notes) return { text: '', status: 'Pending' };
      const match = notes.match(/\\[OUTREACH:\\s*(.*?)\\]/);
      if (match) {
        return {
          text: notes.replace(/\\[OUTREACH:\\s*.*?\\]/g, '').trim(),
          status: match[1]
        };
      }
      return { text: notes.trim(), status: 'Pending' };
    }

    function packOutreachStatus(notes, status) {
      const clean = (notes || '').replace(/\\[OUTREACH:\\s*.*?\\]/g, '').trim();
      if (!status || status === 'Pending') return clean;
      return clean ? clean + '\\n\\n[OUTREACH: ' + status + ']' : '[OUTREACH: ' + status + ']';
    }
`;
html = html.replace(/const STAGES = \['Prospect', 'Screening', 'Interviewed', 'Shortlisted', 'Offered', 'Hired', 'Archived'\];/, "const STAGES = ['Prospect', 'Screening', 'Interviewed', 'Shortlisted', 'Offered', 'Hired', 'Archived'];\n" + helpers);

// 2. Fix loadAppwriteTalents
html = html.replace(
  /notes: doc\.notes \|\| '',\s*outreachStatus: doc\.outreachStatus \|\| 'Pending'/,
  "notes: extractOutreachStatus(doc.notes || '').text,\n            outreachStatus: extractOutreachStatus(doc.notes || '').status"
);

// 3. Fix handleSaveCandidate
html = html.replace(
  /notes: structuredNotes\.trim\(\),\s*cvUrl/g,
  "notes: packOutreachStatus(structuredNotes.trim(), state.selectedTalent ? (state.selectedTalent.outreachStatus || 'Pending') : 'Pending'),\n        cvUrl"
);
html = html.replace(/,\s*outreachStatus: state\.selectedTalent \? \(state\.selectedTalent\.outreachStatus \|\| 'Pending'\) : 'Pending'/g, '');

// 4. Fix updateOutreachStatus
html = html.replace(
  /\{ outreachStatus: newStatus \}/,
  "{ notes: packOutreachStatus(target.notes, newStatus) }"
);

// 5. Fix sendBroadcastSingle autoUpdate
html = html.replace(
  /stage: 'Interviewed',\s*notes: updatedNotes,\s*outreachStatus: 'WA Sent'/,
  "stage: 'Interviewed',\n              notes: packOutreachStatus(updatedNotes, 'WA Sent')"
);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Successfully switched to Option 2 (embedded tags).');
