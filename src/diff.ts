import { spawn } from "child_process";

const SAFE_REF_REGEX = /^[a-zA-Z0-9._/~^:\-]+$/;

function spawnAsync(cmd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, args);
        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (data: Buffer) => (stdout += data.toString()));
        proc.stderr.on("data", (data: Buffer) => (stderr += data.toString()));

        proc.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`git failed: ${stderr}`));
            } else {
                resolve(stdout);
            }
        });

        proc.on("error", reject);
    })
}

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