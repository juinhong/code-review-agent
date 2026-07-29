import { execSync } from "child_process";

export function getDiff(ref: "staged" | string): string {
    try {
        if (ref === "staged") {
            return execSync("git diff --staged", { encoding: "utf-8" });
        }
        return execSync(`git diff ${ref}`, { encoding: "utf-8" });
    } catch (e) {
        throw new Error(`Failed to get diff: ${(e as Error).message}`);
    }
}

export function getStagedFiles(): string[] {
    try {
        const output = execSync("git diff --staged --name-only", { encoding: "utf-8" });
        return output.trim().split("\n").filter(Boolean);
    } catch (e) {
        throw new Error(`Failed to get staged files: ${(e as Error).message}`);
    }
}