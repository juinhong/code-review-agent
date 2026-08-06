#!/usr/bin/env node

import "dotenv/config";
import { program } from "commander";
import { runAgent } from "./agent.js";
import { getDiff, getStagedFiles } from "./diff.js";
import { ReviewResult, Finding } from "./schema.js";
import { installHook } from "./hook.js";

const SEVERITY_BADGE: Record<Finding["severity"], string> = {
    critical: "🔴 CRITICAL",
    warning: "🟡 WARNING ",
    info: "🔵 INFO    ",
};

async function main() {
    program
        .name("code-review-agent")
        .description("AI-powered code review CLI")
        .version("1.0.0");

    program
        .argument("[file]", "file to review")
        .option("--staged", "review staged diff as a whole")
        .option("--staged-files", "review each staged file individually")
        .option("--diff <ref>", "review diff against a git ref (e.g. HEAD~1)")
        .option("--install-hook", "install pre-commit git hook")
        .action(async (file, options) => {
            if (options.installHook) {
                installHook();
                return;
            }

            if (options.stagedFiles) {
                const files = await getStagedFiles();
                if (files.length === 0) {
                    console.log("No staged files found.");
                    return;
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
                    return;
                }
            }

            if (options.staged) {
                const diff = await getDiff("staged");
                if (!diff.trim()) {
                    console.log("No staged changes found.");
                    return;
                }
                const review = await runAgent({ mode: "diff", content: diff });
                printReview(review);
                return;
            }

            if (options.diff) {
                const diff = await getDiff(options.diff);
                if (!diff.trim()) {
                    console.log("No changes found.");
                    return;
                }
                const review = await runAgent({ mode: "diff", content: diff });
                printReview(review);
                return;
            }

            if (file) {
                const review = await runAgent({ mode: "file", content: file });
                printReview(review);
                return;
            }

            program.help();
        });

    await program.parseAsync();
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

function printReview(review: ReviewResult): boolean {
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