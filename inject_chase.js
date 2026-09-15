const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// 1. Revert CSS
html = html.replace(
  /left: 0; \/\* Changed from 24px to 0 for the transform animation \*\//,
  'left: 24px;'
);
html = html.replace(
  /\s*animation: chickenRunAcross 12s linear infinite;/,
  ''
);

// 2. Remove keyframes
html = html.replace(
  /\s*@keyframes chickenRunAcross \{[\s\S]*?\}/,
  ''
);

// 3. Inject JS logic at the end of initPsyduckAssistant
const jsLogic = `
      // Chicken Chasing State Machine
      const widgetContainer = document.getElementById('psyduckWidgetContainer');
      if (widgetContainer) {
        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;
        
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let lastMouseMoveTime = Date.now();
        let isMouseInWindow = true;
        
        window.addEventListener('mousemove', (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          lastMouseMoveTime = Date.now();
          isMouseInWindow = true;
        });
        
        document.addEventListener('mouseleave', () => {
          isMouseInWindow = false;
        });
        document.addEventListener('mouseenter', () => {
          isMouseInWindow = true;
        });
        
        function updateChickenPosition() {
          const now = Date.now();
          const idleTime = now - lastMouseMoveTime;
          
          const rect = widgetContainer.getBoundingClientRect();
          
          let state = 'IDLE';
          if (!isMouseInWindow || idleTime > 15000) {
            state = 'RETURNING_HOME';
            targetX = 0;
            targetY = 0;
          } else if (idleTime > 5000) {
            state = 'WANDERING';
            if (!widgetContainer.lastWander || now - widgetContainer.lastWander > 2000) {
              targetX = Math.random() * (window.innerWidth - rect.width - 48);
              targetY = Math.min(0, -Math.random() * 100);
              widgetContainer.lastWander = now;
            }
          } else {
            state = 'CHASING';
            const padding = 120; // Stop 120px away from cursor
            
            // Base offset is left:24px, bottom:24px
            let rawTargetX = mouseX - 24 - (rect.width / 2);
            let rawTargetY = mouseY - (window.innerHeight - 24) + (rect.height / 2);
            
            if (rawTargetX < currentX) {
              targetX = rawTargetX + padding;
            } else {
              targetX = rawTargetX - padding;
            }
            targetY = rawTargetY + (rect.height / 2); // Keep it slightly below cursor
            
            // Clamp to screen bounds
            targetX = Math.max(0, Math.min(targetX, window.innerWidth - rect.width - 24));
            targetY = Math.min(0, Math.max(targetY, -(window.innerHeight - rect.height - 24)));
          }
          
          const speed = state === 'CHASING' ? 0.04 : 0.015;
          currentX += (targetX - currentX) * speed;
          currentY += (targetY - currentY) * speed;
          
          widgetContainer.style.transform = \`translate(\${currentX}px, \${currentY}px)\`;
          
          requestAnimationFrame(updateChickenPosition);
        }
        
        requestAnimationFrame(updateChickenPosition);
      }
`;

// Insert just before the end of initPsyduckAssistant
html = html.replace(
  /      \}\);\s*\}\s*function renderPsyduckBubbleContent/,
  (match) => jsLogic + match
);

fs.writeFileSync(file, html, 'utf8');
console.log('Chasing logic injected.');
