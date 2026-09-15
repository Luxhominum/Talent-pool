const fs = require('fs');
const readline = require('readline');

async function extract() {
    const fileStream = fs.createReadStream('C:/Users/User/.gemini/antigravity/brain/96e6a36a-dd0e-4271-825d-0f44ce115687/.system_generated/logs/transcript_full.jsonl');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
        if (line.includes('generate_public_index.js') && line.includes('write_to_file')) {
            const data = JSON.parse(line);
            if (data.tool_calls) {
                for (const call of data.tool_calls) {
                    if (call.function && call.function.name === 'write_to_file' && call.function.arguments.includes('generate_public_index.js')) {
                        const args = JSON.parse(call.function.arguments);
                        if (args.CodeContent) {
                            fs.writeFileSync('C:/Users/User/.gemini/antigravity/brain/96e6a36a-dd0e-4271-825d-0f44ce115687/scratch/generate_public_index.js', args.CodeContent, 'utf8');
                            console.log('Restored from transcript!');
                            return;
                        }
                    }
                }
            }
        }
    }
}
extract();
