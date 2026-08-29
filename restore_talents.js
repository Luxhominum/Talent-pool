const fs = require('fs');
const readline = require('readline');

async function extractPGETalents() {
  const filePath = 'C:/Users/User/.gemini/antigravity/brain/30d27819-6012-41bc-9d44-e7866600f7d7/.system_generated/logs/transcript_full.jsonl';
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (line.includes('imported_pge_talents.json') && line.includes('"CodeContent":')) {
      console.log('Found write_to_file for imported_pge_talents.json at line', lineNum);
      const json = JSON.parse(line);
      for (const tc of (json.tool_calls || [])) {
        if (tc.args && tc.args.TargetFile && tc.args.TargetFile.includes('imported_pge_talents.json')) {
          fs.writeFileSync('imported_pge_talents.json', tc.args.CodeContent);
          console.log('RESTORED imported_pge_talents.json! Length:', tc.args.CodeContent.length);
          return;
        }
      }
    }
  }
}

extractPGETalents();
