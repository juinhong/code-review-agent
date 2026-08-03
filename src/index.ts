#!/usr/bin/env node

import "dotenv/config";
import { runAgent } from "./agent.js";
import { getDiff, getStagedFiles } from "./diff.js";
import { ReviewResult, Finding } from "./schema.js";
import { installHook } from "./hook.js";

const args = process.argv.slice(2);
const diffFlagIndex = args.indexOf("--diff");
const stagedFlag = args.includes("--staged");
const stagedFilesFlag = args.includes("--staged-files");

const SEVERITY_BADGE: Record<Finding["severity"], string> = {
    critical: "🔴 CRITICAL",
    warning: "🟡 WARNING ",
    info: "🔵 INFO    ",
};

if (args.includes("--install-hook")) {
    installHook();
    process.exit(0);
}

async function main() {
    if (stagedFlag) {
        const diff = await getDiff("staged");
        if (!diff.trim()) {
            console.log("No staged changes found.");
            process.exit(0);
        }
        const review = await runAgent({ mode: "diff", content: diff });
        printReview(review);
    } else if (diffFlagIndex !== -1) {
        const ref = args[diffFlagIndex + 1];
        if (!ref) {
            console.error("Usage: npx tsx src/index.ts --diff <ref>");
            process.exit(1);
        }
        const diff = await getDiff(ref);
        if (!diff.trim()) {
            console.log("No changes found.");
            process.exit(0);
        }
        const review = await runAgent({ mode: "diff", content: diff });
        printReview(review);
    } else if (stagedFilesFlag) {
        const files = await getStagedFiles();
        if (files.length === 0) {
            console.log("No staged files found.");
            process.exit(0);
        }

        console.log(`\n🔍 Reviewing ${files.length} staged file(s)...\n`);

        let hasCritical = false;

        for (const file of files) {
            console.log(`\n${"─".repeat(50)}`);
            console.log(`📄 ${file}`);
            console.log("─".repeat(50));
            try {
                const review = await runAgent({ mode: "file", content: file });
                const critical = printReview(review);
                if (critical) {
                    hasCritical = true;
                }
            } catch (e) {
                console.error(`  ❌ Skipped: ${(e as Error).message}`);
            }
        }

        if (hasCritical) {
            console.log("\n🚫 Commit blocked — critical issues found. Fix them before committing.");
            process.exit(1);
        } else {
            console.log("\n✅ All clear — no critical issues found.");
            process.exit(0);
        }
    } else {
        const filePath = args[0];
        if (!filePath) {
            console.error("Usage: npx tsx src/index.ts <file-path>");
            console.error("       npx tsx src/index.ts --staged");
            console.error("       npx tsx src/index.ts --diff <ref>");
            process.exit(1);
        }
        const review = await runAgent({ mode: "file", content: filePath });
        printReview(review);
    }
}

function printFindings(findings: Finding[]) {
    if (findings.length === 0) {
        console.log("  None found");
        return;
    }

    const sorted = [...findings].sort((a, b) => {
        const order: Record<Finding["severity"], number> = { critical: 0, warning: 1, info: 2 };
        return order[a.severity] - order[b.severity];
    });

    sorted.forEach((f) => {
        const line = f.line ? ` (line ${f.line})` : "";
        console.log(`  ${SEVERITY_BADGE[f.severity]}${line} — ${f.message}`);
    });
}

function printReview(review: ReviewResult) {
    console.log("\n🔍 Code Review\n");

    console.log("🐛 Bugs:");
    printFindings(review.bugs);

    console.log("\n💡 Suggestions:");
    printFindings(review.suggestions);

    console.log("\n🔒 Security Concerns:");
    printFindings(review.securityConcerns);

    console.log("\n📝 Summary:");
    console.log(" ", review.summary);

    const allFindings = [...review.bugs, ...review.suggestions, ...review.securityConcerns]
    return allFindings.some((f) => f.severity === "critical")
}

main().catch((e) => {
    console.error(`\n❌ ${(e as Error).message}`);
    process.exit(1);
});