const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace(
  "t.notes = (t.notes ? t.notes + '\r\n\r\n' : '') + remark;",
  "t.notes = (t.notes ? t.notes + '\\n\\n' : '') + remark;"
);
html = html.replace(
  "t.notes = (t.notes ? t.notes + '\n\n' : '') + remark;",
  "t.notes = (t.notes ? t.notes + '\\n\\n' : '') + remark;"
);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed newline string literal.');
