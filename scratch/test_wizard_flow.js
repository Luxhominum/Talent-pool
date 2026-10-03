const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('public/assessment.html', 'utf-8');
const scriptMatch = html.match(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  console.error('ERROR: Could not find inline script in assessment.html');
  process.exit(1);
}

// Create a DOM-like sandbox
const sandbox = {
  console: console,
  window: {},
  addEventListener: () => {},
  URLSearchParams: global.URLSearchParams,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  document: {
    addEventListener: () => {},
    getElementById: (id) => ({
      id: id,
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {}
      },
      appendChild: () => {},
      querySelectorAll: () => [],
      textContent: '',
      innerHTML: ''
    }),
    createElement: (tag) => ({
      tagName: tag,
      style: {},
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      querySelectorAll: () => [],
      setAttribute: () => {},
      addEventListener: () => {}
    })
  },
  sessionStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; }
  },
  location: { search: '?id=PGE-TEST&tests=bigfive,disc,cognitive,frexor' },
  firebase: {
    initializeApp: () => ({}),
    auth: () => ({ onAuthStateChanged: () => {} }),
    database: () => ({ ref: () => ({ once: async () => ({ exists: () => false }) }) })
  }
};
sandbox.window = sandbox;
vm.createContext(sandbox);

// Load frexor-data.js first into sandbox
const frexorCode = fs.readFileSync('public/js/frexor-data.js', 'utf-8');
vm.runInContext(frexorCode, sandbox);

// Run assessment script in sandbox
vm.runInContext(scriptMatch[1], sandbox);

async function runTests() {
  console.log('--- TESTING WIZARD MODULE CONFIGURATION ---');
  // Initialize with all 4
  await sandbox.init();
  const modsAll = sandbox.buildActiveModules();
  console.log('All 4 Modules count:', modsAll.length, modsAll.map(m => m.shortName));
  if (modsAll.length !== 4) {
    console.error('FAIL: Expected 4 modules, got', modsAll.length);
    process.exit(1);
  }

  // Case 2: DISC + Frexor
  sandbox.location.search = '?id=PGE-TEST&tests=disc,frexor';
  await sandbox.init();
  const mods2 = sandbox.buildActiveModules();
  console.log('2 Modules (DISC + Frexor):', mods2.length, mods2.map(m => m.shortName));
  if (mods2.length !== 2 || mods2[0].key !== 'disc' || mods2[1].key !== 'frexor') {
    console.error('FAIL: DISC + Frexor configuration mismatch');
    process.exit(1);
  }

  // Case 3: Frexor only
  sandbox.location.search = '?id=PGE-TEST&tests=frexor';
  await sandbox.init();
  const modsFrexorOnly = sandbox.buildActiveModules();
  console.log('1 Module (Frexor only):', modsFrexorOnly.length, modsFrexorOnly.map(m => m.shortName));
  if (modsFrexorOnly.length !== 1 || modsFrexorOnly[0].key !== 'frexor') {
    console.error('FAIL: Frexor only configuration mismatch');
    process.exit(1);
  }

  console.log('\n--- TESTING STAGE QUESTIONS & ANSWER VALIDATION ---');
  const b5Questions = sandbox.getStageQuestions('bigfive');
  const discQuestions = sandbox.getStageQuestions('disc');
  const cogQuestions = sandbox.getStageQuestions('cognitive');
  const frexorQuestions = sandbox.getStageQuestions('frexor');

  console.log('Big Five questions:', b5Questions.length);
  console.log('DISC questions:', discQuestions.length);
  console.log('Cognitive questions:', cogQuestions.length);
  console.log('Frexor questions:', frexorQuestions.length);

  if (b5Questions.length !== 50 || discQuestions.length !== 24 || cogQuestions.length !== 15 || frexorQuestions.length !== 60) {
    console.error('FAIL: Question counts mismatch!');
    process.exit(1);
  }

  // Test isQuestionAnswered
  sandbox.userAnswers = {};
  console.log('Empty answer check:', sandbox.isQuestionAnswered(b5Questions[0]));
  if (sandbox.isQuestionAnswered(b5Questions[0]) !== false) {
    console.error('FAIL: Empty answer should be false');
    process.exit(1);
  }

  sandbox.selectAnswer(b5Questions[0].id, 4);
  console.log('Answered Big Five check:', sandbox.isQuestionAnswered(b5Questions[0]));
  if (sandbox.isQuestionAnswered(b5Questions[0]) !== true) {
    console.error('FAIL: Answered Big Five should be true');
    process.exit(1);
  }

  // DISC answer check
  sandbox.selectDiscAnswer(discQuestions[0].id, 'most', 1);
  if (sandbox.isQuestionAnswered(discQuestions[0]) !== false) {
    console.error('FAIL: DISC with only mostIdx should be incomplete (false)');
    process.exit(1);
  }
  sandbox.selectDiscAnswer(discQuestions[0].id, 'least', 3);
  if (sandbox.isQuestionAnswered(discQuestions[0]) !== true) {
    console.error('FAIL: DISC with both mostIdx & leastIdx should be true');
    process.exit(1);
  }

  console.log('\nALL WIZARD LOGIC TESTS PASSED CLEANLY! 🚀');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
