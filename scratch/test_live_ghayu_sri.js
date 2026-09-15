const fs = require('fs');

global.window = global;
global.window.addEventListener = () => {};
global.requestAnimationFrame = () => {};
global.document = {
  _store: {},
  getElementById: (id) => {
    if (!global.document._store[id]) {
      global.document._store[id] = {
        value: id === 'bcStageFilter' ? 'ALL' : (id === 'bcDateInput' ? '2026-09-16' : (id === 'bcIntervalInput' ? '120' : (id === 'bcTimeInput' ? '09:00' : ''))),
        textContent: '',
        innerHTML: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        addEventListener: () => {},
        appendChild: () => {},
        getContext: () => ({ clearRect: () => {}, fillRect: () => {}, arc: () => {}, fill: () => {}, beginPath: () => {} })
      };
    }
    return global.document._store[id];
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {},
  createElement: () => ({ classList: { add: () => {} }, style: {}, appendChild: () => {}, remove: () => {} }),
  body: { appendChild: () => {} }
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

state.talents = [
  {
    id: 'PGE-057',
    name: 'Sri Purwanti',
    role: 'Marketplace Specialist',
    stage: 'Prospect',
    phone: '087704400554',
    outreachStatus: 'Pending',
    notes: 'Pendidikan: S1'
  },
  {
    id: 'PGE-052',
    name: 'Ghayu Rivanda',
    role: 'Marketplace Specialist',
    stage: 'Interviewed',
    phone: '085712217501',
    outreachStatus: 'WA Sent',
    notes: '[Interview Scheduled: Rabu, 16 September 2026 09:00 WIB @ s.id/lokasipge]'
  }
];

console.log('=== TEST 1: Initial Render (Only planned candidates have times) ===');
selectVacancy('Marketplace Specialist');
renderBroadcastTable();

const tableHtml = document.getElementById('bcTableBody').innerHTML;
const ghayuSched = getTalentAssignedSchedule(state.talents[1]);
const sriSched = getTalentAssignedSchedule(state.talents[0]);

console.log('Ghayu schedule:', ghayuSched.assignedTime);
console.log('Sri schedule:', sriSched.assignedTime);
console.log('Table contains "Belum Dijadwalkan" for Sri?', tableHtml.includes('Belum Dijadwalkan'));

if (ghayuSched.assignedTime === '09:00 WIB' && (sriSched.assignedTime === '-' || !sriSched.assignedTime) && tableHtml.includes('Belum Dijadwalkan')) {
  console.log('✅ TEST 1 PASSED: Ghayu holds 09:00 WIB. Sri is not auto-assigned on render and shows "Belum Dijadwalkan"!');
} else {
  console.error('❌ TEST 1 FAILED');
  process.exit(1);
}

console.log('\n=== TEST 2: Recalculate Slots (Planning the queue) ===');
recalculateBroadcastSlots(false);

const ghayuAfter = state.smartScheduleMap['PGE-052'];
const sriAfter = state.smartScheduleMap['PGE-057'];
console.log('Ghayu schedule after planning:', ghayuAfter);
console.log('Sri schedule after planning:', sriAfter);

if (ghayuAfter === '09:00 WIB' && sriAfter === '11:00 WIB') {
  console.log('✅ TEST 2 PASSED: Ghayu retained 09:00 WIB, Sri Purwanti was planned for 11:00 WIB!');
} else {
  console.error('❌ TEST 2 FAILED');
  process.exit(1);
}

console.log('\n=========================================');
console.log('🎉 ALL TESTS PASSED! 09:00 slot belongs to Ghayu, and time is only added when planned.');
console.log('=========================================');
process.exit(0);
