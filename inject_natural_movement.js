const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// Replace the old easing speed logic with constant velocity
const oldSpeedLogic = `          const speed = (state === 'CHASING' || state === 'EATING') ? 0.04 : 0.01;
          currentX += (targetX - currentX) * speed;
          currentY += (targetY - currentY) * speed;`;

const newSpeedLogic = `          const maxSpeed = (state === 'CHASING' || state === 'EATING') ? 4.0 : 1.5; // Constant walking speed
          const distToTarget = Math.hypot(targetX - currentX, targetY - currentY);
          
          if (distToTarget > maxSpeed) {
            currentX += ((targetX - currentX) / distToTarget) * maxSpeed;
            currentY += ((targetY - currentY) / distToTarget) * maxSpeed;
          } else {
            currentX = targetX;
            currentY = targetY;
          }`;

html = html.replace(oldSpeedLogic, newSpeedLogic);

// Add currentTheta initialization to state machine variables
html = html.replace(
  /let targetX = 0;\s*let targetY = 0;/,
  `let targetX = 0;
        let targetY = 0;
        let currentTheta = -90; // Default facing right`
);

// Replace the old instant rotation logic with smooth angular lerping
const oldRotationLogic = `            let theta = (Math.atan2(dy, dx) * 180 / Math.PI) - 90;
            let phi = 75 - (dy / window.innerHeight) * 15;
            
            assistantModel.setAttribute('camera-orbit', \`\${theta.toFixed(1)}deg \${phi.toFixed(1)}deg 105%\`);`;

const newRotationLogic = `            let targetTheta = (Math.atan2(dy, dx) * 180 / Math.PI) - 90;
            
            // Smoothly interpolate rotation (taking shortest path)
            let diff = targetTheta - currentTheta;
            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;
            currentTheta += diff * 0.1; // Smooth turning
            
            let phi = 75 - (dy / window.innerHeight) * 15;
            
            assistantModel.setAttribute('camera-orbit', \`\${currentTheta.toFixed(1)}deg \${phi.toFixed(1)}deg 105%\`);`;

html = html.replace(oldRotationLogic, newRotationLogic);

fs.writeFileSync(file, html, 'utf8');
console.log('Natural movement physics applied.');
