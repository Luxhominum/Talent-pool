const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// Completely strip out the psyduck-3d-sphere wrapper but keep the inner content
html = html.replace(
  /<div class="psyduck-3d-sphere" id="psyduckSphere">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/,
  '$1</div></div>'
);

// We need to fix the mouse parallax script since psyduckSphere is removed. It was applying the rotation to psyduckSphere. We should apply it to psyduckStage instead.
html = html.replace(
  /const sphere = document\.getElementById\('psyduckSphere'\);[\s\S]*?if \(!stage \|\| !sphere\) return;/,
  "if (!stage) return;"
);
html = html.replace(
  /sphere\.style\.transform =/,
  "stage.style.transform ="
);

fs.writeFileSync(file, html, 'utf8');
console.log('Circle removed safely.');
