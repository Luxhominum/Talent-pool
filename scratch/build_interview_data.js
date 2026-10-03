const fs = require('fs');
const xlsx = require('xlsx');

const excelPath = 'C:/Users/User/Downloads/PGE_Interview_Marketplace_Online_Sales_Officer.xlsx';
const wb = xlsx.readFile(excelPath);

// 1. Interview Form
const sheet1 = wb.Sheets['Interview Form'];
const rawForm = xlsx.utils.sheet_to_json(sheet1, {header: 1});
const headerIdx = rawForm.findIndex(r => r && r[0] === 'No.');
const formQuestions = [];
if (headerIdx !== -1) {
  for (let i = headerIdx + 1; i < rawForm.length; i++) {
    const row = rawForm[i];
    if (!row || !row[0] || typeof row[0] !== 'number') continue;
    formQuestions.push({
      num: row[0],
      competency: (row[1] || '').trim(),
      question: (row[2] || '').trim(),
      probing: (row[3] || '').trim()
    });
  }
}

// 2. Question Bank
const sheet2 = wb.Sheets['Question Bank'];
const rawBank = xlsx.utils.sheet_to_json(sheet2);
const bankQuestions = rawBank.map(r => ({
  num: r['No.'],
  area: (r['Area'] || '').trim(),
  question: (r['General Question'] || '').trim(),
  probing: (r['Probing Questions'] || '').trim()
}));

// 3. Scoring Guide
const sheet3 = wb.Sheets['Scoring Guide'];
const rawGuide = xlsx.utils.sheet_to_json(sheet3, {header: 1});
const rubrics = [];
const competencyGuides = {};
let isCompSection = false;
rawGuide.forEach(r => {
  if (!r || r.length === 0) return;
  if (r[0] === 'Competency') { isCompSection = true; return; }
  if (r[0] === 'Score') return;
  if (!isCompSection && typeof r[0] === 'number') {
    rubrics.push({ score: r[0], def: (r[1] || '').trim(), evidence: (r[2] || '').trim(), interp: (r[3] || '').trim() });
  } else if (isCompSection && typeof r[0] === 'string' && r[0].trim()) {
    competencyGuides[r[0].trim()] = { good: (r[1] || '').trim(), warning: (r[2] || '').trim() };
  }
});

const fileContent = `/**
 * PGE Structured Interview Questions & Assessment Rubric
 * Position: Marketplace & Online Sales Officer
 */
window.PGE_INTERVIEW_DATA = {
  roleTitle: "Marketplace & Online Sales Officer",
  formQuestions: ${JSON.stringify(formQuestions, null, 2)},
  bankQuestions: ${JSON.stringify(bankQuestions, null, 2)},
  rubrics: ${JSON.stringify(rubrics, null, 2)},
  competencyGuides: ${JSON.stringify(competencyGuides, null, 2)}
};
`;

fs.writeFileSync('public/js/interview-questions.js', fileContent, 'utf8');
console.log('Successfully generated public/js/interview-questions.js with size:', fs.statSync('public/js/interview-questions.js').size);
