import { execSync, spawnSync } from "child_process";

export function getDiff(ref: "staged" | string): string {
    if (ref === "staged") {
        const result = spawnSync("git", ["diff", "--staged"], { encoding: "utf-8" });
        if (result.error) throw new Error(`Failed to get diff: ${result.error.message}`);
        if (result.status !== 0) throw new Error(`git diff failed: ${result.stderr}`);
        return result.stdout;
    }

    // validate ref — only allow safe git ref characters
    if (!/^[a-zA-Z0-9._/~^:\-]+$/.test(ref)) {
        throw new Error(`Invalid git ref: ${ref}`);
    }

    const result = spawnSync("git", ["diff", ref], { encoding: "utf-8" });
    if (result.error) throw new Error(`Failed to get diff: ${result.error.message}`);
    if (result.status !== 0) throw new Error(`git diff failed: ${result.stderr}`);
    return result.stdout;
}

export function getStagedFiles(): string[] {
    try {
        const output = execSync("git diff --staged --name-only", { encoding: "utf-8" });
        return output.trim().split("\n").filter(Boolean);
    } catch (e) {
        throw new Error(`Failed to get staged files: ${(e as Error).message}`);
    }
}