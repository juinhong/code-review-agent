import { spawnAsync } from "./utils/spawn-async.js";

const SAFE_REF_REGEX = /^[a-zA-Z0-9._/~^:\-]+$/;

export async function getDiff(ref: "staged" | string): Promise<string> {
    if (ref === "staged") {
        return spawnAsync("git", ["diff", "--staged"]);
    }

    // validate ref — only allow safe git ref characters
    if (!SAFE_REF_REGEX.test(ref)) {
        throw new Error(`Invalid git ref: ${ref}`);
    }

    return spawnAsync("git", ["diff", ref]);
}

export async function getStagedFiles(): Promise<string[]> {
    const stdout = await spawnAsync("git", ["diff", "--staged", "--name-only"]);
    return stdout.trim().split("\n").filter(Boolean);
}