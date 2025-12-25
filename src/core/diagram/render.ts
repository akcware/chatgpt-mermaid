import mermaid from 'mermaid';
import { initializeMermaid } from './init';
import { verifyMermaidCode } from './verify';

// Initialize once when module is loaded
initializeMermaid();

/**
 * Render Mermaid code to SVG
 * @param code - Mermaid diagram code
 * @returns SVG string
 * @throws Error if rendering fails
 */
export async function renderMermaidToSvg(code: string): Promise<string> {
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid input: code must be a non-empty string');
  }

  if (code.length > 50000) {
    throw new Error('Code exceeds maximum length of 50KB');
  }

  try {
    // First verify the code
    const verification = await verifyMermaidCode(code);
    if (!verification.ok) {
      throw new Error(verification.error);
    }

    // Generate unique ID for this render
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Render to SVG
    const { svg } = await mermaid.render(id, code);
    
    return svg;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to render Mermaid diagram';
    throw new Error(errorMessage);
  }
}

