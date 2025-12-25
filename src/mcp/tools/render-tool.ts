import { renderMermaidToSvg } from '@/core/diagram/render';
import { sanitizeSvg } from '@/core/security/sanitize';

/**
 * MCP tool handler for render operation
 * Renders Mermaid diagram to sanitized SVG for inline display
 */
export async function handleRenderTool(code: string) {
  if (!code || typeof code !== 'string') {
    throw new Error('Missing or invalid required parameter: code');
  }

  // Render the diagram
  const rawSvg = await renderMermaidToSvg(code);
  
  // Sanitize the output
  const svg = sanitizeSvg(rawSvg);
  
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ svg }, null, 2),
      },
    ],
  };
}

