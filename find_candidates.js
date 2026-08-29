const fs = require('fs');
const readline = require('readline');

async function search() {
  const filePath = 'C:/Users/User/.gemini/antigravity/brain/30d27819-6012-41bc-9d44-e7866600f7d7/.system_generated/logs/transcript.jsonl';
  if (!fs.existsSync(filePath)) {
    console.log('File does not exist');
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let bestData = null;

  for await (const line of rl) {
    if (line.includes('Fitria Nofvita') || line.includes('PGE-001')) {
      const idx = line.indexOf('"talents":[');
      if (idx !== -1) {
        const start = idx + 10;
        let depth = 0;
        let end = -1;
        for (let i = start; i < line.length; i++) {
          if (line[i] === '[') depth++;
          else if (line[i] === ']') {
            depth--;
            if (depth === 0) {
              end = i + 1;
              break;
            }
          }
        }
        if (end !== -1) {
          try {
            const raw = line.slice(start, end);
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > (bestData ? bestData.length : 0)) {
              bestData = parsed;
              console.log('Found candidates array with length:', bestData.length);
            }
          } catch(e) {}
        }
      }
    }
  }

  if (bestData) {
    fs.writeFileSync('restored_candidates.json', JSON.stringify(bestData, null, 2));
    console.log('WROTE ' + bestData.length + ' CANDIDATES TO restored_candidates.json!');
  } else {
    console.log('No array found directly with talents key, searching for broader candidate array...');
  }
}

search();
