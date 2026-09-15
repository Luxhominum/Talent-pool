const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// Replace the mousemove tracker to work for model-viewer (deltaX, deltaY)
html = html.replace(
  /const rotY = Math\.max\(-25, Math\.min\(25, deltaX \* 25\)\);[\s\S]*?sphere\.style\.transform = `perspective\(600px\) rotateX\(\$\{rotX\.toFixed\(1\)\}deg\) rotateY\(\$\{rotY\.toFixed\(1\)\}deg\) translateZ\(12px\)`(;)?/,
  `// Translate to camera-orbit for 3D model
        const assistantModel = document.getElementById('assistantModel');
        if (assistantModel) {
            // Adjust theta (yaw) and phi (pitch) so the chicken looks at the mouse
            const theta = 0 - (deltaX * 45); // Adjust multiplier as needed
            const phi = 75 - (deltaY * 15);
            assistantModel.setAttribute('camera-orbit', \`\${theta.toFixed(1)}deg \${phi.toFixed(1)}deg 105%\`);
        }`
);

fs.writeFileSync(file, html, 'utf8');
console.log('Fixed mouse tracker.');
