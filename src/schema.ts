import { z } from "zod";

export const ReviewResultSchema = z.object({
    bugs: z.array(z.string()).describe("Bugs or errors found in the code"),
    suggestions: z.array(z.string()).describe("Improvements or refactoring ideas"),
    securityConcerns: z.array(z.string()).describe("Security vulnerabilities or risks"),
    summary: z.string().describe("A short overall summary of the code quality"),
});

export type ReviewResult = z.infer<typeof ReviewResultSchema>