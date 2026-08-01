import { tool, zodSchema } from "ai";
import { z } from "zod";
import { readdirSync } from "fs";
import { join } from "path";
import { safePath } from "../utils/safe-path.js"

export const listFilesTool = tool({
    description: "List all files in a directory recursively. Use this to understand the structure of a codebase before reading specific files.",
    inputSchema: zodSchema(z.object({
        path: z.string().describe("Relative path to the directory to list"),
    })),
    execute: async ({ path }: { path: string }) => {
        try {
            const safeDir = safePath(path);
            const results: string[] = []

            const walk = (dir: string) => {
                const entries = readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = join(dir, entry.name);
                    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
                        walk(fullPath);
                    } else if (entry.isFile()) {
                        results.push(fullPath);
                    }
                }
            };

            walk(safeDir);
            return results.join("\n");
        } catch (e) {
            return `Error listing files: ${(e as Error).message}`;
        }
    },
});