import { generateText, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { readFileTool } from "./tools/read_file";
import { listFilesTool } from "./tools/list_files";
import { codeSearchTool } from "./tools/code_search";
import { ReviewResult, ReviewResultSchema } from "./schema";

export async function runAgent(filePath: string): Promise<ReviewResult> {
    const result = await generateText({
        model: google("gemini-2.5-flash"),
        stopWhen: stepCountIs(10),
        tools: {
            readFile: readFileTool,
            list_files: listFilesTool,
            code_search: codeSearchTool,
        },
        prompt: `You are an expert code reviewer. Review the file at path: ${filePath}.
Use the read_file tool to read it. Use list_files and code_search if you need more context.

After reviewing, respond ONLY with a JSON object — no markdown, no backticks, no explanation.
The JSON must match this exact shape:
{
  "bugs": ["..."],
  "suggestions": ["..."],
  "securityConcerns": ["..."],
  "summary": "..."
}

If there are no items for a category, return an empty array.`,
    });

    const cleaned = result.text.replace(/```json|```/g, "").trim();
    const parsed = ReviewResultSchema.parse(JSON.parse(cleaned));
    return parsed;
}