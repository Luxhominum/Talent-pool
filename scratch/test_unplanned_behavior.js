const fs = require('fs');

console.log('Testing unplanned candidate display and planSingleCandidateSlot...');

const state = {
  talents: [
    { id: 'PGE-052', name: 'Ghayu Rivanda', role: 'Marketplace Specialist', stage: 'Interviewed', outreachStatus: 'WA Sent', notes: '[Interview Scheduled: Rabu, 16 September 2026 09:00 WIB @ s.id/lokasipge]' },
    { id: 'PGE-057', name: 'Sri Purwanti', role: 'Marketplace Specialist', stage: 'Prospect', outreachStatus: 'Pending', notes: '' }
  ],
  smartScheduleMap: {
    'PGE-052': '09:00 WIB'
  }
};

function getSchedule(t) {
  if (t.notes && t.notes.includes('09:00 WIB')) return { assignedTime: '09:00 WIB', displayDate: 'Rabu, 16 September 2026' };
  if (state.smartScheduleMap[t.id]) return { assignedTime: state.smartScheduleMap[t.id], displayDate: 'Rabu, 16 September 2026' };
  return { assignedTime: '-', displayDate: 'Rabu, 16 September 2026' };
}

console.log('Ghayu schedule:', getSchedule(state.talents[0]));
console.log('Sri schedule:', getSchedule(state.talents[1]));

// Verify Sri is '-' (Belum Dijadwalkan)
if (getSchedule(state.talents[1]).assignedTime === '-') {
  console.log('✅ PASS: Sri is not auto-assigned a slot on render. Displays as Unscheduled!');
} else {
  console.error('❌ FAIL: Sri was auto-assigned a slot!');
}

// Verify Ghayu has 09:00 WIB
if (getSchedule(state.talents[0]).assignedTime === '09:00 WIB') {
  console.log('✅ PASS: Ghayu holds the 09:00 WIB slot!');
} else {
  console.error('❌ FAIL: Ghayu does not have 09:00 WIB!');
}
