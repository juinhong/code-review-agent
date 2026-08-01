import { resolve } from "path";

export function safePath(filePath: string): string {
    const projectRoot = resolve(process.cwd());
    const resolved = resolve(filePath);

    if (!resolved.startsWith(projectRoot)) {
        throw new Error(
            `Access denied: ${filePath} is outside the project directory`
        );
    }

    return resolved;
}