const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

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
        
        // Use existing mousemove for coordinates without overriding anything
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
            if (!widgetContainer.lastWander || now - widgetContainer.lastWander > 3000) {
              // Wander around in the bottom half of the screen randomly
              targetX = Math.random() * (window.innerWidth - 300); // 300px buffer to prevent bubble overflow
              targetY = -Math.random() * 200; // Hop up to 200px
              widgetContainer.lastWander = now;
            }
          } else {
            state = 'CHASING';
            const padding = 130; // Stop 130px away from cursor
            
            // Raw target calculation based on center of the chicken widget
            let rawTargetX = mouseX - 24 - (rect.width / 2);
            let rawTargetY = mouseY - (window.innerHeight - 24) + (rect.height / 2) - 40; // Aim slightly below cursor
            
            if (rawTargetX < currentX) {
              targetX = rawTargetX + padding;
            } else {
              targetX = rawTargetX - padding;
            }
            targetY = rawTargetY;
            
            // Clamp to screen bounds
            targetX = Math.max(0, Math.min(targetX, window.innerWidth - rect.width - 24));
            targetY = Math.min(0, Math.max(targetY, -(window.innerHeight - rect.height - 24)));
          }
          
          const speed = state === 'CHASING' ? 0.05 : 0.015;
          currentX += (targetX - currentX) * speed;
          currentY += (targetY - currentY) * speed;
          
          widgetContainer.style.transform = \`translate(\${currentX}px, \${currentY}px)\`;
          
          requestAnimationFrame(updateChickenPosition);
        }
        
        requestAnimationFrame(updateChickenPosition);
      }
`;

html = html.replace(
  /      renderPsyduckBubbleContent\(\);\s*\}/,
  (match) => jsLogic + "\n" + match
);

fs.writeFileSync(file, html, 'utf8');
console.log('Chasing logic injected version 2.');
