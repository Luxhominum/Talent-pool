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
    id: 'PGE-058',
    name: 'Meiva Putri Fadira',
    role: 'Marketplace Specialist',
    stage: 'Screening',
    phone: '085700431702',
    outreachStatus: 'Pending',
    notes: 'Pendidikan: S1'
  },
  {
    id: 'PGE-057',
    name: 'Sri Purwanti',
    role: 'Marketplace Specialist',
    stage: 'Interviewed',
    phone: '087704400554',
    outreachStatus: 'WA Sent',
    notes: '[Interview Scheduled: Rabu, 16 September 2026 13:00 WIB @ s.id/lokasipge]'
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

console.log('=== TEST 1: Initial Render State ===');
selectVacancy('Marketplace Specialist');
renderBroadcastTable();

const ghayuSched = getTalentAssignedSchedule(state.talents[2]);
const sriSched = getTalentAssignedSchedule(state.talents[1]);
const meivaSched = getTalentAssignedSchedule(state.talents[0]);

console.log('Ghayu schedule:', ghayuSched.displayDate, '@', ghayuSched.assignedTime);
console.log('Sri schedule:', sriSched.displayDate, '@', sriSched.assignedTime);
console.log('Meiva schedule (initial):', meivaSched.displayDate, '@', meivaSched.assignedTime);

// Verify Ghayu has 09:00, Sri has 13:00, Meiva does NOT have 09:00
if (ghayuSched.assignedTime === '09:00 WIB' && sriSched.assignedTime === '13:00 WIB' && meivaSched.assignedTime !== '09:00 WIB') {
  console.log('✅ TEST 1 PASSED: Ghayu = 09:00 WIB, Sri = 13:00 WIB, Meiva != 09:00 WIB. ZERO COLLISION!');
} else {
  console.error('❌ TEST 1 FAILED');
  process.exit(1);
}

console.log('\n=== TEST 2: Recalculate Slots when only Meiva is checked ===');
// Meiva is the only checked candidate
state.broadcastSelectedIds.clear();
state.broadcastSelectedIds.add('PGE-058');

recalculateBroadcastSlots(false);

const meivaAfter = getTalentAssignedSchedule(state.talents[0]);
const ghayuAfter = getTalentAssignedSchedule(state.talents[2]);
const sriAfter = getTalentAssignedSchedule(state.talents[1]);

console.log('Meiva schedule after recalculate:', meivaAfter.displayDate, '@', meivaAfter.assignedTime);
console.log('Ghayu schedule after recalculate:', ghayuAfter.displayDate, '@', ghayuAfter.assignedTime);
console.log('Sri schedule after recalculate:', sriAfter.displayDate, '@', sriAfter.assignedTime);

if (meivaAfter.assignedTime === '11:00 WIB' && ghayuAfter.assignedTime === '09:00 WIB' && sriAfter.assignedTime === '13:00 WIB') {
  console.log('✅ TEST 2 PASSED: Meiva was assigned 11:00 WIB (skipping Ghayu 09:00 and Sri 13:00)!');
} else {
  console.error('❌ TEST 2 FAILED');
  process.exit(1);
}

console.log('\n=== TEST 3: Multi-Day Rollover past 15:00 WIB ===');
// Add candidates 4 and 5
state.talents.push({
  id: 'PGE-059',
  name: 'Kandidat Empat',
  role: 'Marketplace Specialist',
  stage: 'Screening',
  outreachStatus: 'Pending'
});
state.talents.push({
  id: 'PGE-060',
  name: 'Kandidat Lima',
  role: 'Marketplace Specialist',
  stage: 'Screening',
  outreachStatus: 'Pending'
});

state.broadcastSelectedIds.add('PGE-059');
state.broadcastSelectedIds.add('PGE-060');

recalculateBroadcastSlots(false);

const cand4Sched = getTalentAssignedSchedule(state.talents[3]);
const cand5Sched = getTalentAssignedSchedule(state.talents[4]);

console.log('Kandidat 4 schedule:', cand4Sched.displayDate, '@', cand4Sched.assignedTime);
console.log('Kandidat 5 schedule:', cand5Sched.displayDate, '@', cand5Sched.assignedTime);

if (cand4Sched.assignedTime === '15:00 WIB' && cand4Sched.displayDate.includes('Rabu, 16 September 2026') &&
    cand5Sched.assignedTime === '09:00 WIB' && cand5Sched.displayDate.includes('Kamis, 17 September 2026')) {
  console.log('✅ TEST 3 PASSED: Rollover past 15:00 WIB successfully moved to Kamis, 17 September 2026 @ 09:00 WIB!');
} else {
  console.error('❌ TEST 3 FAILED: Rollover constraint not met');
  process.exit(1);
}

console.log('\n=========================================');
console.log('🎉 ALL TESTS PASSED! 100% RELIABLE MULTI-DAY SCHEDULING.');
console.log('=========================================');
process.exit(0);
