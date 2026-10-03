const fs = require('fs');
const path = require('path');

// 1. Balanced Latin Square Permutations of [0, 1, 2, 3] (0=D, 1=I, 2=S, 3=C)
// Exactly 24 permutations, each trait appears exactly 6 times in position 0, 1, 2, 3
const PERMS_24 = [
  [1, 0, 3, 2], // Set 01: I, D, C, S
  [2, 3, 0, 1], // Set 02: S, C, D, I
  [3, 1, 2, 0], // Set 03: C, I, S, D
  [0, 2, 1, 3], // Set 04: D, S, I, C
  [1, 3, 0, 2], // Set 05: I, C, D, S
  [2, 0, 3, 1], // Set 06: S, D, C, I
  [3, 2, 1, 0], // Set 07: C, S, I, D
  [0, 1, 2, 3], // Set 08: D, I, S, C
  [1, 2, 3, 0], // Set 09: I, S, C, D
  [2, 1, 0, 3], // Set 10: S, I, D, C
  [3, 0, 1, 2], // Set 11: C, D, I, S
  [0, 3, 2, 1], // Set 12: D, C, S, I
  [1, 0, 2, 3], // Set 13: I, D, S, C
  [2, 3, 1, 0], // Set 14: S, C, I, D
  [3, 1, 0, 2], // Set 15: C, I, D, S
  [0, 2, 3, 1], // Set 16: D, S, C, I
  [1, 3, 2, 0], // Set 17: I, C, S, D
  [2, 0, 1, 3], // Set 18: S, D, I, C
  [3, 2, 0, 1], // Set 19: C, S, D, I
  [0, 1, 3, 2], // Set 20: D, I, C, S
  [1, 2, 0, 3], // Set 21: I, S, D, C
  [2, 1, 3, 0], // Set 22: S, I, C, D
  [3, 0, 2, 1], // Set 23: C, D, S, I
  [0, 3, 1, 2]  // Set 24: D, C, I, S
];

// Verify balance
const traits = ['D', 'I', 'S', 'C'];
const counts = { D: [0,0,0,0], I: [0,0,0,0], S: [0,0,0,0], C: [0,0,0,0] };
PERMS_24.forEach(p => {
  p.forEach((tIdx, pos) => {
    counts[traits[tIdx]][pos]++;
  });
});
console.log('Trait position frequency across 24 perms:', counts);

// 2. Read test.html
const testFile = path.join(__dirname, '..', 'public', 'test.html');
let testContent = fs.readFileSync(testFile, 'utf8');

// Extract QUESTIONS array string
const qStartStr = 'const QUESTIONS = [';
const qStartIdx = testContent.indexOf(qStartStr);
const qEndIdx = testContent.indexOf('];', qStartIdx);
const qJsonStr = testContent.substring(qStartIdx + qStartStr.length - 1, qEndIdx + 1);

// Extract DISC_QUESTIONS array string
const discStartStr = 'const DISC_QUESTIONS = [';
const discStartIdx = testContent.indexOf(discStartStr);
const discEndIdx = testContent.indexOf('];', discStartIdx);
const discJsonStr = testContent.substring(discStartIdx + discStartStr.length - 1, discEndIdx + 1);

const originalQuestions = eval(qJsonStr);
const originalDiscQuestions = eval(discJsonStr);

console.log('Original Big Five questions:', originalQuestions.length);
console.log('Original DISC questions:', originalDiscQuestions.length);

// Permute DISC options
const permutedDiscQuestions = originalDiscQuestions.map((q, qIdx) => {
  const perm = PERMS_24[qIdx % PERMS_24.length];
  const newOptions = perm.map(idx => q.options[idx]);
  return {
    id: q.id,
    options: newOptions
  };
});

// Seeded PRNG for Big Five non-adjacent shuffling
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

let seed = 100;
let shuffledQuestions = [];
let validShuffle = false;

while (!validShuffle) {
  seed++;
  const rng = mulberry32(seed);
  shuffledQuestions = [...originalQuestions];
  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
  }
  
  let hasAdjacent = false;
  for (let i = 0; i < shuffledQuestions.length - 1; i++) {
    if (shuffledQuestions[i].dimension === shuffledQuestions[i+1].dimension) {
      hasAdjacent = true;
      break;
    }
  }
  if (!hasAdjacent) {
    validShuffle = true;
    console.log('Found balanced non-adjacent Big Five sequence with seed:', seed);
  }
}

// Format nicely as JS code
function formatBigFive(arr) {
  const items = arr.map(q => `      { "id": "${q.id}", "dimension": "${q.dimension}", "text": ${JSON.stringify(q.text)}, "scoring_key": "${q.scoring_key}" }`);
  return 'const QUESTIONS = [\n' + items.join(',\n') + '\n    ];';
}

function formatDisc(arr) {
  const items = arr.map(q => {
    const opts = q.options.map(o => `      {\n        "text": ${JSON.stringify(o.text)},\n        "most": "${o.most}",\n        "least": "${o.least}"\n      }`).join(',\n');
    return `  {\n    "id": "${q.id}",\n    "options": [\n${opts}\n    ]\n  }`;
  });
  return 'const DISC_QUESTIONS = [\n' + items.join(',\n') + '\n    ];';
}

const formattedBigFiveCode = formatBigFive(shuffledQuestions);
const formattedDiscCode = formatDisc(permutedDiscQuestions);

// Save generated chunks for inspection
fs.writeFileSync(path.join(__dirname, 'formatted_bigfive.js'), formattedBigFiveCode);
fs.writeFileSync(path.join(__dirname, 'formatted_disc.js'), formattedDiscCode);

console.log('Saved formatted chunks to scratch!');
