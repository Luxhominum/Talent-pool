const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// Add the keyframes for dropAndBounce
if (!html.includes('@keyframes dropAndBounce')) {
    html = html.replace(
      '  <style>',
      `  <style>\n    @keyframes dropAndBounce {\n      0% { transform: translateY(-30px); opacity: 0; }\n      10% { opacity: 1; }\n      40% { transform: translateY(30px); animation-timing-function: ease-out; }\n      60% { transform: translateY(5px); animation-timing-function: ease-in; }\n      80% { transform: translateY(30px); animation-timing-function: ease-out; }\n      90% { transform: translateY(20px); animation-timing-function: ease-in; }\n      100% { transform: translateY(30px); }\n    }`
    );
}

// Replace the food dropping logic
const oldFoodLogic = `          const food = document.createElement('div');
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
          
          activePellets.push({ x: e.clientX, y: e.clientY, el: food });`;

const newFoodLogic = `          const foodWrapper = document.createElement('div');
          foodWrapper.style.position = 'fixed';
          foodWrapper.style.left = (e.clientX - 12) + 'px';
          foodWrapper.style.top = (e.clientY - 12) + 'px';
          foodWrapper.style.fontSize = '24px';
          foodWrapper.style.zIndex = '1000';
          foodWrapper.style.pointerEvents = 'none';
          
          const food = document.createElement('div');
          food.innerText = foodItems[Math.floor(Math.random() * foodItems.length)];
          food.style.animation = 'dropAndBounce 0.6s ease-in-out forwards';
          food.style.transition = 'transform 0.2s';
          
          foodWrapper.appendChild(food);
          document.body.appendChild(foodWrapper);
          
          activePellets.push({ x: e.clientX, y: e.clientY + 30, el: foodWrapper, innerEl: food });`;

html = html.replace(oldFoodLogic, newFoodLogic);

// Update eating logic
const oldEatingLogic = `            if (dist < 15) {
              targetPellet.el.style.transform = 'translate(-50%, -50%) scale(0)';
              setTimeout(() => targetPellet.el.remove(), 200);
              activePellets.shift();
            }`;

const newEatingLogic = `            if (dist < 15) {
              targetPellet.innerEl.style.animation = 'none';
              targetPellet.innerEl.style.transform = 'scale(0)';
              setTimeout(() => targetPellet.el.remove(), 200);
              activePellets.shift();
            }`;

html = html.replace(oldEatingLogic, newEatingLogic);

fs.writeFileSync(file, html, 'utf8');
console.log('Drop animation added.');
