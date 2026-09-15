const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// Replace the fallback img tag with the model-viewer
html = html.replace(
  /<img src="\/assets\/psyduck\.png".*?>/,
  '<model-viewer id="assistantModel" src="/assets/chicken_pet.glb" alt="Pet Assistant" autoplay camera-orbit="0deg 75deg 105%" disable-zoom disable-pan interaction-prompt="none" shadow-intensity="0" exposure="1" environment-image="neutral" style="width: 100%; height: 100%; background: transparent;"></model-viewer>'
);

// We also need to add the model-viewer script tag if it's missing
if (!html.includes('model-viewer.min.js')) {
    html = html.replace(
      /<\/head>/,
      '  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>\n</head>'
    );
}

// Ensure the stage doesn't have the circles and shadow
html = html.replace(
  /<div class="psyduck-hologram-ring"><\/div>/,
  ''
);

// We need to fix the cursor tracker JS as well
html = html.replace(
  /const stage = document\.getElementById\('psyduckStage'\);[\s\S]*?const psyduckImg = document\.getElementById\('psyduckImg'\);/,
  "const stage = document.getElementById('psyduckStage');\n    const assistantModel = document.getElementById('assistantModel');"
);

html = html.replace(
  /psyduckImg\.style\.transform = `perspective\(400px\) rotateX\(\$\{rotateX\}deg\) rotateY\(\$\{rotateY\}deg\) scale\(\$\{1 \+ Math\.abs\(normalizedX\)\*0\.05\}\)`;/,
  "if (assistantModel) {\n      const theta = 0 - (normalizedX * 45);\n      const phi = 75 - (normalizedY * 15);\n      assistantModel.setAttribute('camera-orbit', `${theta}deg ${phi}deg 105%`);\n    }"
);

fs.writeFileSync(file, html, 'utf8');
console.log('Fixed model and tracker.');
