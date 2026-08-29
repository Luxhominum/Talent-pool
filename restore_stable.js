const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Starting 1-Click Restoration to Stable Production v1.0.0...');

const backupDir = path.join(__dirname, 'backups', 'stable_v1.0');
if (!fs.existsSync(backupDir)) {
  console.error('❌ Backup directory not found: ' + backupDir);
  process.exit(1);
}

fs.copyFileSync(path.join(backupDir, 'index.html'), path.join(__dirname, 'public', 'index.html'));
fs.copyFileSync(path.join(backupDir, 'favicon.svg'), path.join(__dirname, 'public', 'favicon.svg'));
fs.copyFileSync(path.join(backupDir, 'database.rules.json'), path.join(__dirname, 'database.rules.json'));
fs.copyFileSync(path.join(backupDir, 'firebase.json'), path.join(__dirname, 'firebase.json'));
fs.copyFileSync(path.join(backupDir, 'storage.rules'), path.join(__dirname, 'storage.rules'));

console.log('✅ Core files successfully restored from backups/stable_v1.0!');
console.log('🚀 Redeploying restored stable version to Firebase...');

try {
  execSync('npx --yes firebase-tools deploy --only hosting,database', { stdio: 'inherit' });
  console.log('🎉 PGE Talent Pool has been successfully restored and is LIVE at https://pge-talentpool.web.app!');
} catch (e) {
  console.error('Deployment error:', e.message);
}
