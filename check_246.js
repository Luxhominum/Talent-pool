const fs = require('fs');
const readline = require('readline');

async function checkLine246() {
  const filePath = 'C:/Users/User/.gemini/antigravity/brain/30d27819-6012-41bc-9d44-e7866600f7d7/.system_generated/logs/transcript_full.jsonl';
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (lineNum === 246) {
      console.log('Line 246 length:', line.length);
      const json = JSON.parse(line);
      console.log('Tool calls:', json.tool_calls.map(tc => tc.name));
      for (const tc of json.tool_calls) {
        console.log('Args keys:', Object.keys(tc.args));
        if (tc.args.TargetFile) console.log('TargetFile:', tc.args.TargetFile);
        if (tc.args.CodeContent) {
          fs.writeFileSync('restored_code.txt', tc.args.CodeContent);
          console.log('Saved CodeContent to restored_code.txt! Length:', tc.args.CodeContent.length);
        }
      }
      break;
    }
  }
}

checkLine246();
