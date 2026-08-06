import { resolve } from "path";
import { realpathSync } from "fs";

/**
 * Resolves and validates a file path to ensure it stays within the project root.
 * Prevents directory traversal attacks (e.g. ../../etc/passwd) and symlink traversal.
 */
export function safePath(filePath: string): string {
    const projectRoot = realpathSync(resolve(process.cwd()));

    let resolved: string;
    try {
        resolved = realpathSync(resolve(filePath));
    } catch {
        // file doesn't exist yet — fall back to resolve without symlink resolution
        resolved = resolve(filePath);
    }

    if (!resolved.startsWith(projectRoot)) {
        throw new Error(`Access denied: ${filePath} is outside the project directory`);
    }

    return resolved;
}