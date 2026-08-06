import { readFileSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";

const IMPORT_REGEX = /from\s+['"](\.[^'"]+)['"]/g;

/**
 * Extracts and resolves relative TypeScript imports from a file.
 * Note: filePath must be pre-validated with safePath() before calling this function.
 * Resolved import paths are validated with safePath() by the caller before use.
 */
export function resolveImports(filePath: string): string[] {
    const resolvedFile = resolve(filePath);
    const dir = dirname(resolvedFile);

    let content: string;
    try {
        content = readFileSync(resolvedFile, "utf-8");
    } catch (e) {
        console.warn(`⚠️  Could not read file for import resolution: ${resolvedFile}`);
        return [];
    }

    const imports: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = IMPORT_REGEX.exec(content)) !== null) {
        const rawImport = match[1];

        // strip .js extension since source files are .ts
        const withoutExt = rawImport.replace(/\.js$/, "");
        const candidate = resolve(join(dir, withoutExt + ".ts"));

        if (existsSync(candidate)) {
            imports.push(candidate);
        }
    }

    return imports;
}