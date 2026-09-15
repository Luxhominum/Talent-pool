const fs = require('fs');
const readline = require('readline');

async function extract() {
    const fileStream = fs.createReadStream('C:/Users/User/.gemini/antigravity/brain/96e6a36a-dd0e-4271-825d-0f44ce115687/.system_generated/logs/transcript_full.jsonl');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let latestContent = null;

    for await (const line of rl) {
        if (line.includes('generate_public_index.js')) {
            try {
                const data = JSON.parse(line);
                if (data.tool_calls) {
                    for (const call of data.tool_calls) {
                        if (call.name && call.name.includes('write_to_file')) {
                            const args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : call.arguments;
                            if (args.TargetFile && args.TargetFile.includes('generate_public_index.js')) {
                                latestContent = args.CodeContent;
                            }
                        }
                    }
                }
            } catch(e) {}
        }
    }
    
    if (latestContent) {
        fs.writeFileSync('C:/Users/User/.gemini/antigravity/brain/96e6a36a-dd0e-4271-825d-0f44ce115687/scratch/generate_public_index_restored.js', latestContent, 'utf8');
        console.log('Found and restored!');
    } else {
        console.log('Not found');
    }
}
extract();
