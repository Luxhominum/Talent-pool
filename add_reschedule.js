const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Inject CSS
html = html.replace(
  /\.status-cant-attend \{ background-color: #FEE2E2; color: #991B1B; border-color: #FECACA; \}/,
  `.status-cant-attend { background-color: #FEE2E2; color: #991B1B; border-color: #FECACA; }\n    .status-reschedule { background-color: #FEF3C7; color: #D97706; border-color: #FDE68A; }`
);

// Inject HTML Option
// Need to find the exact line for Cant Attend in the select box.
// It looks like: <option value="Cant Attend" ${talent.outreachStatus === 'Cant Attend' ? 'selected' : ''}>... Can't Attend</option>
const optMatch = html.match(/<option value="Cant Attend"[\s\S]*?<\/option>/);
if (optMatch) {
  const newOption = `\n                    <option value="Reschedule" \${talent.outreachStatus === 'Reschedule' ? 'selected' : ''}>🔄 Reschedule</option>`;
  html = html.replace(optMatch[0], optMatch[0] + newOption);
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Reschedule option added.');
