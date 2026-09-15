const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// 1. Swap Psyduck for Chicken Pet, add autoplay, remove sphere/glare/circles
html = html.replace(
  /<div class="psyduck-3d-sphere" id="psyduckSphere">([\s\S]*?)<\/div>\s*<\/div>/,
  '$1'
);
html = html.replace('psyduck.glb', 'chicken_pet.glb');
html = html.replace(/<model-viewer([^>]*)>/, (match, attrs) => {
    if (!attrs.includes('autoplay')) {
        return `<model-viewer${attrs} autoplay>`;
    }
    return match;
});

// Remove orbit items which leak
html = html.replace(/<div class="psyduck-orbit-item orbit-[1-3]">.*?<\/div>/g, '');

// 2. Make it larger and remove background circle CSS
html = html.replace(
  /width: 74px;\s*height: 74px;/,
  'width: 160px; height: 160px;'
);

// 3. Fix 5-star filter strict equality bug
html = html.replace(
  /if \(ratingFilter === '5' && itemRating !== 5\) return false;/,
  "if (ratingFilter === '5' && Math.floor(Number(itemRating)) !== 5) return false;"
);
html = html.replace(
  /if \(ratingFilter === '4' && \(itemRating < 4 \|\| itemRating >= 5\)\) return false;/,
  "if (ratingFilter === '4' && (Number(itemRating) < 4 || Number(itemRating) >= 5)) return false;"
);

// 4. Fix Cursor Tracker Math (invert X and Y if it looks the wrong way)
html = html.replace(
  /const theta = -30 \+ \(normalizedX \* 60\);[\s\S]*?const phi = 75 \+ \(normalizedY \* 20\);/,
  'const theta = 0 - (normalizedX * 45);\n    const phi = 75 - (normalizedY * 15);'
);

// 5. Direct HR Access Bypassing OAuth
html = html.replace(
  /<\/div>\s*<p class="mt-8 text-center text-sm text-slate-500 font-mono">/,
  `</div>
      <div class="mt-4 flex justify-center">
        <button onclick="handleDirectSuperAdminAccess()" class="text-xs text-slate-400 hover:text-slate-600 underline">⚡ Direct Access (hrdcvpge@gmail.com)</button>
      </div>
      <p class="mt-8 text-center text-sm text-slate-500 font-mono">`
);

// 6. Direct Access Function
html = html.replace(
  /function loginWithGoogle\(\) {/,
  `function handleDirectSuperAdminAccess() {
    window.USER_EMAIL = 'hrdcvpge@gmail.com';
    window.USER_NAME = 'HRD PGE (Bypass)';
    window.USER_AVATAR = 'https://ui-avatars.com/api/?name=HRD+PGE&background=random';
    document.getElementById('loginGate').classList.add('hidden');
    bootApp();
  }
  
  function loginWithGoogle() {`
);

fs.writeFileSync(file, html, 'utf8');
console.log('Modifications applied.');
