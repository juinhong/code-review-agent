import { generateText, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { readFileTool } from "./tools/read_file";
import { listFilesTool } from "./tools/list_files";
import { codeSearchTool } from "./tools/code_search";

export async function runAgent(filePath: string): Promise<string> {
    const result = await generateText({
        model: google("gemini-2.5-flash"),
        stopWhen: stepCountIs(10),
        tools: {
            readFile: readFileTool,
            list_files: listFilesTool,
            code_search: codeSearchTool,
        },
        prompt: `You are a code reviewer. The user wants you to review the file at path: ${filePath}.
Use the available tools to read and explore the codebase as needed, then give a brief summary of what the file does.
After reading the file, you MUST write a response summarizing what you found.`,
    });

    return result.text;
}