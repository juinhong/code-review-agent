import { readFileTool } from "./read_file.js";
import { listFilesTool } from "./list_files.js";
import { codeSearchTool } from "./code_search.js";

async function runTests() {
    console.log("--- read_file ---");
    const fileResult = await readFileTool.execute({ path: "src/index.ts" }, {} as any);
    console.log(fileResult ? "✅ returned content" : "❌ empty result");

    console.log("\n--- list_files ---");
    const listResult = await listFilesTool.execute({ path: "src" }, {} as any);
    console.log(listResult.includes("index.ts") ? "✅ found index.ts" : "❌ missing files");
    console.log(listResult);

    console.log("\n--- code_search ---");
    const searchResult = await codeSearchTool.execute({ path: "src", pattern: "runAgent" }, {} as any);
    console.log(searchResult.includes("runAgent") ? "✅ found pattern" : "❌ pattern not found");
    console.log(searchResult);
}

runTests().catch(console.error);