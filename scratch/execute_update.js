const fs = require('fs');
const path = require('path');

const bigFiveCode = fs.readFileSync(path.join(__dirname, 'formatted_bigfive.js'), 'utf8').replace(/\r\n/g, '\n');
const discCode = fs.readFileSync(path.join(__dirname, 'formatted_disc.js'), 'utf8').replace(/\r\n/g, '\n');

// 1. Update public/test.html
const testHtmlPath = path.join(__dirname, '..', 'public', 'test.html');
let testHtml = fs.readFileSync(testHtmlPath, 'utf8').replace(/\r\n/g, '\n');

// Replace QUESTIONS
const testQStart = testHtml.indexOf('const QUESTIONS = [');
const testQEnd = testHtml.indexOf('];', testQStart) + 2;
testHtml = testHtml.substring(0, testQStart) + bigFiveCode + testHtml.substring(testQEnd);

// Replace DISC_QUESTIONS
const testDStart = testHtml.indexOf('const DISC_QUESTIONS = [');
const testDEnd = testHtml.indexOf('];', testDStart) + 2;
testHtml = testHtml.substring(0, testDStart) + discCode + testHtml.substring(testDEnd);

// Update calculateDiscScores in test.html
const oldCalcDiscTest = `      DISC_QUESTIONS.forEach(q => {
        const ans = answers[q.id];
        if (ans && typeof ans === 'object') {
          // Most selection
          if (ans.mostIdx !== undefined && q.options[ans.mostIdx]) {
            const traitM = q.options[ans.mostIdx].most;
            if (tally.most[traitM] !== undefined) tally.most[traitM] += 1;
          }
          // Least selection
          if (ans.leastIdx !== undefined && q.options[ans.leastIdx]) {
            const traitL = q.options[ans.leastIdx].least;
            if (tally.least[traitL] !== undefined) tally.least[traitL] += 1;
          }
        }
      });`;

const newCalcDiscTest = `      DISC_QUESTIONS.forEach(q => {
        const ans = answers[q.id];
        if (ans && typeof ans === 'object') {
          // Most selection (supports direct trait key or index lookup)
          let traitM = ans.mostTrait;
          if (!traitM && ans.mostIdx !== undefined && q.options[ans.mostIdx]) {
            traitM = q.options[ans.mostIdx].most;
          }
          if (traitM && tally.most[traitM] !== undefined) {
            tally.most[traitM] += 1;
          }

          // Least selection (supports direct trait key or index lookup)
          let traitL = ans.leastTrait;
          if (!traitL && ans.leastIdx !== undefined && q.options[ans.leastIdx]) {
            traitL = q.options[ans.leastIdx].least;
          }
          if (traitL && tally.least[traitL] !== undefined) {
            tally.least[traitL] += 1;
          }
        }
      });`;

if (!testHtml.includes(oldCalcDiscTest)) {
  console.error('Could not find oldCalcDiscTest in test.html');
  process.exit(1);
}
testHtml = testHtml.replace(oldCalcDiscTest, newCalcDiscTest);

// Update selectDiscToggle in test.html
const oldSelectDiscToggle = `    function selectDiscToggle(qid, optIdx, type) {
      if (!state.answers.disc[qid]) state.answers.disc[qid] = {};
      const cur = state.answers.disc[qid];

      if (type === 'most') {
        if (cur.mostIdx === optIdx) delete cur.mostIdx;
        else {
          cur.mostIdx = optIdx;
          if (cur.leastIdx === optIdx) delete cur.leastIdx; // can't be both
        }
      } else {
        if (cur.leastIdx === optIdx) delete cur.leastIdx;
        else {
          cur.leastIdx = optIdx;
          if (cur.mostIdx === optIdx) delete cur.mostIdx; // can't be both
        }
      }

      // Sync to cloud & local backup
      saveLocalBackup();
      if (state.token) {
        rtdb.ref('/assessmentTokens/' + state.token + '/answers/disc/' + qid).set(cur);
      }
      renderDiscQuestion();
    }`;

const newSelectDiscToggle = `    function selectDiscToggle(qid, optIdx, type) {
      if (!state.answers.disc[qid]) state.answers.disc[qid] = {};
      const cur = state.answers.disc[qid];
      const q = DISC_QUESTIONS.find(item => item.id === qid);

      if (type === 'most') {
        if (cur.mostIdx === optIdx) {
          delete cur.mostIdx;
          delete cur.mostTrait;
        } else {
          cur.mostIdx = optIdx;
          if (q && q.options[optIdx]) cur.mostTrait = q.options[optIdx].most;
          if (cur.leastIdx === optIdx) {
            delete cur.leastIdx; // can't be both
            delete cur.leastTrait;
          }
        }
      } else {
        if (cur.leastIdx === optIdx) {
          delete cur.leastIdx;
          delete cur.leastTrait;
        } else {
          cur.leastIdx = optIdx;
          if (q && q.options[optIdx]) cur.leastTrait = q.options[optIdx].least;
          if (cur.mostIdx === optIdx) {
            delete cur.mostIdx; // can't be both
            delete cur.mostTrait;
          }
        }
      }

      // Sync to cloud & local backup
      saveLocalBackup();
      if (state.token) {
        rtdb.ref('/assessmentTokens/' + state.token + '/answers/disc/' + qid).set(cur);
      }
      renderDiscQuestion();
    }`;

if (!testHtml.includes(oldSelectDiscToggle)) {
  console.error('Could not find oldSelectDiscToggle in test.html');
  process.exit(1);
}
testHtml = testHtml.replace(oldSelectDiscToggle, newSelectDiscToggle);

fs.writeFileSync(testHtmlPath, testHtml, 'utf8');
console.log('Successfully updated public/test.html');


// 2. Update public/assessment.html
const assessHtmlPath = path.join(__dirname, '..', 'public', 'assessment.html');
let assessHtml = fs.readFileSync(assessHtmlPath, 'utf8').replace(/\r\n/g, '\n');

// Replace QUESTIONS
const assQStart = assessHtml.indexOf('const QUESTIONS = [');
const assQEnd = assessHtml.indexOf('];', assQStart) + 2;
assessHtml = assessHtml.substring(0, assQStart) + bigFiveCode + assessHtml.substring(assQEnd);

// Replace DISC_QUESTIONS
const assDStart = assessHtml.indexOf('const DISC_QUESTIONS = [');
const assDEnd = assessHtml.indexOf('];', assDStart) + 2;
assessHtml = assessHtml.substring(0, assDStart) + discCode + assessHtml.substring(assDEnd);

// Update calculateDiscScores in assessment.html
if (!assessHtml.includes(oldCalcDiscTest)) {
  console.error('Could not find oldCalcDiscTest in assessment.html');
  process.exit(1);
}
assessHtml = assessHtml.replace(oldCalcDiscTest, newCalcDiscTest);

// Update selectDiscAnswer in assessment.html
const oldSelectDiscAnswer = `    function selectDiscAnswer(qid, type, optIdx) {
      if (!userAnswers[qid] || typeof userAnswers[qid] !== 'object') {
        userAnswers[qid] = {};
      }

      if (type === 'most') {
        // If this option was already least, unset least
        if (userAnswers[qid].leastIdx === optIdx) {
          delete userAnswers[qid].leastIdx;
        }
        userAnswers[qid].mostIdx = optIdx;
      } else if (type === 'least') {
        // If this option was already most, unset most
        if (userAnswers[qid].mostIdx === optIdx) {
          delete userAnswers[qid].mostIdx;
        }
        userAnswers[qid].leastIdx = optIdx;
      }`;

const newSelectDiscAnswer = `    function selectDiscAnswer(qid, type, optIdx) {
      if (!userAnswers[qid] || typeof userAnswers[qid] !== 'object') {
        userAnswers[qid] = {};
      }
      const q = DISC_QUESTIONS.find(item => item.id === qid);

      if (type === 'most') {
        // If this option was already least, unset least
        if (userAnswers[qid].leastIdx === optIdx) {
          delete userAnswers[qid].leastIdx;
          delete userAnswers[qid].leastTrait;
        }
        userAnswers[qid].mostIdx = optIdx;
        if (q && q.options[optIdx]) userAnswers[qid].mostTrait = q.options[optIdx].most;
      } else if (type === 'least') {
        // If this option was already most, unset most
        if (userAnswers[qid].mostIdx === optIdx) {
          delete userAnswers[qid].mostIdx;
          delete userAnswers[qid].mostTrait;
        }
        userAnswers[qid].leastIdx = optIdx;
        if (q && q.options[optIdx]) userAnswers[qid].leastTrait = q.options[optIdx].least;
      }`;

if (!assessHtml.includes(oldSelectDiscAnswer)) {
  console.error('Could not find oldSelectDiscAnswer in assessment.html');
  process.exit(1);
}
assessHtml = assessHtml.replace(oldSelectDiscAnswer, newSelectDiscAnswer);

fs.writeFileSync(assessHtmlPath, assessHtml, 'utf8');
console.log('Successfully updated public/assessment.html');
