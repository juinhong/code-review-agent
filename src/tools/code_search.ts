import { tool } from "ai";
import { z } from "zod";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export const codeSearchTool = tool({
    description: "Search for a keyword or pattern across all files in a directory. Returns matching lines with their file path and line number.",
    parameters: z.object({
        path: z.string().describe("Relative path to the directory to search in"),
        pattern: z.string().describe("The keyword or string to search for"),
    }),
    execute: async ({ path, pattern }) => {
        try {
            const results: string[] = [];

            const walk = (dir: string) => {
                const entries = readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = join(dir, entry.name);
                    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
                        walk(fullPath);
                    } else if (entry.isFile()) {
                        const lines = readFileSync(fullPath, "utf-8").split("\n");
                        lines.forEach((line, i) => {
                            if (line.includes(pattern)) {
                                results.push(`${fullPath}:${i + 1}: ${line.trim()}`);
                            }
                        });
                    }
                }
            };

            walk(path);
            return results.length > 0 ? results.join("\n") : `No matches found for "${pattern}"`;
        } catch (e) {
            return `Error searching: ${(e as Error).message}`;
        }
    }
})