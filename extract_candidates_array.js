const fs = require('fs');
const readline = require('readline');

async function searchCandidatesArray() {
  const filePath = 'C:/Users/User/.gemini/antigravity/brain/30d27819-6012-41bc-9d44-e7866600f7d7/.system_generated/logs/transcript.jsonl';
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (lineNum === 246 || lineNum === 252 || lineNum === 332 || lineNum === 421 || lineNum === 422) {
      console.log(`Line ${lineNum}: ${line.slice(0, 300)}...`);
      if (line.includes('PGE-001') || line.includes('INITIAL_TALENTS') || line.includes('excelData')) {
        fs.writeFileSync(`extracted_line_${lineNum}.json`, line);
      }
    }
  }
}

searchCandidatesArray();
