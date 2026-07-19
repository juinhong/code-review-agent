import { generateText, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { readFileTool } from "./tools/read_file";

export async function runAgent(filePath: string): Promise<string> {
    const result = await generateText({
        model: google("gemini-2.5-flash"),
        stopWhen: stepCountIs(10),
        tools: { readFile: readFileTool },
        prompt: `You are a code reviewer. The user wants you to review the file at path: ${filePath}.
Read it using the read_file tool, then give a brief summary of what the file does.
After reading the file, you MUST write a response summarizing what you found.`,
    });

    return result.text;
}