const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// 1. Remove the old camera-orbit update inside the original mousemove listener
html = html.replace(
  /\/\/ Translate to camera-orbit for 3D model[\s\S]*?if \(assistantModel\) \{[\s\S]*?const theta = 0 - \(deltaX \* 45\);[\s\S]*?const phi = 75 - \(deltaY \* 15\);[\s\S]*?assistantModel\.setAttribute\('camera-orbit', `\$\{theta\.toFixed\(1\)\}deg \$\{phi\.toFixed\(1\)\}deg 105%`\);[\s\S]*?\}/,
  '// Camera orbit is now handled by the state machine loop'
);

// 2. Add the dynamic rotation to the updateChickenPosition loop
const newRotationLogic = `
          // Face the target (Full 360 degree rotation)
          const assistantModel = document.getElementById('assistantModel');
          if (assistantModel) {
            const chickenCenterX = rect.left + (rect.width / 2);
            const chickenCenterY = rect.top + (rect.height / 2);
            
            let dx, dy;
            if (state === 'WANDERING' || state === 'RETURNING_HOME') {
              dx = targetX - currentX;
              dy = targetY - currentY;
              if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
                dx = 0; dy = 1; // Default face forward
              }
            } else {
              dx = mouseX - chickenCenterX;
              dy = mouseY - chickenCenterY;
            }
            
            let theta = (Math.atan2(dy, dx) * 180 / Math.PI) - 90;
            let phi = 75 - (dy / window.innerHeight) * 15;
            
            assistantModel.setAttribute('camera-orbit', \`\${theta.toFixed(1)}deg \${phi.toFixed(1)}deg 105%\`);
          }
`;

html = html.replace(
  /widgetContainer\.style\.transform = `translate\(\$\{currentX\}px, \$\{currentY\}px\)`;/,
  `widgetContainer.style.transform = \`translate(\${currentX}px, \${currentY}px)\`;
  ${newRotationLogic}`
);

fs.writeFileSync(file, html, 'utf8');
console.log('Rotation logic updated.');
