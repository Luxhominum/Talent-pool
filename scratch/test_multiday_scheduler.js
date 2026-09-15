const fs = require('fs');

console.log('Testing full multi-day rollover & collision prevention logic...');

function formatDisplayDate(iso) {
  const [y, m, d] = iso.split('-');
  const months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dt = new Date(iso + 'T00:00:00');
  return days[dt.getDay()] + ', ' + parseInt(d) + ' ' + months[parseInt(m)] + ' ' + y;
}

function getSmartSlot(slotIndex, baseIsoDate, baseTimeStr, intervalMins) {
  let [bHours, bMinutes] = (baseTimeStr || '09:00').split(':').map(Number);
  if (isNaN(bHours)) bHours = 9;
  if (isNaN(bMinutes)) bMinutes = 0;
  let interval = parseInt(intervalMins, 10);
  if (isNaN(interval) || interval <= 0) interval = 30;

  const startMins = (bHours * 60) + bMinutes;
  const cutoffMins = 15 * 60; // 15:00 WIB

  const dailySlots = [];
  let curMin = startMins;
  while (curMin <= cutoffMins) {
    const h = Math.floor(curMin / 60) % 24;
    const m = curMin % 60;
    dailySlots.push(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ' WIB');
    curMin += interval;
  }
  if (dailySlots.length === 0) dailySlots.push('09:00 WIB');

  const slotsPerDay = dailySlots.length;
  const dayOffset = Math.floor(slotIndex / slotsPerDay);
  const slotInDay = slotIndex % slotsPerDay;
  const assignedTime = dailySlots[slotInDay];

  let targetDate = new Date(baseIsoDate + 'T00:00:00');
  if (isNaN(targetDate.getTime())) targetDate = new Date();

  // Skip Sunday if base date is Sunday
  if (targetDate.getDay() === 0) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  let daysAdded = 0;
  while (daysAdded < dayOffset) {
    targetDate.setDate(targetDate.getDate() + 1);
    if (targetDate.getDay() !== 0) {
      daysAdded++;
    }
  }

  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  const isoDate = y + '-' + m + '-' + d;
  const displayDate = formatDisplayDate(isoDate);

  return { assignedTime, displayDate, isoDate };
}

const state = {
  talents: [
    {
      id: 'PGE-052',
      name: 'Ghayu Rivanda',
      role: 'Marketplace Specialist',
      outreachStatus: 'WA Sent',
      assignedTime: '09:00 WIB',
      displayDate: 'Rabu, 16 September 2026'
    },
    {
      id: 'PGE-057',
      name: 'Sri Purwanti',
      role: 'Marketplace Specialist',
      outreachStatus: 'WA Sent',
      assignedTime: '13:00 WIB',
      displayDate: 'Rabu, 16 September 2026'
    },
    {
      id: 'PGE-058',
      name: 'Meiva Putri Fadira',
      role: 'Marketplace Specialist',
      outreachStatus: 'Pending'
    },
    {
      id: 'PGE-059',
      name: 'Kandidat Empat',
      role: 'Marketplace Specialist',
      outreachStatus: 'Pending'
    },
    {
      id: 'PGE-060',
      name: 'Kandidat Lima (Rollover)',
      role: 'Marketplace Specialist',
      outreachStatus: 'Pending'
    }
  ],
  smartScheduleMap: {
    'PGE-052': '09:00 WIB',
    'PGE-057': '13:00 WIB'
  },
  smartScheduleDates: {
    'PGE-052': 'Rabu, 16 September 2026',
    'PGE-057': 'Rabu, 16 September 2026'
  }
};

// Simulation: Occupied slots registry
const occupiedSlots = new Set();
state.talents.forEach(t => {
  if (['WA Sent', 'Confirmed', 'Reschedule'].includes(t.outreachStatus)) {
    const key = `${t.displayDate}__${t.assignedTime}`;
    occupiedSlots.add(key);
    console.log(`[Permanently Locked] ${t.name} (${t.id}): ${key}`);
  }
});

// Now allocate for pending candidates
const pending = state.talents.filter(t => t.outreachStatus === 'Pending');
let slotIdx = 0;
const baseIso = '2026-09-16';
const baseTime = '09:00';
const interval = 120; // 2 hours: 09:00, 11:00, 13:00, 15:00 -> then next day!

pending.forEach(t => {
  while (true) {
    const slot = getSmartSlot(slotIdx, baseIso, baseTime, interval);
    const key = `${slot.displayDate}__${slot.assignedTime}`;
    if (!occupiedSlots.has(key)) {
      state.smartScheduleMap[t.id] = slot.assignedTime;
      state.smartScheduleDates[t.id] = slot.displayDate;
      occupiedSlots.add(key);
      console.log(`[Allocated] ${t.name} (${t.id}) -> ${slot.displayDate} @ ${slot.assignedTime}`);
      slotIdx++;
      break;
    } else {
      console.log(`[Auto-Skipped Colliding Slot] ${key} (already occupied)`);
      slotIdx++;
    }
  }
});

console.log('\n--- VERIFICATION ASSERTIONS ---');
const ghayuTime = state.smartScheduleMap['PGE-052'];
const sriTime = state.smartScheduleMap['PGE-057'];
const meivaTime = state.smartScheduleMap['PGE-058'];
const meivaDate = state.smartScheduleDates['PGE-058'];
const cand5Time = state.smartScheduleMap['PGE-060'];
const cand5Date = state.smartScheduleDates['PGE-060'];

console.log('Ghayu:', ghayuTime);
console.log('Sri:', sriTime);
console.log('Meiva:', meivaDate, '@', meivaTime);
console.log('Kandidat 5 (Rollover):', cand5Date, '@', cand5Time);

if (ghayuTime === '09:00 WIB' && sriTime === '13:00 WIB' && meivaTime === '11:00 WIB') {
  console.log('✅ PASS: Ghayu kept 09:00, Sri kept 13:00, Meiva received 11:00 (NO DUPLICATE)!');
} else {
  console.error('❌ FAIL');
  process.exit(1);
}

if (cand5Date.includes('Kamis, 17 September 2026') && cand5Time === '09:00 WIB') {
  console.log('✅ PASS: Candidate 5 correctly rolled over to Kamis (next day) @ 09:00 WIB after 15:00 cutoff!');
} else {
  console.error('❌ FAIL: Rollover failed');
  process.exit(1);
}

console.log('\n🎉 ALL LOGIC AND CONSTRAINTS VALIDATED 100%!');
