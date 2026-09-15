const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// 1. Add cursor CSS
if (!html.includes('cursor: url(')) {
    html = html.replace(
      '  <style>',
      `  <style>\n    body { cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' style='font-size: 24px;'><text y='24'>🥡</text></svg>"), auto; }`
    );
}

// 2. Insert activePellets array and click listener
const pelletInitLogic = `
        const foodItems = ['🌽', '🟤', '🐛', '🌱', '🥜'];
        const activePellets = [];
        
        document.addEventListener('click', (e) => {
          if (e.target.closest('button, a, input, .psyduck-widget-container, .toast')) return;
          
          const food = document.createElement('div');
          food.innerText = foodItems[Math.floor(Math.random() * foodItems.length)];
          food.style.position = 'fixed';
          food.style.left = e.clientX + 'px';
          food.style.top = e.clientY + 'px';
          food.style.transform = 'translate(-50%, -50%)';
          food.style.fontSize = '24px';
          food.style.zIndex = '1000';
          food.style.pointerEvents = 'none';
          food.style.transition = 'transform 0.2s';
          document.body.appendChild(food);
          
          activePellets.push({ x: e.clientX, y: e.clientY, el: food });
        });
        
        let currentX = 0;`;

html = html.replace(
  /let currentX = 0;/,
  pelletInitLogic
);

// 3. Update State Machine
const newStateMachine = `
          let state = 'IDLE';
          if (activePellets.length > 0) {
            state = 'EATING';
            const targetPellet = activePellets[0];
            
            let rawTargetX = targetPellet.x - 24 - (rect.width / 2);
            let rawTargetY = targetPellet.y - (window.innerHeight - 24) + (rect.height / 2) - 30; // Aim at the bottom of the chicken
            
            targetX = Math.max(0, Math.min(rawTargetX, window.innerWidth - rect.width - 24));
            targetY = Math.min(0, Math.max(rawTargetY, -(window.innerHeight - rect.height - 24)));
            
            // Check if arrived
            const dist = Math.hypot(targetX - currentX, targetY - currentY);
            if (dist < 15) {
              targetPellet.el.style.transform = 'translate(-50%, -50%) scale(0)';
              setTimeout(() => targetPellet.el.remove(), 200);
              activePellets.shift();
            }
          } else if (!isMouseInWindow || idleTime > 15000) {`;

html = html.replace(
  /let state = 'IDLE';\s*if \(!isMouseInWindow \|\| idleTime > 15000\) \{/,
  newStateMachine
);

// 4. Update Rotation Logic to point at pellets too
const rotationLogic = `let dx, dy;
            if (state === 'WANDERING' || state === 'RETURNING_HOME' || state === 'EATING') {`;

html = html.replace(
  /let dx, dy;\s*if \(state === 'WANDERING' \|\| state === 'RETURNING_HOME'\) \{/,
  rotationLogic
);

// 5. Update Speed logic
const speedLogic = `const speed = (state === 'CHASING' || state === 'EATING') ? 0.04 : 0.01;`;

html = html.replace(
  /const speed = state === 'CHASING' \? 0\.02 : 0\.008;/,
  speedLogic
);

fs.writeFileSync(file, html, 'utf8');
console.log('Pellet dropping mechanic added.');
