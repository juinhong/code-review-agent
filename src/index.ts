import "dotenv/config";
import { runAgent } from "./agent";

const filePath = process.argv[2];

if (!filePath) {
    console.error("Usage: npx tsx src/index.ts <file-path>");
    process.exit(1);
}

runAgent(filePath).then((review) => {
    console.log("\n🔍 Code Review\n");

    console.log("🐛 Bugs:");
    review.bugs.length > 0
        ? review.bugs.forEach((b) => console.log(`  - ${b}`))
        : console.log("  None found");

    console.log("\n💡 Suggestions:");
    review.suggestions.length > 0
        ? review.suggestions.forEach((s) => console.log(`  - ${s}`))
        : console.log("  None found");

    console.log("\n🔒 Security Concerns:");
    review.securityConcerns.length > 0
        ? review.securityConcerns.forEach((s) => console.log(`  - ${s}`))
        : console.log("  None found");

    console.log("\n📝 Summary:");
    console.log(" ", review.summary);
}).catch(console.error);