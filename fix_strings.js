const fs = require('fs');
let file = 'C:/Users/User/.gemini/antigravity/brain/96e6a36a-dd0e-4271-825d-0f44ce115687/scratch/generate_public_index.js';
let content = fs.readFileSync(file, 'utf8');

// Fix encoding issues if they happened
content = content.replace(/ðŸ˜µâ€ ðŸ’«/g, '?????');
content = content.replace(/â­ /g, '?');
content = content.replace(/ðŸ’¡/g, '??');

content = content.replace(
  /bubbleText\.innerHTML = \\\\Aduh pusing Kak! Masih ada <strong>\\ kandidat<\/strong> di tahap <em>Prospect<\/em> yang belum discreening\. Yuk review atau short-list sekarang! ?????\\\\;/g,
  'bubbleText.innerHTML = \\Aduh pusing Kak! Masih ada <strong>\\ kandidat</strong> di tahap <em>Prospect</em> yang belum discreening. Yuk review atau short-list sekarang! ?????\\;'
);

content = content.replace(
  /bubbleText\.innerHTML = \\\\Wah, ada <strong>\\ kandidat bintang lima \(? 5\.0\)<\/strong> di pipeline! Cek portofolio karya mereka sebelum disalip kompetitor ya Kak! ??\\\\;/g,
  'bubbleText.innerHTML = \\Wah, ada <strong>\\ kandidat bintang lima (? 5.0)</strong> di pipeline! Cek portofolio karya mereka sebelum disalip kompetitor ya Kak! ??\\;'
);

fs.writeFileSync(file, content, 'utf8');
