const fs = require('fs');
const readline = require('readline');

async function extractLine(targetLine) {
  const filePath = 'C:/Users/User/.gemini/antigravity/brain/30d27819-6012-41bc-9d44-e7866600f7d7/.system_generated/logs/transcript.jsonl';
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (lineNum === targetLine) {
      fs.writeFileSync('extracted_line_' + targetLine + '.json', line);
      console.log('Saved line ' + targetLine + ' (length ' + line.length + ')');
      break;
    }
  }
}

extractLine(806);
