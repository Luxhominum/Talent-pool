const fs = require('fs');
global.window = {};
require('../public/js/interview-questions.js');

console.log('Role Title:', window.PGE_INTERVIEW_DATA.roleTitle);
console.log('Total Questions:', window.PGE_INTERVIEW_DATA.formQuestions.length);
console.log('Total Bank Questions:', window.PGE_INTERVIEW_DATA.bankQuestions.length);
console.log('Rubrics:', window.PGE_INTERVIEW_DATA.rubrics.length);
console.log('Competency Guides keys:', Object.keys(window.PGE_INTERVIEW_DATA.competencyGuides));
