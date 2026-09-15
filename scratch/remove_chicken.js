const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Remove call in initMainApp
html = html.replace('initPsyduckAssistant();', '// Assistant removed for professional mode');

// 2. Remove HTML container
const startHtml = html.indexOf('<div class="psyduck-widget-container"');
if (startHtml !== -1) {
  // find the closing </div> of container
  const imgIdx = html.indexOf('id="psyduckImg"');
  const endStage = html.indexOf('</div>', imgIdx);
  const endContainer = html.indexOf('</div>', endStage + 6);
  html = html.slice(0, startHtml) + html.slice(endContainer + 6);
  console.log('HTML widget container removed.');
}

// 3. Remove JS block
const jsHeader = '/* 3D INTERACTIVE RECRUITMENT ASSISTANT (PSYDUCK)       */';
const startJsIdx = html.indexOf(jsHeader);
if (startJsIdx !== -1) {
  const lineStart = html.lastIndexOf('/*', startJsIdx);
  const nextSection = '/* CANDIDATE DETAIL PROFILE SLIDE-OVER DRAWER           */';
  const endJsIdx = html.indexOf(nextSection);
  const lineEnd = html.lastIndexOf('/*', endJsIdx);
  html = html.slice(0, lineStart) + html.slice(lineEnd);
  console.log('JS block removed.');
}

// 4. Remove CSS block
const cssHeader = '/* 3D INTERACTIVE RECRUITMENT ASSISTANT (PSYDUCK)       */';
const startCssIdx = html.indexOf(cssHeader);
if (startCssIdx !== -1) {
  const lineStart = html.lastIndexOf('/*', startCssIdx);
  const nextSection = '/* CANDIDATE DETAIL PROFILE SLIDE-OVER DRAWER           */';
  const endCssIdx = html.indexOf(nextSection);
  const lineEnd = html.lastIndexOf('/*', endCssIdx);
  html = html.slice(0, lineStart) + html.slice(lineEnd);
  console.log('CSS block removed.');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Finished removing chicken/psyduck assistant!');
