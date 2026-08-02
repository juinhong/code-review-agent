import { readFileSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";

const IMPORT_REGEX = /from\s+['"](\.[^'"]+)['"]/g;

export function resolveImports(filePath: string): string[] {
    const resolvedFile = resolve(filePath);
    const dir = dirname(resolvedFile);

    let content: string;
    try {
        content = readFileSync(resolvedFile, "utf-8");
    } catch {
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