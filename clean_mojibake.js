const fs = require('fs');
let file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');

// Dictionary of replacements for common mojibake found
const replacements = {
  'ðŸ”’': '🔒',
  'ðŸš«': '🚫',
  'â—\x8F': '●',
  'ðŸŸ¢': '🟢',
  'â†—': '↗',
  'ðŸŒ\x90': '🌐',
  'â†\x90': '←',
  'â˜…': '★',
  'âœ•': '✕',
  'ðŸ“\x81': '📁',
  'ðŸ“¢': '📢',
  'ðŸ“…': '📅',
  'ðŸ’¬': '💬',
  'ðŸ’¡': '💡',
  'âš–ï¸\x8F': '⚖️',
  'â˜…â˜…â˜…â˜…â˜…': '★★★★★',
  'âœ\x8Fï¸\x8F': '✏️',
  'â˜\x81ï¸\x8F': '☁️',
  'ðŸ””': '🔔',
  'ðŸ‘‹': '👋',
  'ðŸ§\xa0': '🧠',
  'ðŸ”\x8D': '🔍',
  'â­\x90': '⭐',
  'ðŸŽ²': '🎲',
  'âˆ‘': '∑',
  'âˆ«': '∫',
  'âˆš': '√',
  'âš ï¸\x8F': '⚠️',
  'ðŸ‘‰': '👉',
  'â\x8F³': '⏳',
  'ðŸŽ¬': '🎬',
  'ðŸŽ¨': '🎨',
  'ðŸ“±': '📱',
  'ðŸŽ™ï¸\x8F': '🎙️',
  'ðŸ“‹': '📋',
  'ðŸ“ˆ': '📈',
  'ðŸ“¸': '📸',
  'âœ\x8Dï¸\x8F': '✍️',
  'ðŸ’¼': '💼',
  'ðŸ“‚': '📂',
  'â€¢': '•',
  'âž”': '➔',
  'ðŸ“š': '📚',
  'â\x8F°': '⏰',
  'ðŸ“\x8D': '📌',
  'ðŸŽ‰': '🎉',
  'âœ“': '✓',
  'âœ…': '✅',
  'ðŸ‘‘': '👑',
  'ðŸŽ“': '🎓',
  'ðŸ’°': '💰',
  'âœ‰ï¸\x8F': '✉️',
  'ðŸ“„': '📄',
  'â–¶ï¸\x8F': '▶️',
  'ðŸ“ž': '📞',
  'ðŸ–¼ï¸\x8F': '🖼️',
  'ðŸ\x8F¢': '🏢',
  'ðŸ‘¤': '👤',
  'ðŸ”´': '🔴',
  'âœ¨': '✨',
  'Ï€': 'π',
  'âˆž': '∞',
  'Â±': '±',
  'âˆ†': '∆',
  '': ''
};

for (const [bad, good] of Object.entries(replacements)) {
    html = html.split(bad).join(good);
}

// Remove any remaining `` variations or `â` garbage
html = html.replace(/[^\x00-\x7F\u2000-\u206F\u2700-\u27BF\u1F300-\u1F9FF\u2600-\u26FF\u2500-\u257F\u00A0-\u00FF\u2100-\u214F\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u2B00-\u2BFF\u2900-\u297F]/g, '');

// Fix specific leaks like ^dx, ^sx
html = html.replace(/\^dx/g, '✨');
html = html.replace(/\^sx/g, '💼');
html = html.replace(/const symbols = \[.*?\];/g, "const symbols = ['+', '-', '×', '÷', '=', '%'];");

fs.writeFileSync(file, html, 'utf8');
console.log('Cleaned index.html');
