const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// Add the running animation CSS to the widget container
html = html.replace(
  /\.psyduck-widget-container {[\s\S]*?z-index: 1040;/,
  `.psyduck-widget-container {
      position: fixed;
      bottom: 24px;
      left: 0; /* Changed from 24px to 0 for the transform animation */
      z-index: 1040;
      animation: chickenRunAcross 12s linear infinite;`
);

// Insert the keyframes right after the container css
html = html.replace(
  /user-select: none;\s*}/,
  `user-select: none;
    }
    
    @keyframes chickenRunAcross {
      0% { transform: translateX(-350px); }
      100% { transform: translateX(110vw); }
    }`
);

fs.writeFileSync(file, html, 'utf8');
console.log('Running animation added.');
