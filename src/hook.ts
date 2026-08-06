import { writeFileSync, chmodSync, existsSync } from "fs";
import { join } from "path";

export function installHook() {
    const hooksDir = join(process.cwd(), ".git", "hooks")
    const hookPath = join(hooksDir, "pre-commit")

    if (!existsSync(hooksDir)) {
        throw new Error("No .git directory found. Are you in a git repo?")
    }

    if (existsSync(hookPath)) {
        console.warn("⚠️  A pre-commit hook already exists at .git/hooks/pre-commit");
        console.warn("   Remove it manually if you want to reinstall.");
        return;
    }

    const script = `#!/bin/sh
echo "🔍 Running code-review-agent..."
npx tsx src/index.ts --staged-files
exit $?
`;

    writeFileSync(hookPath, script, { encoding: "utf-8" });
    chmodSync(hookPath, "755");

    console.log("✅ Pre-commit hook installed at .git/hooks/pre-commit");
    console.log("   The agent will now run on every commit.");
}