import { tool } from "ai";
import { z } from "zod";
import { readFileSync } from "fs";

export const readFileTool = tool({
    description: "Read the contents of a file at the given path. Use this to inspect source code before reviewing it.",
    parameters: z.object({
        path: z.string().describe("Relative path to the file"),
    }),
    execute: async ({ path }) => {
        try {
            return readFileSync(path, "utf-8");
        } catch (e) {
            return `Error reading file: ${(e as Error).message}`
        }
    },
});