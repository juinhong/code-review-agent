const INJECTION_PATTERNS = [
    /ignore previous instructions/gi,
    /disregard your system prompt/gi,
    /you are now/gi,
    /act as/gi,
    /forget everything/gi,
];

/**
 * Redacts common prompt injection patterns from user-provided content.
 * Note: This is a best-effort mitigation — full prompt injection prevention
 * is an unsolved problem in agentic AI. Additional defenses include XML delimiters,
 * read-only tools, and safePath sandboxing.
 */
export function sanitizeContent(content: string): string {
    let sanitized = content;
    for (const pattern of INJECTION_PATTERNS) {
        sanitized = sanitized.replace(pattern, "[redacted]");
    }
    return sanitized;
}