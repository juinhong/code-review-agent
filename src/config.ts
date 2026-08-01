import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

const ConfigSchema = z.object({
    model: z.string().default("gemini-2.5-flash"),
    ignore: z.array(z.string()).default([]),
    focus: z.array(z.string()).default([]),
    maxSteps: z.number().default(10),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
    const cwd = process.cwd();
    const configPath = join(cwd, ".reviewrc.json");

    if (!existsSync(configPath)) {
        return ConfigSchema.parse({});
    }

    try {
        const raw = JSON.parse(readFileSync(configPath, "utf-8"));
        return ConfigSchema.parse(raw);
    } catch (e) {
        console.warn("⚠️  Invalid .reviewrc.json — using defaults");
        return ConfigSchema.parse({});
    }
}