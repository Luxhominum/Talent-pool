const fs = require('fs');

global.window = global;
global.window.addEventListener = () => {};
global.requestAnimationFrame = () => {};
global.document = {
  _store: {},
  getElementById: (id) => {
    if (!global.document._store[id]) {
      global.document._store[id] = {
        value: id === 'bcStageFilter' ? 'Screening' : '',
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
  Databases: function() { this.listDocuments = () => Promise.resolve({ documents: [] }); },
  Storage: function() { this.createFile = () => Promise.resolve({}); },
  Account: function() { this.get = () => Promise.resolve({}); }
};

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptMatches = html.match(/<script[\s\S]*?<\/script>/gi);
eval(scriptMatches[7].replace(/<\/?script[^>]*>/gi, ''));

state.talents = [
  { id: 'PGE-001', name: 'Lia Ana Pratama', role: 'Freelance Content Creator', stage: 'Screening', phone: '0812345678' },
  { id: 'PGE-002', name: 'Rizky Abdullah', role: 'Freelance Content Creator', stage: 'Screening', phone: '0812345679' },
  { id: 'PGE-052', name: 'Ghayu Rivanda', role: 'Marketplace Specialist', stage: 'Screening', phone: '085712217501' }
];

console.log('=== TEST 1: activeVacancy = "Marketplace Specialist" ===');
selectVacancy('Marketplace Specialist');
renderBroadcastTable();

const q1 = Number(document.getElementById('bcQueueCount').textContent);
const h1 = document.getElementById('bcTableBody').innerHTML;
console.log('Queue count:', q1);
console.log('Contains Ghayu Rivanda:', h1.includes('Ghayu Rivanda'));
console.log('Contains Lia Ana Pratama:', h1.includes('Lia Ana Pratama'));

if (q1 === 1 && h1.includes('Ghayu Rivanda') && !h1.includes('Lia Ana Pratama')) {
  console.log('>>> TEST 1 PASSED: Only Ghayu Rivanda (Marketplace Specialist) is in broadcast!');
} else {
  console.error('>>> TEST 1 FAILED');
  process.exit(1);
}

console.log('\n=== TEST 2: activeVacancy = "Freelance Content Creator" ===');
selectVacancy('Freelance Content Creator');
renderBroadcastTable();

const q2 = Number(document.getElementById('bcQueueCount').textContent);
const h2 = document.getElementById('bcTableBody').innerHTML;
console.log('Queue count:', q2);
console.log('Contains Ghayu Rivanda:', h2.includes('Ghayu Rivanda'));
console.log('Contains Lia Ana Pratama:', h2.includes('Lia Ana Pratama'));

if (q2 === 2 && !h2.includes('Ghayu Rivanda') && h2.includes('Lia Ana Pratama')) {
  console.log('>>> TEST 2 PASSED: Only Content Creators are in broadcast!');
} else {
  console.error('>>> TEST 2 FAILED');
  process.exit(1);
}

console.log('\n=== TEST 3: activeVacancy = "ALL" (Semua Lowongan) ===');
selectVacancy('ALL');
renderBroadcastTable();

const q3 = Number(document.getElementById('bcQueueCount').textContent);
const h3 = document.getElementById('bcTableBody').innerHTML;
console.log('Queue count:', q3);
console.log('Contains Ghayu Rivanda:', h3.includes('Ghayu Rivanda'));
console.log('Contains Lia Ana Pratama:', h3.includes('Lia Ana Pratama'));

if (q3 === 3 && h3.includes('Ghayu Rivanda') && h3.includes('Lia Ana Pratama')) {
  console.log('>>> TEST 3 PASSED: All 3 candidates are in broadcast!');
} else {
  console.error('>>> TEST 3 FAILED');
  process.exit(1);
}

console.log('\n=========================================');
console.log('🎉 ALL TESTS PASSED! Broadcast filtering is 100% vacancy-aware.');
console.log('=========================================');
process.exit(0);
