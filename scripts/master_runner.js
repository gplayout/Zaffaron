
/**
 * Master Runner for Ashpazi Batch Processing
 * Usage: node scripts/master_runner.js [chunk_id]
 * Chunks:
 * 1: 100-300
 * 2: 300-500
 * 3: 500-700
 * ...
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHUNK_SIZE = 200;
const INITIAL_OFFSET = 100; // Because 0-100 is done separately

const args = process.argv.slice(2);
const chunkId = parseInt(args[0]);

if (!chunkId || isNaN(chunkId)) {
    console.log("Usage: node scripts/master_runner.js <chunk_number>");
    console.log("Example: node scripts/master_runner.js 1  (Runs 100-300)");
    process.exit(1);
}

const start = INITIAL_OFFSET + ((chunkId - 1) * CHUNK_SIZE);
const size = CHUNK_SIZE;

console.log(`🚀 Master Runner: Starting Chunk #${chunkId}`);
console.log(`🎯 Range: ${start} to ${start + size}`);

const scriptPath = path.resolve(__dirname, 'batch_processor.js');

const child = spawn('node', [scriptPath, start, size], {
    stdio: 'inherit',
    shell: true
});

child.on('close', (code) => {
    console.log(`----------------------------------------`);
    if (code === 0) {
        console.log(`✅ Chunk #${chunkId} Completed Successfully.`);
        console.log(`Next Step: Verify results at http://localhost:5173/verify`);
        console.log(`Then Run: node scripts/master_runner.js ${chunkId + 1}`);
    } else {
        console.error(`❌ Chunk #${chunkId} Failed with code ${code}`);
    }
});
