import "dotenv/config"
import { runAgent } from "./agent";

const filePath = process.argv[2];

if (!filePath) {
    console.error("Usage: ts-node src/index.ts <file-path>");
    process.exit(1);
}

runAgent(filePath).then(console.log).catch(console.error);