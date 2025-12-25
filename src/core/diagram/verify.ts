import mermaid from 'mermaid';
import { initializeMermaid } from './init';

// Initialize once when module is loaded
initializeMermaid();

/**
 * Verify Mermaid code syntax without rendering
 * @param code - Mermaid diagram code
 * @returns { ok: true } if valid, { ok: false, error: string } if invalid
 */
export async function verifyMermaidCode(
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!code || typeof code !== 'string') {
    return { ok: false, error: 'Invalid input: code must be a non-empty string' };
  }

  if (code.length > 50000) {
    return { ok: false, error: 'Code exceeds maximum length of 50KB' };
  }

  try {
    // Use Mermaid's parse function to validate syntax
    await mermaid.parse(code);
    return { ok: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid Mermaid syntax';
    return { ok: false, error: errorMessage };
  }
}

