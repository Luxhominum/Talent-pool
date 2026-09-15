const fs = require('fs');

global.window = global;
global.window.addEventListener = () => {};
global.requestAnimationFrame = () => {};
global.document = {
  _store: {},
  getElementById: (id) => {
    if (!global.document._store[id]) {
      global.document._store[id] = {
        value: id === 'bcStageFilter' ? 'Screening' : (id === 'bcDateInput' ? '2026-09-16' : (id === 'bcIntervalInput' ? '120' : (id === 'bcTimeInput' ? '09:00' : ''))),
        textContent: '',
        innerHTML: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        addEventListener: () => {},
        getContext: () => ({ clearRect: () => {}, fillRect: () => {}, arc: () => {}, fill: () => {}, beginPath: () => {} })
      };
    }
    return global.document._store[id];
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {}
};
global.localStorage = {
  _store: {},
  getItem: (k) => global.localStorage._store[k] || null,
  setItem: (k, v) => { global.localStorage._store[k] = String(v); },
  removeItem: (k) => { delete global.localStorage._store[k]; }
};
global.firebase = {
  initializeApp: () => ({}),
  database: () => ({ ref: () => ({ on: () => {}, once: () => Promise.resolve({ val: () => null }) }) }),
  auth: () => ({ onAuthStateChanged: () => {} })
};
global.Appwrite = {
  Client: function() { this.setEndpoint = () => this; this.setProject = () => this; },
  Databases: function() { 
    this.listDocuments = () => Promise.resolve({ documents: [] });
    this.updateDocument = () => Promise.resolve({});
  },
  Storage: function() { this.createFile = () => Promise.resolve({}); },
  Account: function() { this.get = () => Promise.resolve({}); }
};

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptMatches = html.match(/<script[\s\S]*?<\/script>/gi);
eval(scriptMatches[7].replace(/<\/?script[^>]*>/gi, ''));

console.log('=== TEST 1: Cross-Vacancy Auto-Skip for WA Sent candidate ===');
// Candidate A in Business Development has WA Sent for 09:00 WIB on 16 September 2026
state.talents = [
  {
    id: 'PGE-001',
    name: 'Ahmad Fauzi',
    role: 'Business Development',
    stage: 'Screening',
    phone: '08111111111',
    outreachStatus: 'WA Sent',
    notes: '[Interview Scheduled: Rabu, 16 September 2026 09:00 WIB @ s.id/lokasipge]'
  },
  {
    id: 'PGE-052',
    name: 'Ghayu Rivanda',
    role: 'Marketplace Specialist',
    stage: 'Screening',
    phone: '085712217501',
    outreachStatus: 'Pending',
    notes: ''
  }
];

// Admin selects Marketplace Specialist
selectVacancy('Marketplace Specialist');
renderBroadcastTable();

const ghayuAssignedTime = state.smartScheduleMap['PGE-052'];
console.log('Ahmad Fauzi (BD) time:', '09:00 WIB');
console.log('Ghayu Rivanda (Marketplace) assigned time:', ghayuAssignedTime);

if (ghayuAssignedTime !== '09:00 WIB') {
  console.log('✅ TEST 1 PASSED: Smart Scheduling auto-skipped 09:00 WIB (occupied by WA Sent candidate) and assigned:', ghayuAssignedTime);
} else {
  console.error('❌ TEST 1 FAILED: Ghayu was assigned 09:00 WIB which was already WA Sent to Ahmad!');
  process.exit(1);
}

console.log('\n=== TEST 2: Tentative Conflict Detection ===');
// Force candidate B to 09:00 WIB to simulate intentional or collision state
state.smartScheduleMap['PGE-052'] = '09:00 WIB';
const conflicts = detectScheduleConflicts();
console.log('Hard conflicts for PGE-052:', conflicts['PGE-052']);
console.log('Tentative conflicts for PGE-052:', conflicts.tentativeConflicts ? conflicts.tentativeConflicts['PGE-052'] : null);

const tent = conflicts.tentativeConflicts ? conflicts.tentativeConflicts['PGE-052'] : null;
if (tent && tent.length === 1 && tent[0].id === 'PGE-001') {
  console.log('✅ TEST 2 PASSED: Tentative collision with Ahmad Fauzi detected accurately!');
} else {
  console.error('❌ TEST 2 FAILED');
  process.exit(1);
}

console.log('\n=== TEST 3: Intercept on "Send to WA" ===');
let modalOpened = false;
global.openTentativeConflictModal = function(targetId, holderId) {
  modalOpened = true;
  console.log(`[Modal Intercept Triggered] Target: ${targetId}, Existing WA Sent Holder: ${holderId}`);
};

sendBroadcastSingle('PGE-052');
if (modalOpened) {
  console.log('✅ TEST 3 PASSED: sendBroadcastSingle successfully intercepted and opened modal!');
} else {
  console.error('❌ TEST 3 FAILED: sendBroadcastSingle did not intercept tentative conflict!');
  process.exit(1);
}

console.log('\n=========================================');
console.log('🎉 ALL TENTATIVE CONFLICT TESTS PASSED 100%!');
console.log('=========================================');
process.exit(0);
