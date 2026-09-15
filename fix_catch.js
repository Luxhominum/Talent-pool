const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

html = html.replace(
  `        showToast('⚠️ Gagal menyimpan template pesan.');\n      }\n    } catch(e) {}\n    }`,
  `        showToast('⚠️ Gagal menyimpan template pesan.');\n      }\n    }`
);

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('Fixed trailing catch(e) {}.');
