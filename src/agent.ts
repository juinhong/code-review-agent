import { generateText, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { readFileTool } from "./tools/read_file";
import { listFilesTool } from "./tools/list_files";
import { codeSearchTool } from "./tools/code_search";
import { ReviewResult, ReviewResultSchema } from "./schema";
import { existsSync, readFileSync } from "node:fs";
import { loadConfig } from "./config";

type AgentInput =
    | { mode: "file"; content: string }
    | { mode: "diff"; content: string };

export async function runAgent(input: AgentInput): Promise<ReviewResult> {
    const config = loadConfig();

    // skip ignored paths in file mode
    if (input.mode === "file") {
        const filePath = input.content;

        const isIgnored = config.ignore.some((pattern) =>
            filePath.includes(pattern.replace("*", "")));
        if (isIgnored) {
            throw new Error(`File is ignored by config: ${filePath}`);
        }

        // File not found
        if (!existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        // Binary file (check for null bytes)
        const raw = readFileSync(filePath);
        if (raw.includes(0x00)) {
            throw new Error(`Binary files are not supported: ${filePath}`);
        }

        // Empty file
        if (raw.length === 0) {
            throw new Error(`File is empty: ${filePath}`);
        }
    }

    const focusInstruction = config.focus.length > 0
        ? `Focus especially on: ${config.focus.join(", ")}.`
        : "";

    const sharedOutputInstruction = `${focusInstruction}
After reviewing, respond ONLY with a JSON object — no markdown, no backticks, no explanation.
The JSON must match this exact shape:
{
  "bugs": [{ "severity": "critical" | "warning" | "info", "message": "...", "line": 12 }],
  "suggestions": [{ "severity": "critical" | "warning" | "info", "message": "...", "line": 12 }],
  "securityConcerns": [{ "severity": "critical" | "warning" | "info", "message": "...", "line": 12 }],
  "summary": "..."
}
"line" is optional — only include it if you can identify the specific line number.
If there are no items for a category, return an empty array.`;

    var prompt: string
    if (input.mode === "file") {
        prompt = `You are an expert code reviewer. Review the file at path: ${input.content}.
Use the read_file tool to read it. Use list_files and code_search if you need more context.
${sharedOutputInstruction}`
    } else {
        prompt = `You are an expert code reviewer. Review the following git diff:

${input.content}

Focus only on what changed.
${sharedOutputInstruction}`
    }

    const result = await generateText({
        model: google(config.model),
        stopWhen: stepCountIs(config.maxSteps),
        tools: {
            readFile: readFileTool,
            list_files: listFilesTool,
            code_search: codeSearchTool,
        },
        prompt,
    });

    const cleaned = result.text.replace(/```json|```/g, "").trim();
    const parsed = ReviewResultSchema.parse(JSON.parse(cleaned));
    return parsed;
}