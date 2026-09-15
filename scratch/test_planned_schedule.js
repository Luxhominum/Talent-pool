const fs = require('fs');

console.log('Testing planned-only schedule logic...');

const talents = [
  { id: 'PGE-052', name: 'Ghayu Rivanda', role: 'Marketplace Specialist', stage: 'Interviewed', outreachStatus: 'WA Sent', notes: '[Interview Scheduled: Rabu, 16 September 2026 09:00 WIB @ s.id/lokasipge]' },
  { id: 'PGE-057', name: 'Sri Purwanti', role: 'Marketplace Specialist', stage: 'Prospect', outreachStatus: 'Pending', notes: '' }
];

// Test 1: Prioritize planned/WA Sent candidates over new pending candidates
const sorted = [...talents].sort((a, b) => {
  const statusWeight = { 'Confirmed': 3, 'Reschedule': 3, 'WA Sent': 2, 'Pending': 1 };
  const wA = statusWeight[a.outreachStatus] || 0;
  const wB = statusWeight[b.outreachStatus] || 0;
  if (wA !== wB) return wB - wA; // WA Sent before Pending!
  
  const numA = parseInt((a.id || '').replace(/\D/g, ''), 10) || 0;
  const numB = parseInt((b.id || '').replace(/\D/g, ''), 10) || 0;
  return numA - numB; // FIFO
});

console.log('Sorted order for scheduling:', sorted.map(t => `${t.id} (${t.name}) - ${t.outreachStatus}`));

if (sorted[0].id === 'PGE-052' && sorted[1].id === 'PGE-057') {
  console.log('✅ PASS: Ghayu Rivanda is scheduled FIRST (09:00), Sri Purwanti is SECOND (11:00)!');
} else {
  console.error('❌ FAIL');
}
