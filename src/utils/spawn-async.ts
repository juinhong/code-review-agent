import { spawn } from "child_process";

export function spawnAsync(cmd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, args);
        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (data: Buffer) => (stdout += data.toString()));
        proc.stderr.on("data", (data: Buffer) => (stderr += data.toString()));

        proc.on("close", (code) => {
            if (code !== 0) reject(new Error(`git failed: ${stderr}`));
            else resolve(stdout);
        });

        proc.on("error", reject);
    });
}