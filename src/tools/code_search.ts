import { tool, zodSchema } from "ai";
import { z } from "zod";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { safePath } from "../utils/safe-path.js";

export const codeSearchTool = tool({
    description: "Search for a keyword or pattern across all files in a directory. Returns matching lines with their file path and line number.",
    inputSchema: zodSchema(z.object({
        path: z.string().describe("Relative path to the directory to search in"),
        pattern: z.string().describe("The keyword or string to search for"),
    })),
    execute: async ({ path, pattern }: { path: string; pattern: string }) => {
        try {
            const safeDir = safePath(path);
            const results: string[] = [];

            const visited = new Set<string>();

            const walk = (dir: string) => {
                if (visited.has(dir)) return;
                visited.add(dir);

                let entries;
                try {
                    entries = readdirSync(dir, { withFileTypes: true });
                } catch {
                    return; // skip unreadable directories
                }

                for (const entry of entries) {
                    const fullPath = join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (entry.name !== "node_modules" && entry.name !== ".git") {
                            walk(fullPath);
                        }
                    } else if (entry.isFile()) {
                        try {
                            const lines = readFileSync(fullPath, "utf-8").split("\n");
                            lines.forEach((line, i) => {
                                if (line.includes(pattern)) {
                                    results.push(`${fullPath}:${i + 1}: ${line.trim()}`);
                                }
                            });
                        } catch {
                            // skip unreadable files
                        }
                    }
                }
            };

            walk(safeDir);
            return results.length > 0 ? results.join("\n") : `No matches found for "${pattern}"`;
        } catch (e) {
            return `Error searching: ${(e as Error).message}`;
        }
    }
})