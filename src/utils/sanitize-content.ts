const INJECTION_PATTERNS = [
    /ignore previous instructions/gi,
    /disregard your system prompt/gi,
    /you are now/gi,
    /act as/gi,
    /forget everything/gi,
];

export function sanitizeContent(content: string): string {
    let sanitized = content;
    for (const pattern of INJECTION_PATTERNS) {
        sanitized = sanitized.replace(pattern, "[redacted]");
    }
    return sanitized;
}