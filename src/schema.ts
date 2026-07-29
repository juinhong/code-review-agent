import { z } from "zod";

export const FindingSchema = z.object({
    severity: z.enum(["critical", "warning", "info"]),
    message: z.string(),
    line: z.number().optional()
})

export const ReviewResultSchema = z.object({
    bugs: z.array(FindingSchema),
    suggestions: z.array(FindingSchema),
    securityConcerns: z.array(FindingSchema),
    summary: z.string()
});

export type Finding = z.infer<typeof FindingSchema>;
export type ReviewResult = z.infer<typeof ReviewResultSchema>;