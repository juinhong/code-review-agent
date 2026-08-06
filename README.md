# code-review-agent

An AI-powered code review CLI that uses an agent loop to read your codebase and output structured reviews covering bugs, suggestions, and security concerns.

Built with TypeScript, Vercel AI SDK, and Gemini 2.5 Flash.

## Installation

```bash
npm install -g code-review-agent
```

Set your Gemini API key:

```bash
export GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
```

## Usage

### Review a single file
```bash
code-review-agent src/index.ts
```

### Review staged changes as a diff
```bash
code-review-agent --staged
```

### Review each staged file individually
```bash
code-review-agent --staged-files
```

### Review a specific commit or branch diff
```bash
code-review-agent --diff HEAD~1
code-review-agent --diff main...feat/my-branch
```

### Install as a pre-commit hook
```bash
code-review-agent --install-hook
```

Once installed, the agent runs automatically on every commit and blocks it if critical issues are found.

## Configuration

Create a `.reviewrc.json` in your project root to customise behaviour:

```json
{
  "model": "gemini-2.5-flash",
  "ignore": ["dist/**", "**/*.test.ts"],
  "focus": ["security", "performance"],
  "maxSteps": 10
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `model` | `gemini-2.5-flash` | Gemini model to use |
| `ignore` | `[]` | Glob patterns for files to skip |
| `focus` | `[]` | Areas to focus the review on |
| `maxSteps` | `10` | Max agent loop steps |

## Output

Findings are grouped by category and sorted by severity:

🔍 Code Review

🐛 Bugs:
🔴 CRITICAL (line 23) — SQL query constructed from unsanitised input

💡 Suggestions:
🟡 WARNING (line 45) — Consider extracting this logic into a helper function
🔵 INFO (line 12) — Unused import

🔒 Security Concerns:
🔴 CRITICAL (line 23) — Potential SQL injection vulnerability

📝 Summary:
The file has a critical SQL injection vulnerability on line 23...


## Security

- File system access is sandboxed to the project directory via path validation
- Git refs are validated against a whitelist before execution
- Prompt injection mitigations are in place for diff and file content
- All tools are read-only — the agent can never modify or delete files

## Requirements

- Node.js >= 22
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

## License

MIT