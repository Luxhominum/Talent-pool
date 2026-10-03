const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Create mock browser context
const sandbox = {
  console: console,
  window: {},
  document: {
    addEventListener: () => {}
  }
};
vm.createContext(sandbox);

// Load frexor-data.js
const code = fs.readFileSync('public/js/frexor-data.js', 'utf-8');
vm.runInContext(code, sandbox);

const { FREXOR_QUESTIONS, calculateFrexorScores, renderFrexorDossierHtml } = sandbox.window;

console.log('--- FREXOR DATA VALIDATION ---');
console.log('Total Questions:', FREXOR_QUESTIONS.length);
if (FREXOR_QUESTIONS.length !== 60) {
  console.error('ERROR: Expected 60 questions, got', FREXOR_QUESTIONS.length);
  process.exit(1);
}

// Check category breakdown
const domains = {};
const diagramQuestions = [];

FREXOR_QUESTIONS.forEach((q, idx) => {
  domains[q.domain] = (domains[q.domain] || 0) + 1;
  if (q.num !== idx + 1) {
    console.error(`ERROR: Question index mismatch at ${idx + 1}`);
    process.exit(1);
  }
  if (!q.question || !q.options || q.options.length < 2) {
    console.error(`ERROR: Question ${q.num} invalid question or options length`);
    process.exit(1);
  }
  if (!q.correct_answer) {
    console.error(`ERROR: Question ${q.num} missing correct_answer`);
    process.exit(1);
  }
  if (q.image) {
    diagramQuestions.push(q);
    const imgPath = path.join('public', q.image.replace(/^\//, ''));
    if (!fs.existsSync(imgPath)) {
      console.error(`ERROR: Missing diagram file for Q${q.num}: ${imgPath}`);
      process.exit(1);
    }
  }
});

console.log('Domain breakdown:', domains);
console.log(`Diagram questions: ${diagramQuestions.length} files verified on disk.`);
if (diagramQuestions.length !== 20) {
  console.error('ERROR: Expected 20 diagram questions, found:', diagramQuestions.length);
  process.exit(1);
}

console.log('\n--- SCORING ENGINE SIMULATION ---');
// 1. Perfect score
const allCorrectAnswers = {};
FREXOR_QUESTIONS.forEach(q => {
  allCorrectAnswers[q.id] = q.correct_answer;
});
const perfectResult = calculateFrexorScores(allCorrectAnswers);
console.log('Perfect Score (60/60):', perfectResult.score, 'IQ:', perfectResult.iq_estimate, 'Cat:', perfectResult.category);
if (perfectResult.score !== 60 || perfectResult.iq_estimate !== 145) {
  console.error('ERROR on perfect score calculation', perfectResult);
  process.exit(1);
}

// 2. Average score (30 correct)
const halfAnswers = {};
FREXOR_QUESTIONS.forEach((q, idx) => {
  if (idx < 30) halfAnswers[q.id] = q.correct_answer;
  else halfAnswers[q.id] = 'INCORRECT_DUMMY_CHOICE';
});
const halfResult = calculateFrexorScores(halfAnswers);
console.log('Half Score (30/60):', halfResult.score, 'IQ:', halfResult.iq_estimate, 'Cat:', halfResult.category);
if (halfResult.score !== 30 || halfResult.iq_estimate !== 90) {
  console.error('ERROR on half score calculation', halfResult);
  process.exit(1);
}

// 3. Zero score
const zeroAnswers = {};
FREXOR_QUESTIONS.forEach(q => {
  zeroAnswers[q.id] = 'WRONG_VALUE';
});
const zeroResult = calculateFrexorScores(zeroAnswers);
console.log('Zero Score (0/60):', zeroResult.score, 'IQ:', zeroResult.iq_estimate, 'Cat:', zeroResult.category);
if (zeroResult.score !== 0 || zeroResult.iq_estimate !== 70) {
  console.error('ERROR on zero score calculation', zeroResult);
  process.exit(1);
}

console.log('\n--- DOSSIER HTML RENDERING SIMULATION ---');
const htmlOutput = renderFrexorDossierHtml(perfectResult);
console.log('Dossier HTML generated, length:', htmlOutput.length);
if (!htmlOutput.includes('Sangat Superior') || !htmlOutput.includes('frexor_q03.png')) {
  console.error('ERROR: Dossier HTML missing expected content');
  process.exit(1);
}

console.log('\nALL FREXOR SIMULATION TESTS PASSED SUCCESSFULLY! 🚀');
