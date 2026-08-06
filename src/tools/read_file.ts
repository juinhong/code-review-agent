import { tool, zodSchema } from "ai";
import { z } from "zod";
import { readFileSync } from "fs";
import { safePath } from "../utils/safe-path.js";

export const readFileTool = tool({
    description: "Read the contents of a file at the given path. Use this to inspect source code before reviewing it.",
    inputSchema: zodSchema(z.object({
        path: z.string().describe("Relative path to the file to read"),
    })),
    execute: ({ path }: { path: string }) => {
        try {
            const safe = safePath(path);
            return readFileSync(safe, "utf-8");
        } catch (e) {
            return `Error reading file: ${(e as Error).message}`;
        }
    },
});